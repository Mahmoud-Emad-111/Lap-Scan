<?php

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\ShiftSchedule;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('allows administrators to create a recurring weekly staff shift', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    Sanctum::actingAs($administrator);

    $this->postJson('/api/v1/shift-schedules', [
        'branch_id' => $branch->id,
        'user_id' => $staff->id,
        'day_of_week' => 0,
        'starts_at' => '08:00',
        'ends_at' => '16:00',
        'effective_from' => '2026-11-01',
        'effective_until' => null,
    ])->assertCreated()
        ->assertJsonPath('data.user.id', $staff->id)
        ->assertJsonPath('data.day_of_week', 0)
        ->assertJsonPath('data.is_active', true);

    $this->getJson('/api/v1/shifts?week=2026-11-01')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.shift_date', '2026-11-01')
        ->assertJsonPath('data.0.user.id', $staff->id);

    $this->getJson('/api/v1/shifts?week=2026-11-08')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.shift_date', '2026-11-08');
});

it('forbids laboratory staff from managing recurring schedules', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->postJson('/api/v1/shift-schedules', [
        'branch_id' => Branch::factory()->create()->id,
        'user_id' => $staff->id,
        'day_of_week' => 0,
        'starts_at' => '08:00',
        'ends_at' => '16:00',
        'effective_from' => '2026-11-01',
    ])->assertForbidden();

    $this->assertDatabaseCount('shift_schedules', 0);
});

it('shows laboratory staff only their own assigned shifts', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $otherStaff = User::factory()->create();
    $otherStaff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $otherStaff->branches()->attach($branch);
    $ownSchedule = ShiftSchedule::factory()
        ->for($staff, 'user')
        ->for($branch)
        ->create(['effective_from' => '2026-11-01', 'day_of_week' => 0]);
    ShiftSchedule::factory()
        ->for($otherStaff, 'user')
        ->for($branch)
        ->create(['effective_from' => '2026-11-01', 'day_of_week' => 0]);
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/shifts?week=2026-11-01')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.shift_schedule_id', $ownSchedule->id);
});

it('records clock-in and clock-out for an assigned shift', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $schedule = ShiftSchedule::factory()
        ->for($staff, 'user')
        ->for($branch)
        ->create([
            'day_of_week' => 0,
            'starts_at' => '08:00',
            'ends_at' => '16:00',
            'effective_from' => '2026-11-01',
        ]);
    Sanctum::actingAs($staff);
    $this->travelTo('2026-11-01 08:00:00');

    $this->postJson("/api/v1/shift-schedules/{$schedule->id}/clock-in", [
        'shift_date' => '2026-11-01',
    ])->assertCreated()
        ->assertJsonPath('data.shift_date', '2026-11-01')
        ->assertJsonPath('data.clocked_out_at', null);

    $this->travelTo('2026-11-01 16:00:00');
    $clockOutResponse = $this->postJson("/api/v1/shift-schedules/{$schedule->id}/clock-out", [
        'shift_date' => '2026-11-01',
    ]);
    $clockOutResponse->assertOk()
        ->assertJsonPath('data.shift_date', '2026-11-01')
        ->assertJsonStructure(['data' => ['clocked_out_at']]);
    expect($clockOutResponse->json('data.clocked_out_at'))->not->toBeNull();

    $this->assertDatabaseCount('shift_attendances', 1);
});

it('does not allow staff to clock in for another employee shift', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $otherStaff = User::factory()->create();
    $otherStaff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $schedule = ShiftSchedule::factory()
        ->for($otherStaff, 'user')
        ->for($branch)
        ->create([
            'day_of_week' => 0,
            'effective_from' => '2026-11-01',
        ]);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/shift-schedules/{$schedule->id}/clock-in", [
        'shift_date' => '2026-11-01',
    ])->assertForbidden();

    $this->assertDatabaseCount('shift_attendances', 0);
});

it('rejects a recurring shift whose end and start times are identical', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    Sanctum::actingAs($administrator);

    $this->postJson('/api/v1/shift-schedules', [
        'branch_id' => $branch->id,
        'user_id' => $staff->id,
        'day_of_week' => 0,
        'starts_at' => '08:00',
        'ends_at' => '08:00',
        'effective_from' => '2026-11-01',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['ends_at']);

    $this->assertDatabaseCount('shift_schedules', 0);
});

it('rejects weekly shifts that overlap across midnight', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    ShiftSchedule::factory()
        ->for($staff, 'user')
        ->for($branch)
        ->create([
            'day_of_week' => 0,
            'starts_at' => '22:00',
            'ends_at' => '02:00',
            'effective_from' => '2026-11-01',
        ]);
    Sanctum::actingAs($administrator);

    $this->postJson('/api/v1/shift-schedules', [
        'branch_id' => $branch->id,
        'user_id' => $staff->id,
        'day_of_week' => 1,
        'starts_at' => '00:30',
        'ends_at' => '04:00',
        'effective_from' => '2026-11-02',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['starts_at']);

    $this->assertDatabaseCount('shift_schedules', 1);
});
