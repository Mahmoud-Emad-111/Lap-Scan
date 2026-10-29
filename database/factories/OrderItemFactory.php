<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Test;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'test_id' => Test::factory(),
            'test_code' => fake()->lexify('TEST-????'),
            'test_name' => fake()->words(2, true),
            'specimen_type' => 'Blood',
            'price' => '100.00',
        ];
    }
}
