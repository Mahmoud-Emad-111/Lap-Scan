<?php

use App\Enums\LabResultStatus;
use App\Enums\OrderStatus;
use App\Enums\PatientPromotionKind;
use App\Enums\UserRole;
use App\Events\PatientPortalUpdated;
use App\Models\Branch;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\PatientPromotion;
use App\Models\Test as LabTest;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;

it('allows a laboratory administrator to create and update an inactive test package', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($admin);

    $response = $this->postJson('/api/v1/patient-promotions', [
        'kind' => PatientPromotionKind::Offer->value,
        'name' => 'باقة متابعة',
        'description' => 'تحاليل متابعة دورية',
        'discount_type' => 'percentage',
        'discount_value' => '15',
        'minimum_subtotal' => '100',
        'maximum_discount' => '200',
        'test_ids' => [$test->id],
        'is_active' => false,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.kind', PatientPromotionKind::Offer->value)
        ->assertJsonPath('data.is_active', false)
        ->assertJsonPath('data.tests.0.id', $test->id);

    $promotionId = $response->json('data.id');
    $this->putJson("/api/v1/patient-promotions/{$promotionId}", [
        'kind' => PatientPromotionKind::Offer->value,
        'name' => 'باقة متابعة محدثة',
        'discount_type' => 'percentage',
        'discount_value' => '20',
        'test_ids' => [$test->id],
        'is_active' => true,
    ])->assertOk()
        ->assertJsonPath('data.name', 'باقة متابعة محدثة')
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('patient_promotions', [
        'id' => $promotionId,
        'created_by' => $admin->id,
        'is_active' => true,
    ]);
});

it('forbids laboratory staff from managing patient promotions', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/patient-promotions')->assertForbidden();
    $this->postJson('/api/v1/patient-promotions', [])->assertForbidden();
});

it('applies a patient coupon once per order and records one redemption for a multi-test order', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->for($user)->create();
    $address = $user->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع النيل، مبنى ٥',
        'is_default' => true,
    ]);
    $branch = Branch::factory()->create();
    $tests = LabTest::factory()->count(2)->sequence(
        ['price' => '100.00'],
        ['price' => '100.00'],
    )->create();
    $admin = User::factory()->create();
    $promotion = PatientPromotion::query()->create([
        'kind' => PatientPromotionKind::Coupon,
        'name' => 'خصم المريض',
        'code' => 'WELCOME25',
        'discount_type' => 'fixed_amount',
        'discount_value' => '25.00',
        'usage_limit' => 1,
        'used_count' => 0,
        'per_patient_limit' => 1,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);
    Sanctum::actingAs($user);

    $payload = [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => $tests->modelKeys(),
        'collection_requested_at' => now()->addDay()->toISOString(),
        'coupon_code' => ' welcome25 ',
    ];
    $response = $this->postJson('/api/v1/patient/home-collections', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.subtotal', '200.00')
        ->assertJsonPath('data.discount_amount', '25.00')
        ->assertJsonPath('data.total', '175.00');
    $this->assertDatabaseHas('patient_promotions', [
        'id' => $promotion->id,
        'used_count' => 1,
    ]);
    $this->assertDatabaseHas('patient_promotion_redemptions', [
        'patient_promotion_id' => $promotion->id,
        'patient_id' => $patient->id,
        'order_id' => $response->json('data.id'),
        'discount_amount' => '25.00',
    ]);
    $this->assertDatabaseCount('patient_promotion_redemptions', 1);

    $this->postJson('/api/v1/patient/home-collections', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['coupon_code']);

    $this->assertDatabaseCount('orders', 1);
    $this->assertDatabaseCount('patient_promotion_redemptions', 1);
});

it('rejects a package offer when the selected tests do not match the complete package', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    $address = $user->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع التحرير',
    ]);
    $branch = Branch::factory()->create();
    $tests = LabTest::factory()->count(2)->create();
    $admin = User::factory()->create();
    $promotion = PatientPromotion::query()->create([
        'kind' => PatientPromotionKind::Offer,
        'name' => 'باقة كاملة',
        'discount_type' => 'percentage',
        'discount_value' => '10.00',
        'is_active' => true,
        'created_by' => $admin->id,
    ]);
    $promotion->tests()->sync($tests->modelKeys());
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$tests->first()->id],
        'collection_requested_at' => now()->addDay()->toISOString(),
        'promotion_id' => $promotion->id,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['test_ids']);

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('patient_promotion_redemptions', 0);
});

