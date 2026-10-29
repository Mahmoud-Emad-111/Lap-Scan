<?php

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use Database\Seeders\DefaultBranchSeeder;
use Database\Seeders\DemoUsersSeeder;
use Illuminate\Support\Facades\Hash;

it('creates repeatable role-specific local accounts that can sign in', function () {
    config(['lab.demo_password' => 'demo-password-123']);
    (new DefaultBranchSeeder)->run();
    (new DemoUsersSeeder)->run();
    (new DemoUsersSeeder)->run();

    $admin = User::query()->where('email', 'admin@lab.test')->firstOrFail();
    $staff = User::query()->where('email', 'staff@lab.test')->firstOrFail();
    $patient = User::query()->where('email', 'patient@lab.test')->firstOrFail();

    expect($admin->role)->toBe(UserRole::LabAdmin)
        ->and($staff->role)->toBe(UserRole::LabStaff)
        ->and($patient->role)->toBe(UserRole::Patient)
        ->and(Hash::check('demo-password-123', $admin->password))->toBeTrue();
    $this->assertDatabaseCount('users', 4);
    $this->assertDatabaseHas('branch_user', [
        'user_id' => $staff->id,
        'branch_id' => Branch::query()->where('is_default', true)->value('id'),
    ]);

    $this->postJson('/api/v1/login', [
        'email' => 'admin@lab.test',
        'password' => 'demo-password-123',
        'device_name' => 'test',
    ])->assertOk()->assertJsonPath('data.user.role', UserRole::LabAdmin->value);
});
