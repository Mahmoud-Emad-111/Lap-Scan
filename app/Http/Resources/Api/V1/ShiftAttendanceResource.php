<?php

namespace App\Http\Resources\Api\V1;

use App\Models\ShiftAttendance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ShiftAttendance */
class ShiftAttendanceResource extends JsonResource
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
            'shift_schedule_id' => $this->shift_schedule_id,
            'shift_date' => $this->shift_date->toDateString(),
            'clocked_in_at' => $this->clocked_in_at?->toISOString(),
            'clocked_out_at' => $this->clocked_out_at?->toISOString(),
        ];
    }
}
