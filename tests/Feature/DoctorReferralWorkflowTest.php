<?php

use App\Enums\DoctorVerificationStatus;
use App\Enums\LabResultStatus;
use App\Enums\OrderPriority;
use App\Enums\ReferralDiscountScope;
use App\Enums\ReferralDiscountType;
use App\Enums\UserRole;
use App\Events\DoctorReferralCreated;
use App\Models\Branch;
use App\Models\DoctorProfile;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\ReferralDiscountRule;
use App\Models\Test as LabTest;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

function createVerifiedDoctor(): User
{
    $doctor = User::factory()->create();
    $doctor->forceFill(['role' => UserRole::Doctor])->save();
    DoctorProfile::query()->create([
        'user_id' => $doctor->id,
        'phone' => '01012345678',
        'specialty' => 'Internal medicine',
        'license_number' => 'MED-'.$doctor->id,
        'verification_status' => DoctorVerificationStatus::Verified,
        'verified_by' => User::factory()->create()->id,
        'verified_at' => now(),
    ]);

    return $doctor;
}

function createDefaultDoctorReferralDiscount(): ReferralDiscountRule
{
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();

    return ReferralDiscountRule::factory()->create([
        'name' => 'Default doctor referral discount',
        'discount_type' => ReferralDiscountType::Percentage,
        'discount_value' => '10.00',
        'referral_scope' => ReferralDiscountScope::AllReferrals,
        'created_by' => $admin->id,
    ]);
}

function createDoctorReferralPayload(Branch $branch, LabTest $test, array $overrides = []): array
{
    return array_merge([
        'request_key' => (string) Str::uuid(),
        'patient_full_name' => 'Referral Patient',
        'patient_phone' => '01098765432',
        'branch_id' => $branch->id,
        'test_ids' => [$test->id],
        'priority' => OrderPriority::Normal->value,
    ], $overrides);
}

it('allows a verified doctor to submit a referral with catalog pricing and attribution', function () {
    $doctor = createVerifiedDoctor();
    createDefaultDoctorReferralDiscount();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '175.50']);
    Sanctum::actingAs($doctor);

    $response = $this->postJson('/api/v1/doctor/orders', createDoctorReferralPayload($branch, $test));

    $response->assertCreated()
        ->assertJsonPath('data.priority', OrderPriority::Normal->value)
        ->assertJsonPath('data.subtotal', '175.50')
        ->assertJsonPath('data.discount_amount', '17.55')
        ->assertJsonPath('data.total', '157.95')
        ->assertJsonPath(
            'data.order_number',
            'LAB-'.str_pad((string) $response->json('data.id'), 6, '0', STR_PAD_LEFT),
        )
        ->assertJsonPath('data.items.0.test_name', $test->name);

    $this->getJson('/api/v1/doctor/orders?search='.$response->json('data.order_number'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $response->json('data.id'));

    $this->assertDatabaseHas('orders', [
        'id' => $response->json('data.id'),
        'patient_id' => Patient::query()->where('phone', '01098765432')->value('id'),
        'branch_id' => $branch->id,
        'created_by' => $doctor->id,
        'referring_doctor_id' => $doctor->id,
        'source' => 'doctor',
        'subtotal' => '175.50',
        'discount_amount' => '17.55',
        'total' => '157.95',
    ]);
    $this->assertDatabaseHas('order_items', [
        'test_id' => $test->id,
        'price' => '175.50',
    ]);
});

it('broadcasts a private branch event with no patient details after creating a referral', function () {
    $doctor = createVerifiedDoctor();
    createDefaultDoctorReferralDiscount();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create();
    Sanctum::actingAs($doctor);
    Event::fake([DoctorReferralCreated::class]);

    $response = $this->postJson(
        '/api/v1/doctor/orders',
        createDoctorReferralPayload($branch, $test),
    );
    $response->assertCreated();
    $order = Order::query()->findOrFail($response->json('data.id'));

    Event::assertDispatched(
        DoctorReferralCreated::class,
        fn (DoctorReferralCreated $event): bool => $event->broadcastOn()[0]->name ===
                "private-branches.{$branch->id}.orders"
            && $event->broadcastWith() === [
                'order_id' => $order->id,
                'branch_id' => $branch->id,
                'order_number' => $response->json('data.order_number'),
                'created_at' => $order->created_at->toISOString(),
            ],
    );
});

