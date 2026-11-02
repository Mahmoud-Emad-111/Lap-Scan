<?php

use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('saves patient addresses and keeps one default address', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    Sanctum::actingAs($user);

    $firstResponse = $this->postJson('/api/v1/patient/addresses', [
        'label' => 'البيت',
        'address' => 'شارع التحرير، عمارة ١',
    ]);
    $firstResponse->assertCreated()
        ->assertJsonPath('data.is_default', true);

    $secondResponse = $this->postJson('/api/v1/patient/addresses', [
        'label' => 'الشغل',
        'address' => 'شارع الجامعة، مبنى ٢',
        'is_default' => true,
    ]);
    $secondResponse->assertCreated()
        ->assertJsonPath('data.is_default', true);
    $this->assertDatabaseHas('patient_addresses', [
        'id' => $firstResponse->json('data.id'),
        'is_default' => false,
    ]);
    $this->assertDatabaseHas('patient_addresses', [
        'id' => $secondResponse->json('data.id'),
        'is_default' => true,
    ]);
});

it('returns only the authenticated patient addresses', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    $address = $user->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'عنوان المريض',
        'is_default' => true,
    ]);
    $otherUser = User::factory()->create();
    Patient::factory()->for($otherUser)->create();
    $otherUser->patientAddresses()->create([
        'label' => 'خاص',
        'address' => 'عنوان مستخدم آخر',
    ]);
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/patient/addresses')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $address->id)
        ->assertJsonMissing(['address' => 'عنوان مستخدم آخر']);
});

it('returns 404 when a patient attempts to change another account address', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($user)->create();
    $otherUser = User::factory()->create();
    Patient::factory()->for($otherUser)->create();
    $otherAddress = $otherUser->patientAddresses()->create([
        'label' => 'خاص',
        'address' => 'عنوان مستخدم آخر',
    ]);
    Sanctum::actingAs($user);

    $this->putJson("/api/v1/patient/addresses/{$otherAddress->id}", [
        'label' => 'تم تغيير العنوان',
    ])->assertNotFound();

    $this->assertDatabaseHas('patient_addresses', [
        'id' => $otherAddress->id,
        'label' => 'خاص',
    ]);
});

it('returns 403 when a non-patient requests saved addresses', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/patient/addresses')->assertForbidden();
});
