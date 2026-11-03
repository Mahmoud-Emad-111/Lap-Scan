<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Models\Branch;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderPayment>
 */
class OrderPaymentFactory extends Factory
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
            'branch_id' => Branch::factory(),
            'recorded_by' => User::factory(),
            'amount' => '10.00',
            'method' => PaymentMethod::Cash,
        ];
    }
}