it('broadcasts only once when a doctor retries the same referral request', function () {
    $doctor = createVerifiedDoctor();
    createDefaultDoctorReferralDiscount();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create();
    $payload = createDoctorReferralPayload($branch, $test);
    Sanctum::actingAs($doctor);
    Event::fake([DoctorReferralCreated::class]);

    $firstResponse = $this->postJson('/api/v1/doctor/orders', $payload);
    $retryResponse = $this->postJson('/api/v1/doctor/orders', $payload);

    $firstResponse->assertCreated();
    $retryResponse->assertOk()
        ->assertJsonPath('data.id', $firstResponse->json('data.id'));
    $this->assertDatabaseCount('orders', 1);
    Event::assertDispatchedTimes(DoctorReferralCreated::class, 1);
});

it('rejects doctor referrals unless the account is verified', function (DoctorVerificationStatus $status) {
    $doctor = User::factory()->create();
    $doctor->forceFill(['role' => UserRole::Doctor])->save();
    DoctorProfile::query()->create([
        'user_id' => $doctor->id,
        'phone' => '01012345678',
        'specialty' => 'Internal medicine',
        'license_number' => 'MED-'.$doctor->id,
        'verification_status' => $status,
    ]);
    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', createDoctorReferralPayload($branch, $test))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('doctor');

    $this->assertDatabaseCount('orders', 0);
})->with([
    'pending' => DoctorVerificationStatus::Pending,
    'rejected' => DoctorVerificationStatus::Rejected,
    'suspended' => DoctorVerificationStatus::Suspended,
]);

it('requires laboratory administrator approval and captures rejection or suspension feedback', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $doctor = User::factory()->create();
    $doctor->forceFill(['role' => UserRole::Doctor])->save();
    DoctorProfile::query()->create([
        'user_id' => $doctor->id,
        'phone' => '01012345678',
        'specialty' => 'Internal medicine',
        'license_number' => 'MED-'.$doctor->id,
    ]);
    Sanctum::actingAs($staff);

    $this->patchJson("/api/v1/doctors/{$doctor->id}/verification", [
        'verification_status' => DoctorVerificationStatus::Verified->value,
    ])->assertForbidden();

    Sanctum::actingAs($admin);

    $this->patchJson("/api/v1/doctors/{$doctor->id}/verification", [
        'verification_status' => DoctorVerificationStatus::Rejected->value,
    ])->assertUnprocessable()->assertJsonValidationErrors('verification_note');

    $this->patchJson("/api/v1/doctors/{$doctor->id}/verification", [
        'verification_status' => DoctorVerificationStatus::Verified->value,
    ])->assertOk()->assertJsonPath(
        'data.verification_status',
        DoctorVerificationStatus::Verified->value,
    );

    $this->assertDatabaseHas('doctor_profiles', [
        'user_id' => $doctor->id,
        'verification_status' => DoctorVerificationStatus::Verified->value,
        'verified_by' => $admin->id,
    ]);
});

it('preserves urgent referral priority and requires a reason', function () {
    $doctor = createVerifiedDoctor();
    createDefaultDoctorReferralDiscount();
    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($doctor);

    $payload = createDoctorReferralPayload($branch, $test, [
        'priority' => OrderPriority::Urgent->value,
        'urgent_reason' => 'Patient requires urgent clinical assessment.',
    ]);

    $response = $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertCreated()
        ->assertJsonPath('data.priority', OrderPriority::Urgent->value)
        ->assertJsonPath('data.urgent_reason', $payload['urgent_reason']);

    $this->assertDatabaseHas('orders', [
        'id' => $response->json('data.id'),
        'priority' => OrderPriority::Urgent->value,
        'urgent_reason' => $payload['urgent_reason'],
    ]);

    $payload['request_key'] = (string) Str::uuid();
    unset($payload['urgent_reason']);

    $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('urgent_reason');
});

