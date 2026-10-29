<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => 'LAB-'.fake()->unique()->numerify('########'),
            'branch_id' => Branch::factory(),
            'patient_id' => Patient::factory(),
            'created_by' => User::factory(),
            'status' => OrderStatus::Registered,
            'notes' => null,
            'total' => '0.00',
        ];
    }
}
