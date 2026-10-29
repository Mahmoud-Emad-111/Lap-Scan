<?php

use App\Enums\DoctorVerificationStatus;
use App\Enums\ReferralDiscountScope;
use App\Enums\ReferralDiscountType;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\DoctorProfile;
use App\Models\Order;
use App\Models\Patient;
use App\Models\ReferralDiscountRule;
use App\Models\Test as LabTest;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

function createVerifiedDiscountDoctor(): User
{
    $doctor = User::factory()->create();
    $doctor->forceFill(['role' => UserRole::Doctor])->save();
    DoctorProfile::query()->create([
        'user_id' => $doctor->id,
        'phone' => '011'.str_pad((string) $doctor->id, 8, '0', STR_PAD_LEFT),
        'specialty' => 'Internal medicine',
        'license_number' => 'DISC-'.$doctor->id,
        'verification_status' => DoctorVerificationStatus::Verified,
        'verified_by' => User::factory()->create()->id,
        'verified_at' => now(),
    ]);

    return $doctor;
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function referralDiscountPayload(Branch $branch, LabTest $test, array $overrides = []): array
{
    return array_merge([
        'request_key' => (string) Str::uuid(),
        'patient_full_name' => 'Discount Patient',
        'patient_phone' => '01098765432',
        'branch_id' => $branch->id,
        'test_ids' => [$test->id],
        'priority' => 'normal',
    ], $overrides);
}

/**
 * @param  array<string, mixed>  $overrides
 */
function createReferralDiscountRule(User $admin, array $overrides = []): ReferralDiscountRule
{
    return ReferralDiscountRule::factory()->create(array_merge([
        'name' => 'Doctor referral discount',
        'discount_type' => ReferralDiscountType::Percentage,
        'discount_value' => '10.00',
        'referral_scope' => ReferralDiscountScope::AllReferrals,
        'created_by' => $admin->id,
    ], $overrides));
}

it('allows only a laboratory administrator to manage referral discount rules', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $payload = [
        'name' => 'New referral discount',
        'discount_type' => 'percentage',
        'discount_value' => '15.00',
        'minimum_subtotal' => null,
        'maximum_discount' => null,
        'valid_from' => null,
        'valid_until' => null,
        'doctor_id' => null,
        'branch_id' => null,
        'referral_scope' => 'all_referrals',
        'is_active' => true,
    ];

    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/referral-discount-rules')->assertForbidden();
    $this->postJson('/api/v1/referral-discount-rules', $payload)->assertForbidden();

    Sanctum::actingAs($admin);

    $created = $this->postJson('/api/v1/referral-discount-rules', $payload)
        ->assertCreated()
        ->assertJsonPath('data.discount_type', 'percentage')
        ->assertJsonPath('data.created_by', $admin->id);

    $this->assertDatabaseHas('referral_discount_rules', [
        'name' => 'New referral discount',
        'created_by' => $admin->id,
    ]);

    Sanctum::actingAs($staff);

    $this->putJson(
        '/api/v1/referral-discount-rules/'.$created->json('data.id'),
        array_merge($payload, ['is_active' => false]),
    )->assertForbidden();

    Sanctum::actingAs($admin);

    $this->putJson(
        '/api/v1/referral-discount-rules/'.$created->json('data.id'),
        array_merge($payload, ['is_active' => false]),
    )->assertOk()
        ->assertJsonPath('data.is_active', false)
        ->assertJsonPath('data.updated_by', $admin->id);

    $this->assertDatabaseHas('referral_discount_rules', [
        'id' => $created->json('data.id'),
        'is_active' => false,
        'updated_by' => $admin->id,
    ]);
});

it('rejects percentage discounts above one hundred percent', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($admin);

    $this->postJson('/api/v1/referral-discount-rules', [
        'name' => 'Invalid percent',
        'discount_type' => 'percentage',
        'discount_value' => '100.01',
        'referral_scope' => 'all_referrals',
        'is_active' => true,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('discount_value');

    $this->assertDatabaseCount('referral_discount_rules', 0);
});

it('rejects overlapping active rules with the same application priority', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    createReferralDiscountRule($admin, ['doctor_id' => $doctor->id]);
    Sanctum::actingAs($admin);

    $this->postJson('/api/v1/referral-discount-rules', [
        'name' => 'Overlapping rule',
        'discount_type' => 'fixed_amount',
        'discount_value' => '20.00',
        'referral_scope' => 'first_referral',
        'doctor_id' => $doctor->id,
        'is_active' => true,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('valid_from');

    $this->assertDatabaseCount('referral_discount_rules', 1);
});

it('applies a percentage discount cap and preserves the immutable order price snapshot', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '300.00']);
    $rule = createReferralDiscountRule($admin, [
        'discount_value' => '25.00',
        'maximum_discount' => '40.00',
        'doctor_id' => $doctor->id,
        'branch_id' => $branch->id,
    ]);
    Sanctum::actingAs($doctor);

    $response = $this->postJson(
        '/api/v1/doctor/orders',
        referralDiscountPayload($branch, $test),
    )->assertCreated()
        ->assertJsonPath('data.subtotal', '300.00')
        ->assertJsonPath('data.discount_amount', '40.00')
        ->assertJsonPath('data.total', '260.00')
        ->assertJsonPath('data.discount.rule_id', $rule->id)
        ->assertJsonPath('data.discount.discount_amount', '40.00');

    $orderId = $response->json('data.id');
    $rule->update(['discount_value' => '5.00', 'is_active' => false]);

    $order = Order::query()->whereKey($orderId)->firstOrFail();
    expect($order->discount_snapshot['discount_value'])->toBe('25.00');
    expect($order->discount_snapshot['discount_amount'])->toBe('40.00');
    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'discount_rule_id' => $rule->id,
        'subtotal' => '300.00',
        'discount_amount' => '40.00',
        'total' => '260.00',
    ]);
});

