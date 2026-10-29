<?php

namespace Database\Factories;

use App\Enums\SampleStatus;
use App\Models\OrderItem;
use App\Models\Sample;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sample>
 */
class SampleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_item_id' => OrderItem::factory(),
            'barcode' => fake()->unique()->bothify('SAMPLE-####??'),
            'specimen_type' => 'Blood',
            'status' => SampleStatus::PendingCollection,
            'collected_by' => null,
            'collected_at' => null,
            'notes' => null,
        ];
    }
}
