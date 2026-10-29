<?php

namespace App\Http\Resources\Api\V1;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin OrderItem */
class OrderItemResource extends JsonResource
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
            'test_id' => $this->test_id,
            'test_code' => $this->test_code,
            'test_name' => $this->test_name,
            'specimen_type' => $this->specimen_type,
            'price' => $this->price,
            'sample' => $this->whenLoaded('sample', fn () => SampleResource::make($this->sample)),
            'result' => $this->whenLoaded('result', fn () => LabResultResource::make($this->result)),
        ];
    }
}
