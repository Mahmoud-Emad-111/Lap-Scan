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

it('returns 403 when laboratory staff attempt to access user administration', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/users')->assertForbidden();
});
