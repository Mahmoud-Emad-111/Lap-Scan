<?php

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('keeps one default branch when an administrator selects another', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $firstBranch = Branch::factory()->create(['is_default' => true]);
    Sanctum::actingAs($administrator);

    $response = $this->postJson('/api/v1/branches', [
        'name' => 'Cairo Branch',
        'code' => 'CAIRO',
        'is_default' => true,
    ]);

    $response->assertCreated()->assertJsonPath('data.is_default', true);
    expect($firstBranch->refresh()->is_default)->toBeFalse();
    $this->assertDatabaseCount('branches', 2);
});

it('keeps the existing branch as default when it is the only branch', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create(['is_default' => true]);
    Sanctum::actingAs($administrator);

    $this->patchJson("/api/v1/branches/{$branch->id}", ['is_default' => false])
        ->assertOk()
        ->assertJsonPath('data.is_default', true);
});

it('limits laboratory staff to their assigned branches', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $assignedBranch = Branch::factory()->create();
    $otherBranch = Branch::factory()->create();
    $staff->branches()->attach($assignedBranch);
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/branches')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $assignedBranch->id);

    $this->getJson("/api/v1/branches/{$otherBranch->id}")->assertForbidden();
});

it('does not allow patients to list branch records', function () {
    $patient = User::factory()->create();
    Sanctum::actingAs($patient);

    $this->getJson('/api/v1/branches')->assertForbidden();
});
