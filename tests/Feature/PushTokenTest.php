<?php

use App\Enums\UserRole;
use App\Models\FcmDeviceToken;
use App\Models\Patient;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('registers a push token for an authenticated laboratory user', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::LabStaff])->save();
    $token = 'firebase-registration-token';

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/push-tokens', ['token' => $token])
        ->assertCreated()
        ->assertJsonPath('message', 'تم تسجيل إشعارات المتصفح.');

    $this->assertDatabaseHas('fcm_device_tokens', [
        'user_id' => $user->id,
        'token' => $token,
        'token_hash' => hash('sha256', $token),
    ]);
});

it('moves an existing browser token to the newly authenticated laboratory user', function () {
    $firstUser = User::factory()->create();
    $firstUser->forceFill(['role' => UserRole::LabStaff])->save();
    $secondUser = User::factory()->create();
    $secondUser->forceFill(['role' => UserRole::LabAdmin])->save();
    $token = 'shared-browser-registration-token';
    FcmDeviceToken::query()->create([
        'user_id' => $firstUser->id,
        'token' => $token,
        'token_hash' => hash('sha256', $token),
    ]);

    Sanctum::actingAs($secondUser);

    $this->postJson('/api/v1/push-tokens', ['token' => $token])
        ->assertCreated();

    $this->assertDatabaseCount('fcm_device_tokens', 1);
    $this->assertDatabaseHas('fcm_device_tokens', [
        'user_id' => $secondUser->id,
        'token_hash' => hash('sha256', $token),
    ]);
});

it('registers a push token for a patient with a linked patient profile', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::Patient])->save();
    $user->patientProfile()->create(Patient::factory()->raw());
    $token = 'patient-firebase-registration-token';

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/push-tokens', ['token' => $token])
        ->assertCreated()
        ->assertJsonPath('message', 'تم تسجيل إشعارات المتصفح.');

    $this->assertDatabaseHas('fcm_device_tokens', [
        'user_id' => $user->id,
        'token_hash' => hash('sha256', $token),
    ]);
});

it('rejects push token registration for a patient without a linked patient profile', function () {
    $patient = User::factory()->create();
    $patient->forceFill(['role' => UserRole::Patient])->save();
    Sanctum::actingAs($patient);

    $this->postJson('/api/v1/push-tokens', ['token' => 'unlinked-patient-token'])
        ->assertForbidden();

    $this->assertDatabaseCount('fcm_device_tokens', 0);
});

it('rejects push token registration for users without an allowed role', function () {
    $doctor = User::factory()->create();
    $doctor->forceFill(['role' => UserRole::Doctor])->save();
    Sanctum::actingAs($doctor);

    $this->postJson('/api/v1/push-tokens', ['token' => 'not-allowed'])
        ->assertForbidden();

    $this->assertDatabaseCount('fcm_device_tokens', 0);
});

it('requires authentication and a valid token when registering push notifications', function () {
    $this->postJson('/api/v1/push-tokens', [])
        ->assertUnauthorized();

    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/push-tokens', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['token']);
});

it('only unregisters the current laboratory user’s push token', function () {
    $user = User::factory()->create();
    $user->forceFill(['role' => UserRole::LabAdmin])->save();
    $otherUser = User::factory()->create();
    $otherUser->forceFill(['role' => UserRole::LabStaff])->save();
    $ownedToken = 'owned-registration-token';
    $otherToken = 'other-registration-token';
    FcmDeviceToken::query()->create([
        'user_id' => $user->id,
        'token' => $ownedToken,
        'token_hash' => hash('sha256', $ownedToken),
    ]);
    FcmDeviceToken::query()->create([
        'user_id' => $otherUser->id,
        'token' => $otherToken,
        'token_hash' => hash('sha256', $otherToken),
    ]);
    Sanctum::actingAs($user);

    $this->deleteJson('/api/v1/push-tokens', ['token' => $otherToken])
        ->assertOk();

    $this->assertDatabaseCount('fcm_device_tokens', 2);

    $this->deleteJson('/api/v1/push-tokens', ['token' => $ownedToken])
        ->assertOk();

    $this->assertDatabaseCount('fcm_device_tokens', 1);
    $this->assertDatabaseHas('fcm_device_tokens', [
        'user_id' => $otherUser->id,
        'token_hash' => hash('sha256', $otherToken),
    ]);
});
