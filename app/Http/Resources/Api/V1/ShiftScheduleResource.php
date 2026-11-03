<?php

namespace App\Http\Resources\Api\V1;

use App\Models\ShiftSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ShiftSchedule */
class ShiftScheduleResource extends JsonResource
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
            'branch' => $this->whenLoaded('branch', fn (): array => [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
            ]),
            'user' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'day_of_week' => $this->day_of_week,
            'starts_at' => substr((string) $this->starts_at, 0, 5),
            'ends_at' => substr((string) $this->ends_at, 0, 5),
            'effective_from' => $this->effective_from->toDateString(),
            'effective_until' => $this->effective_until?->toDateString(),
            'is_active' => $this->is_active,
        ];
    }
}