it('rejects inactive tests and inactive branches', function () {
    $doctor = createVerifiedDoctor();
    $branch = Branch::factory()->create();
    $inactiveBranch = Branch::factory()->create(['is_active' => false]);
    $inactiveTest = LabTest::factory()->create(['is_active' => false]);
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', createDoctorReferralPayload($branch, $inactiveTest))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('test_ids');

    $this->postJson('/api/v1/doctor/orders', createDoctorReferralPayload($inactiveBranch, LabTest::factory()->create()))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('branch_id');

    $this->assertDatabaseCount('orders', 0);
});

it('returns only the current doctor requests and hides another doctors order', function () {
    $doctor = createVerifiedDoctor();
    $otherDoctor = createVerifiedDoctor();
    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create();
    $patient = Patient::factory()->create();
    $ownOrder = Order::factory()->create([
        'patient_id' => $patient->id,
        'created_by' => $doctor->id,
        'referring_doctor_id' => $doctor->id,
        'source' => 'doctor',
    ]);
    $otherOrder = Order::factory()->create([
        'created_by' => $otherDoctor->id,
        'referring_doctor_id' => $otherDoctor->id,
        'source' => 'doctor',
    ]);
    OrderItem::factory()->create(['order_id' => $ownOrder->id, 'test_id' => $test->id]);
    Sanctum::actingAs($doctor);

    $this->getJson('/api/v1/doctor/orders')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $ownOrder->id);

    $this->getJson("/api/v1/doctor/orders/{$otherOrder->id}")->assertNotFound();
});

it('does not expose unreleased or another doctors result and streams authorized PDFs', function () {
    $doctor = createVerifiedDoctor();
    createDefaultDoctorReferralDiscount();
    $otherDoctor = createVerifiedDoctor();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $test = LabTest::factory()->create();
    $order = Order::factory()->create([
        'patient_id' => $patient->id,
        'created_by' => $doctor->id,
        'referring_doctor_id' => $doctor->id,
        'source' => 'doctor',
    ]);
    $item = OrderItem::factory()->create(['order_id' => $order->id, 'test_id' => $test->id]);
    $draft = LabResult::factory()->create([
        'order_item_id' => $item->id,
        'status' => LabResultStatus::Draft,
    ]);
    $otherOrder = Order::factory()->create([
        'created_by' => $otherDoctor->id,
        'referring_doctor_id' => $otherDoctor->id,
        'source' => 'doctor',
    ]);
    $otherItem = OrderItem::factory()->create(['order_id' => $otherOrder->id, 'test_id' => $test->id]);
    $otherResult = LabResult::factory()->create([
        'order_item_id' => $otherItem->id,
        'status' => LabResultStatus::Approved,
    ]);
    $releasedItem = OrderItem::factory()->create(['order_id' => $order->id, 'test_id' => $test->id]);
    $released = LabResult::factory()->create([
        'order_item_id' => $releasedItem->id,
        'status' => LabResultStatus::Approved,
        'value' => '7.5',
    ]);
    Sanctum::actingAs($doctor);

    $this->getJson("/api/v1/doctor/results/{$draft->id}")->assertNotFound();
    $this->getJson("/api/v1/doctor/results/{$otherResult->id}")->assertNotFound();

    $this->get("/api/v1/doctor/results/{$released->id}/pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertHeader('content-disposition', 'attachment; filename=lab-result-'.$released->id.'.pdf');
});

it('returns a previously-created referral for a repeated request key', function () {
    $doctor = createVerifiedDoctor();
    createDefaultDoctorReferralDiscount();
    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create();
    $payload = createDoctorReferralPayload($branch, $test);
    Sanctum::actingAs($doctor);

    $created = $this->postJson('/api/v1/doctor/orders', $payload)->assertCreated();
    $replayed = $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertOk()
        ->assertJsonPath('data.id', $created->json('data.id'));

    expect($replayed->json('data.id'))->toBe($created->json('data.id'));
    $this->assertDatabaseCount('orders', 1);
});
