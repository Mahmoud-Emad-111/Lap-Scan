<?php

use App\Enums\UserRole;
use App\Models\AppSetting;
use App\Models\Branch;
use App\Models\Patient;
use App\Models\Test;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('returns the default home collection availability to an authenticated patient', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/settings')
        ->assertOk()
        ->assertJsonPath('data.home_collection_enabled', true);
});

it('allows a laboratory administrator to disable home collection', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($admin);

    $this->patchJson('/api/v1/settings', [
        'home_collection_enabled' => false,
    ])->assertOk()
        ->assertJsonPath('data.home_collection_enabled', false);

    expect(AppSetting::homeCollectionEnabled())->toBeFalse();
});

it('forbids patients from changing home collection availability', function () {
    $patient = User::factory()->create();
    $patient->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($patient)->create();
    Sanctum::actingAs($patient);

    $this->patchJson('/api/v1/settings', [
        'home_collection_enabled' => false,
    ])->assertForbidden();

    expect(AppSetting::homeCollectionEnabled())->toBeTrue();
});

it('rejects invalid availability values', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($admin);

    $this->patchJson('/api/v1/settings', [
        'home_collection_enabled' => 'sometimes',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['home_collection_enabled']);
});

it('returns a conflict and does not create an order while home collection is disabled', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    $address = $user->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع النيل',
    ]);
    $branch = Branch::factory()->create();
    $test = Test::factory()->create();
    AppSetting::query()->firstOrFail()->update(['home_collection_enabled' => false]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$test->id],
        'collection_requested_at' => now()->addDay()->toISOString(),
    ])->assertConflict()
        ->assertJsonPath('message', 'خدمة السحب المنزلي غير متاحة حالياً.');

    $this->assertDatabaseCount('orders', 0);
});
