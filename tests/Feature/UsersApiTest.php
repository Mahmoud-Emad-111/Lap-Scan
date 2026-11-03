<?php

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

it('allows a laboratory administrator to create a branch-scoped staff account', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    Sanctum::actingAs($administrator);

    $response = $this->postJson('/api/v1/users', [
        'name' => 'موظف جديد',
        'email' => 'new-staff@example.test',
        'password' => 'secure-pass-123',
        'role' => UserRole::LabStaff->value,
        'branch_ids' => [$branch->id],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.role', UserRole::LabStaff->value)
        ->assertJsonMissingPath('data.password');
    $user = User::query()->where('email', 'new-staff@example.test')->firstOrFail();

    expect($user->role)->toBe(UserRole::LabStaff)
        ->and(Hash::check('secure-pass-123', $user->password))->toBeTrue();
    $this->assertDatabaseHas('branch_user', [
        'user_id' => $user->id,
        'branch_id' => $branch->id,
    ]);
});

it('stores an optional normalized phone number when creating a user', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($administrator);

    $response = $this->postJson('/api/v1/users', [
        'name' => 'موظف جديد',
        'email' => 'phone-user@example.test',
        'phone' => '+20 (10) 1234-5678',
        'password' => 'secure-pass-123',
        'role' => UserRole::LabAdmin->value,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.phone', '+201012345678');

    $this->assertDatabaseHas('users', [
        'email' => 'phone-user@example.test',
        'phone' => '+201012345678',
    ]);
});

it('rejects a phone number already assigned to another user', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    User::factory()->create(['phone' => '01012345678']);
    Sanctum::actingAs($administrator);

    $this->postJson('/api/v1/users', [
        'name' => 'موظف جديد',
        'email' => 'duplicate-phone@example.test',
        'phone' => '010 1234-5678',
        'password' => 'secure-pass-123',
        'role' => UserRole::LabAdmin->value,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('phone');

    $this->assertDatabaseMissing('users', [
        'email' => 'duplicate-phone@example.test',
    ]);
});

it('allows an administrator to update a user phone number', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $user = User::factory()->create();
    Sanctum::actingAs($administrator);

    $this->patchJson("/api/v1/users/{$user->id}", [
        'phone' => '010 1234-5678',
    ])->assertOk()
        ->assertJsonPath('data.phone', '01012345678');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'phone' => '01012345678',
    ]);
});

it('returns 403 when laboratory staff attempt to access user administration', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/users')->assertForbidden();
});