it('applies a fixed discount without reducing an order below zero', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '30.00']);
    createReferralDiscountRule($admin, [
        'discount_type' => ReferralDiscountType::FixedAmount,
        'discount_value' => '50.00',
        'branch_id' => $branch->id,
    ]);
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', referralDiscountPayload($branch, $test))
        ->assertCreated()
        ->assertJsonPath('data.subtotal', '30.00')
        ->assertJsonPath('data.discount_amount', '30.00')
        ->assertJsonPath('data.total', '0.00');

    $this->assertDatabaseHas('orders', [
        'subtotal' => '30.00',
        'discount_amount' => '30.00',
        'total' => '0.00',
    ]);
});

it('rejects an order below the minimum subtotal without creating an order', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '99.99']);
    createReferralDiscountRule($admin, ['minimum_subtotal' => '100.00']);
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', referralDiscountPayload($branch, $test))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('discount');

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('patients', 0);
});

it('applies a first-referral rule once for the patient and rejects later referrals without another rule', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '100.00']);
    $patient = Patient::factory()->create(['phone' => '01012345678']);
    createReferralDiscountRule($admin, [
        'discount_value' => '20.00',
        'referral_scope' => ReferralDiscountScope::FirstReferral,
    ]);
    Sanctum::actingAs($doctor);

    $payload = referralDiscountPayload($branch, $test, [
        'patient_id' => $patient->id,
        'patient_phone' => $patient->phone,
    ]);
    $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertCreated()
        ->assertJsonPath('data.discount_amount', '20.00');

    $payload['request_key'] = (string) Str::uuid();
    Sanctum::actingAs(createVerifiedDiscountDoctor());
    $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('discount');

    $this->assertDatabaseCount('orders', 1);
});

it('applies an all-referrals rule to every referral for the patient', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '100.00']);
    $patient = Patient::factory()->create(['phone' => '01012345679']);
    createReferralDiscountRule($admin, ['discount_value' => '10.00']);
    Sanctum::actingAs($doctor);

    $payload = referralDiscountPayload($branch, $test, [
        'patient_id' => $patient->id,
        'patient_phone' => $patient->phone,
    ]);
    $first = $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertCreated()
        ->assertJsonPath('data.discount_amount', '10.00');

    $payload['request_key'] = (string) Str::uuid();
    $second = $this->postJson('/api/v1/doctor/orders', $payload)
        ->assertCreated()
        ->assertJsonPath('data.discount_amount', '10.00');

    expect($first->json('data.id'))->not->toBe($second->json('data.id'));
    $this->assertDatabaseCount('orders', 2);
});

it('rejects doctor referrals outside a rule validity period', function (string $validFrom, ?string $validUntil) {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create();
    createReferralDiscountRule($admin, [
        'valid_from' => $validFrom,
        'valid_until' => $validUntil,
    ]);
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', referralDiscountPayload($branch, $test))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('discount');

    $this->assertDatabaseCount('orders', 0);
})->with([
    'future rule' => [today()->addDay()->toDateString(), null],
    'expired rule' => [today()->subDays(2)->toDateString(), today()->subDay()->toDateString()],
]);

it('prefers the most specific matching rule over a general rule', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '100.00']);
    createReferralDiscountRule($admin, ['discount_value' => '5.00']);
    createReferralDiscountRule($admin, [
        'name' => 'Doctor specific discount',
        'discount_value' => '15.00',
        'doctor_id' => $doctor->id,
    ]);
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', referralDiscountPayload($branch, $test))
        ->assertCreated()
        ->assertJsonPath('data.discount_amount', '15.00')
        ->assertJsonPath('data.discount.name', 'Doctor specific discount');
});

it('falls back to a general rule when a more specific rule minimum is not met', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create(['price' => '100.00']);
    createReferralDiscountRule($admin, ['discount_value' => '5.00']);
    createReferralDiscountRule($admin, [
        'name' => 'High-value doctor discount',
        'discount_value' => '20.00',
        'minimum_subtotal' => '200.00',
        'doctor_id' => $doctor->id,
    ]);
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', referralDiscountPayload($branch, $test))
        ->assertCreated()
        ->assertJsonPath('data.discount_amount', '5.00')
        ->assertJsonPath('data.discount.name', 'Doctor referral discount');
});

it('rejects a doctor referral without an applicable rule and rolls back its patient record', function () {
    $doctor = createVerifiedDiscountDoctor();
    $branch = Branch::factory()->create(['is_active' => true]);
    $test = LabTest::factory()->create();
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/doctor/orders', referralDiscountPayload($branch, $test))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('discount');

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('patients', 0);
});

it('returns 401 when an unauthenticated user requests referral discount rules', function () {
    $this->getJson('/api/v1/referral-discount-rules')->assertUnauthorized();
});
