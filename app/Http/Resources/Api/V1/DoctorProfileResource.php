<?php

namespace App\Http\Resources\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class DoctorProfileResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $profile = $this->doctorProfile;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $profile?->phone,
            'specialty' => $profile?->specialty,
            'license_number' => $profile?->license_number,
            'verification_status' => $profile?->verification_status->value
                ?? DoctorVerificationStatus::Pending->value,
            'verification_note' => $profile?->verification_note,
            'reviewed_at' => $profile?->reviewed_at?->toISOString(),
            'verified_at' => $profile?->verified_at?->toISOString(),
            'reviewed_by' => $profile?->reviewed_by,
        ];
    }
}
