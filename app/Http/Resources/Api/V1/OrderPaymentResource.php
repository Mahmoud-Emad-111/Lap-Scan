<?php

namespace App\Http\Resources\Api\V1;

use App\Models\OrderPayment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrderPayment */
class OrderPaymentResource extends JsonResource
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
            'amount' => $this->amount,
            'method' => $this->method->value,
            'order' => $this->whenLoaded('order', fn (): array => [
                'id' => $this->order->id,
                'order_number' => $this->order->displayNumber(),
                'patient' => $this->order->patient?->full_name,
            ]),
            'branch' => $this->whenLoaded('branch', fn (): array => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ]),
            'recorded_by' => $this->whenLoaded('recorder', fn (): array => [
                'id' => $this->recorder->id,
                'name' => $this->recorder->name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
