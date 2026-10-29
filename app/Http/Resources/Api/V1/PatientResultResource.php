<?php

namespace App\Http\Resources\Api\V1;

use App\Models\LabResult;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LabResult */
class PatientResultResource extends JsonResource
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
            'order_number' => $this->orderItem->order->order_number,
            'test_name' => $this->orderItem->test_name,
            'value' => $this->value,
            'unit' => $this->unit,
            'reference_range' => $this->reference_range,
            'approved_at' => $this->approved_at?->toISOString(),
        ];
    }
}
