<?php

namespace Database\Factories;

use App\Models\ShiftAttendance;
use App\Models\ShiftSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShiftAttendance>
 */
class ShiftAttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shift_schedule_id' => ShiftSchedule::factory(),
            'shift_date' => now()->toDateString(),
            'clocked_in_at' => now(),
            'clocked_out_at' => null,
        ];
    }
}
