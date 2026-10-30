<?php

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('authorizes private order channels only for lab users with branch access', function () {
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => 'test-app',
    ]);
    require base_path('routes/channels.php');

    $assignedBranch = Branch::factory()->create();
    $otherBranch = Branch::factory()->create();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $staff->branches()->attach($assignedBranch);
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $doctor = User::factory()->create();
    $doctor->forceFill(['role' => UserRole::Doctor])->save();

    Sanctum::actingAs($staff);
    $this->postJson('/api/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-branches.{$assignedBranch->id}.orders",
    ])->assertOk();

    $this->postJson('/api/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-branches.{$otherBranch->id}.orders",
    ])->assertForbidden();

    Sanctum::actingAs($administrator);
    $this->postJson('/api/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-branches.{$otherBranch->id}.orders",
    ])->assertOk();

    Sanctum::actingAs($doctor);
    $this->postJson('/api/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-branches.{$assignedBranch->id}.orders",
    ])->assertForbidden();
});

it('returns 401 when a user is not authenticated for private order channels', function () {
    $branch = Branch::factory()->create();

    $this->postJson('/api/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-branches.{$branch->id}.orders",
    ])->assertUnauthorized();
});
