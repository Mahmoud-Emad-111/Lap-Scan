<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Sample;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Sample */
class SampleResource extends JsonResource
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
            'barcode' => $this->barcode,
            'specimen_type' => $this->specimen_type,
            'status' => $this->status->value,
            'collected_at' => $this->collected_at?->toISOString(),
            'order_number' => $this->whenLoaded('orderItem', fn (): string => $this->orderItem->order->order_number),
            'patient_name' => $this->whenLoaded('orderItem', fn (): string => $this->orderItem->order->patient->full_name),
            'test_name' => $this->whenLoaded('orderItem', fn (): string => $this->orderItem->test_name),
        ];
    }
}
