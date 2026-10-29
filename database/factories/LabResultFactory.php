<?php

namespace Database\Factories;

use App\Enums\LabResultStatus;
use App\Models\LabResult;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabResult>
 */
class LabResultFactory extends Factory
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
            'value' => 'Not a clinical result',
            'unit' => null,
            'reference_range' => null,
            'notes' => null,
            'status' => LabResultStatus::Draft,
            'entered_by' => User::factory(),
            'approved_by' => null,
            'entered_at' => now(),
            'approved_at' => null,
        ];
    }
}
