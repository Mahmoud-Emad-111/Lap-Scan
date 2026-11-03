<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\ShiftSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShiftSchedule>
 */
class ShiftScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'user_id' => User::factory()->state(['role' => UserRole::LabStaff]),
            'created_by' => User::factory()->state(['role' => UserRole::LabAdmin]),
            'day_of_week' => 1,
            'starts_at' => '08:00:00',
            'ends_at' => '16:00:00',
            'effective_from' => now()->toDateString(),
            'effective_until' => null,
            'is_active' => true,
        ];
    }
}
