<?php

namespace App\Http\Resources\Api\V1;

use App\Enums\UserRole;
use App\Models\PatientPromotion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PatientPromotion */
class PatientPromotionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind->value,
            'name' => $this->name,
            'description' => $this->description,
            'code' => $this->code,
            'discount_type' => $this->discount_type->value,
            'discount_value' => $this->discount_value,
            'minimum_subtotal' => $this->minimum_subtotal,
            'maximum_discount' => $this->maximum_discount,
            'valid_from' => $this->valid_from?->toDateString(),
            'valid_until' => $this->valid_until?->toDateString(),
            'validity_days' => $this->validity_days,
            'usage_limit' => $this->usage_limit,
            'used_count' => $request->user()?->role === UserRole::LabAdmin
                ? $this->used_count
                : null,
            'per_patient_limit' => $this->per_patient_limit,
            'is_active' => $this->is_active,
            'tests' => $this->whenLoaded('tests', fn () => $this->tests->map(
                fn ($test): array => [
                    'id' => $test->id,
                    'name' => $test->name,
                    'code' => $test->code,
                ],
            )),
        ];
    }
}
