<?php

namespace Database\Factories;

use App\Models\Test;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Test>
 */
class TestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('TST-####'),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'specimen_type' => 'Blood',
            'price' => fake()->randomFloat(2, 50, 1000),
            'turnaround_time_minutes' => fake()->numberBetween(60, 2880),
            'is_active' => true,
        ];
    }
}
