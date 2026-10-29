<?php

use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('creates a patient from validated profile fields for laboratory staff', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $response = $this->postJson('/api/v1/patients', [
        'full_name' => 'مريم حسن',
        'phone' => '01012345678',
        'email' => 'maryam@example.test',
        'gender' => 'female',
        'user_id' => $staff->id,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.full_name', 'مريم حسن')
        ->assertJsonMissingPath('data.user_id');

    $this->assertDatabaseHas('patients', [
        'full_name' => 'مريم حسن',
        'phone' => '01012345678',
        'user_id' => null,
    ]);
});

it('returns 422 when the patient email is invalid', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->postJson('/api/v1/patients', [
        'full_name' => 'Patient Name',
        'phone' => '01012345678',
        'email' => 'not-an-email',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);

    $this->assertDatabaseCount('patients', 0);
});

it('does not let a patient read another patient profile', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->create();
    Sanctum::actingAs($user);

    $this->getJson("/api/v1/patients/{$patient->id}")->assertForbidden();
});

it('returns 401 to guests accessing patient records', function () {
    $this->getJson('/api/v1/patients')->assertUnauthorized();
});