it('lists and applies a complete test package with the configured discount ceiling', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->for($user)->create();
    $address = $user->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع النيل',
    ]);
    $branch = Branch::factory()->create();
    $tests = LabTest::factory()->count(2)->sequence(
        ['price' => '120.00'],
        ['price' => '80.00'],
    )->create();
    $admin = User::factory()->create();
    $promotion = PatientPromotion::query()->create([
        'kind' => PatientPromotionKind::Offer,
        'name' => 'باقة التحاليل',
        'discount_type' => 'percentage',
        'discount_value' => '20.00',
        'maximum_discount' => '30.00',
        'is_active' => true,
        'created_by' => $admin->id,
    ]);
    $promotion->tests()->sync($tests->modelKeys());
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/patient/promotions/offers')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $promotion->id);

    $response = $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => $tests->modelKeys(),
        'collection_requested_at' => now()->addDay()->toISOString(),
        'promotion_id' => $promotion->id,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.subtotal', '200.00')
        ->assertJsonPath('data.discount_amount', '30.00')
        ->assertJsonPath('data.total', '170.00')
        ->assertJsonPath('data.discount.promotion_id', $promotion->id);
    $this->assertDatabaseHas('patient_promotions', [
        'id' => $promotion->id,
        'used_count' => 1,
    ]);
    $this->assertDatabaseHas('patient_promotion_redemptions', [
        'patient_promotion_id' => $promotion->id,
        'patient_id' => $patient->id,
        'discount_amount' => '30.00',
    ]);
});

it('rejects an expired coupon with the patient-facing availability message', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    $address = $user->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع التحرير',
    ]);
    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create();
    $admin = User::factory()->create();
    PatientPromotion::query()->create([
        'kind' => PatientPromotionKind::Coupon,
        'name' => 'كوبون منتهي',
        'code' => 'EXPIRED10',
        'discount_type' => 'percentage',
        'discount_value' => '10.00',
        'valid_until' => today()->subDay(),
        'is_active' => true,
        'created_by' => $admin->id,
    ]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$test->id],
        'collection_requested_at' => now()->addDay()->toISOString(),
        'coupon_code' => 'EXPIRED10',
    ])->assertUnprocessable()
        ->assertJsonPath('errors.coupon_code.0', 'العرض أو الكوبون غير متاح أو انتهت صلاحيته.');

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('patient_promotion_redemptions', 0);
});

