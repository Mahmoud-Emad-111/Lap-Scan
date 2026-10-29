<?php

namespace App\Http\Resources\Api\V1;

use App\Models\LabResult;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LabResult */
class LabResultResource extends JsonResource
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
            'order_item_id' => $this->order_item_id,
            'order_number' => $this->whenLoaded('orderItem', fn (): string => $this->orderItem->order->order_number),
            'patient_name' => $this->whenLoaded('orderItem', fn (): string => $this->orderItem->order->patient->full_name),
            'test_name' => $this->whenLoaded('orderItem', fn (): string => $this->orderItem->test_name),
            'value' => $this->value,
            'unit' => $this->unit,
            'reference_range' => $this->reference_range,
            'notes' => $this->notes,
            'has_pdf' => $request->user()?->role->canManageOrders()
                ? $this->document_path !== null
                : null,
            'document_name' => $request->user()?->role->canManageOrders()
                ? $this->document_name
                : null,
            'document_size' => $request->user()?->role->canManageOrders()
                ? $this->document_size
                : null,
            'status' => $this->status->value,
            'version' => $this->version,
            'entered_by' => $this->entered_by,
            'entered_at' => $this->entered_at?->toISOString(),
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toISOString(),
        ];
    }
}
