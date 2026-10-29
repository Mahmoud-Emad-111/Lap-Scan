<?php

use App\Enums\UserRole;
use App\Models\Test;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('shows only active catalog tests to authenticated users', function () {
    $patient = User::factory()->create();
    $activeTest = Test::factory()->create(['name' => 'Complete Blood Count', 'is_active' => true]);
    Test::factory()->create(['name' => 'Archived Test', 'is_active' => false]);
    Sanctum::actingAs($patient);

    $this->getJson('/api/v1/tests')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $activeTest->id);
});

it('allows laboratory staff to add a catalog test', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->postJson('/api/v1/tests', [
        'code' => 'CBC',
        'name' => 'Complete Blood Count',
        'specimen_type' => 'Blood',
        'price' => 250,
        'turnaround_time_minutes' => 240,
    ])->assertCreated()
        ->assertJsonPath('data.code', 'CBC')
        ->assertJsonPath('data.price', '250.00');

    $this->assertDatabaseHas('tests', ['code' => 'CBC', 'price' => 250]);
});

it('does not allow patients to change catalog prices', function () {
    $patient = User::factory()->create();
    $test = Test::factory()->create(['price' => 150]);
    Sanctum::actingAs($patient);

    $this->patchJson("/api/v1/tests/{$test->id}", ['price' => 10])->assertForbidden();

    expect($test->refresh()->price)->toBe('150.00');
});