it('rejects invalid and self referrals and allows one valid referral per invited patient', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $template = PatientPromotion::query()->create([
        'kind' => PatientPromotionKind::ReferralTemplate,
        'name' => 'مكافأة الدعوة',
        'discount_type' => 'percentage',
        'discount_value' => '10.00',
        'validity_days' => 30,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);
    $inviterUser = User::factory()->create();
    $inviterUser->forceFill(['role' => UserRole::Patient])->save();
    $inviter = Patient::factory()->for($inviterUser)->create();
    $invitedUser = User::factory()->create();
    $invitedUser->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($invitedUser)->create();
    Sanctum::actingAs($inviterUser);
    $referralCode = $this->getJson('/api/v1/patient/referrals')
        ->assertOk()
        ->assertJsonPath('data.enabled', true)
        ->json('data.referral_code');

    $this->postJson('/api/v1/patient/referrals', ['referral_code' => 'INVALID'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.referral_code.0', 'كود الدعوة غير صحيح.');
    $this->postJson('/api/v1/patient/referrals', ['referral_code' => $referralCode])
        ->assertUnprocessable()
        ->assertJsonPath('errors.referral_code.0', 'مينفعش تستخدم كود الدعوة بتاعك.');

    Sanctum::actingAs($invitedUser);
    $this->postJson('/api/v1/patient/referrals', ['referral_code' => strtolower($referralCode)])
        ->assertCreated();
    $this->postJson('/api/v1/patient/referrals', ['referral_code' => $referralCode])
        ->assertUnprocessable()
        ->assertJsonPath('errors.referral_code.0', 'تم تسجيل دعوة لهذا الحساب بالفعل.');

    $this->assertDatabaseHas('patient_referrals', [
        'inviter_patient_id' => $inviter->id,
        'invited_patient_id' => $invitedUser->patientProfile()->value('id'),
        'reward_template_id' => $template->id,
        'referral_code' => $referralCode,
    ]);

    $previouslyCompletedUser = User::factory()->create();
    $previouslyCompletedUser->forceFill(['role' => UserRole::Patient])->save();
    $previouslyCompletedPatient = Patient::factory()->for($previouslyCompletedUser)->create();
    Order::factory()->create([
        'patient_id' => $previouslyCompletedPatient->id,
        'status' => OrderStatus::Completed,
    ]);
    Sanctum::actingAs($previouslyCompletedUser);
    $this->postJson('/api/v1/patient/referrals', ['referral_code' => $referralCode])
        ->assertUnprocessable()
        ->assertJsonPath('errors.referral_code.0', 'كود الدعوة متاح قبل اكتمال أول طلب بس.');

    $this->assertDatabaseCount('patient_referrals', 1);
});

it('issues referral coupons to both patients only when the invited patients first order is completed', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $template = PatientPromotion::query()->create([
        'kind' => PatientPromotionKind::ReferralTemplate,
        'name' => 'قالب مكافأة الصديق',
        'discount_type' => 'fixed_amount',
        'discount_value' => '50.00',
        'validity_days' => 14,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);
    $inviterUser = User::factory()->create();
    $inviterUser->forceFill(['role' => UserRole::Patient])->save();
    $inviter = Patient::factory()->for($inviterUser)->create();
    $invitedUser = User::factory()->create();
    $invitedUser->forceFill(['role' => UserRole::Patient])->save();
    $invitedPatient = Patient::factory()->for($invitedUser)->create();
    Sanctum::actingAs($inviterUser);
    $referralCode = $this->getJson('/api/v1/patient/referrals')
        ->assertOk()
        ->json('data.referral_code');
    Sanctum::actingAs($invitedUser);
    $this->postJson('/api/v1/patient/referrals', ['referral_code' => $referralCode])
        ->assertCreated();

    $order = Order::factory()->create([
        'patient_id' => $invitedPatient->id,
        'branch_id' => Branch::factory(),
        'created_by' => $staff->id,
    ]);
    $item = OrderItem::factory()->for($order)->create([
        'test_id' => LabTest::factory(),
    ]);
    $result = LabResult::factory()->for($item)->create([
        'status' => LabResultStatus::Draft,
        'entered_by' => $staff->id,
    ]);
    Event::fake([PatientPortalUpdated::class]);
    $this->assertDatabaseCount('patient_promotions', 1);

    Sanctum::actingAs($admin);
    $this->postJson("/api/v1/results/{$result->id}/approval")->assertOk();

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => OrderStatus::Completed->value,
    ]);
    $this->assertDatabaseHas('patient_referrals', [
        'invited_patient_id' => $invitedPatient->id,
        'rewarded_at' => now()->toDateTimeString(),
    ]);
    $this->assertDatabaseCount('patient_promotions', 3);
    $this->assertDatabaseHas('patient_promotions', [
        'kind' => PatientPromotionKind::ReferralCoupon->value,
        'patient_id' => $inviter->id,
        'template_id' => $template->id,
        'discount_value' => '50.00',
    ]);
    $this->assertDatabaseHas('patient_promotions', [
        'kind' => PatientPromotionKind::ReferralCoupon->value,
        'patient_id' => $invitedPatient->id,
        'template_id' => $template->id,
        'discount_value' => '50.00',
    ]);

    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create(['price' => '100.00']);
    $address = $invitedUser->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع النيل',
    ]);
    Sanctum::actingAs($invitedUser);
    $couponResponse = $this->getJson('/api/v1/patient/promotions/coupons')
        ->assertOk()
        ->assertJsonCount(1, 'data');
    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$test->id],
        'collection_requested_at' => now()->addDay()->toISOString(),
        'coupon_code' => $couponResponse->json('data.0.code'),
    ])->assertCreated()
        ->assertJsonPath('data.discount_amount', '50.00')
        ->assertJsonPath('data.total', '50.00');

    Event::assertDispatched(PatientPortalUpdated::class);
});
