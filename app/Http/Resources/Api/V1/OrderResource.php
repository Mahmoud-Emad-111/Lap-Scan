<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->displayNumber(),
            'source' => $this->source->value,
            'priority' => $this->priority->value,
            'urgent_reason' => $this->urgent_reason,
            'referring_doctor' => $this->whenLoaded('referringDoctor', fn (): ?array => $this->referringDoctor === null
                ? null
                : [
                    'id' => $this->referringDoctor->id,
                    'name' => $this->referringDoctor->name,
                ]),
            'branch' => $this->whenLoaded('branch', fn (): array => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ]),
            'patient' => $this->whenLoaded('patient', fn (): array => [
                'id' => $this->patient->id,
                'full_name' => $this->patient->full_name,
                'phone' => $this->patient->phone,
            ]),
            'status' => $this->status->value,
            'notes' => $this->notes,
            'subtotal' => $this->subtotal,
            'discount_amount' => $this->discount_amount,
            'discount' => $this->discount_snapshot,
            'collection_address' => $this->collection_address,
            'collection_requested_at' => $this->collection_requested_at?->toISOString(),
            'total' => $this->total,
            'paid_amount' => $this->paidAmount(),
            'balance_due' => $this->balanceDue(),
            'payment_status' => $this->paymentStatus(),
            'expected_result_at' => $this->expectedResultAt(),
            'items' => $this->whenLoaded('items', fn () => OrderItemResource::collection($this->items)),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }

    private function expectedResultAt(): ?string
    {
        if (! $this->relationLoaded('items') || $this->items->isEmpty()) {
            return null;
        }

        $expectedTimes = $this->items->map(function ($item) {
            if (! $item->relationLoaded('test') || ! $item->relationLoaded('sample')) {
                return null;
            }

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

    private function paidAmount(): string
    {
        return number_format((float) ($this->payments_sum_amount ?? 0), 2, '.', '');
    }

    private function balanceDue(): string
    {
        $balanceInCents = max(
            0,
            (int) round((float) $this->total * 100)
                - (int) round((float) ($this->payments_sum_amount ?? 0) * 100),
        );

        return number_format($balanceInCents / 100, 2, '.', '');
    }

    private function paymentStatus(): string
    {
        $totalInCents = (int) round((float) $this->total * 100);
        $paidInCents = (int) round((float) ($this->payments_sum_amount ?? 0) * 100);

        if ($paidInCents >= $totalInCents) {
            return 'paid';
        }

        return $paidInCents > 0 ? 'partial' : 'unpaid';
    }
}
