<?php

namespace App\Http\Resources\Api\V1;

use App\Models\ReferralDiscountRule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ReferralDiscountRule */
class ReferralDiscountRuleResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'discount_type' => $this->discount_type->value,
            'discount_value' => $this->discount_value,
            'minimum_subtotal' => $this->minimum_subtotal,
            'maximum_discount' => $this->maximum_discount,
            'valid_from' => $this->valid_from?->toDateString(),
            'valid_until' => $this->valid_until?->toDateString(),
            'doctor' => $this->whenLoaded('doctor', fn (): ?array => $this->doctor === null
                ? null
                : ['id' => $this->doctor->id, 'name' => $this->doctor->name]),
            'branch' => $this->whenLoaded('branch', fn (): ?array => $this->branch === null
                ? null
                : ['id' => $this->branch->id, 'name' => $this->branch->name]),
            'referral_scope' => $this->referral_scope->value,
            'is_active' => $this->is_active,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
