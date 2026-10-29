<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Test */
class TestResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'specimen_type' => $this->specimen_type,
            'price' => $this->price,
            'turnaround_time_minutes' => $this->turnaround_time_minutes,
            'is_active' => $this->is_active,
        ];
    }
}
