<?php

namespace App\Http\Resources\Api\V1;

use App\Models\LabResultRevision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin LabResultRevision */
class LabResultRevisionResource extends JsonResource
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
            'lab_result_id' => $this->lab_result_id,
            'version' => $this->version,
            'value' => $this->value,
            'unit' => $this->unit,
            'reference_range' => $this->reference_range,
            'notes' => $this->notes,
            'status' => $this->status->value,
            'entered_by' => $this->entered_by,
            'entered_at' => $this->entered_at->toISOString(),
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toISOString(),
            'correction_reason' => $this->correction_reason,
            'corrected_by' => [
                'id' => $this->corrected_by,
                'name' => $this->corrector_name,
            ],
            'corrected_at' => $this->corrected_at->toISOString(),
        ];
    }
}
