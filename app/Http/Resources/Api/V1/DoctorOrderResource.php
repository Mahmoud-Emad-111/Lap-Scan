<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class DoctorOrderResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status->value,
            'priority' => $this->priority->value,
            'urgent_reason' => $this->urgent_reason,
            'notes' => $this->notes,
            'branch' => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ],
            'patient' => [
                'full_name' => $this->patient->full_name,
            ],
            'items' => $this->items->map(fn (OrderItem $item): array => [
                'id' => $item->id,
                'test_name' => $item->test_name,
                'price' => $item->price,
                'sample_status' => $item->sample?->status->value,
                'collected_at' => $item->sample?->collected_at?->toISOString(),
                'result_available' => $item->result?->status->value === 'approved',
                'result_id' => $item->result?->status->value === 'approved'
                    ? $item->result->id
                    : null,
            ])->all(),
            'results_available' => $this->items->contains(
                fn (OrderItem $item): bool => $item->result?->status->value === 'approved',
            ),
            'expected_result_at' => $this->expectedResultAt(),
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'discount' => $this->discount_snapshot,
            'total' => $this->total,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function expectedResultAt(): ?string
    {
        if ($this->items->isEmpty()) {
            return null;
        }

        $expectedTimes = $this->items->map(function (OrderItem $item) {
            $turnaroundTime = $item->test?->turnaround_time_minutes;
            $collectedAt = $item->sample?->collected_at;

            return $turnaroundTime !== null && $collectedAt !== null
                ? $collectedAt->copy()->addMinutes($turnaroundTime)
                : null;
        });

        if ($expectedTimes->contains(null)) {
            return null;
        }

        return $expectedTimes->max()?->toISOString();
    }
}
