<?php

namespace App\Http\Resources\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'doctor_verification_status' => $this->when(
                $this->role === UserRole::Doctor,
                fn (): string => $this->doctorProfile?->verification_status->value
                    ?? DoctorVerificationStatus::Pending->value,
            ),
            'branches' => $this->whenLoaded('branches', fn (): array => $this->branches
                ->map(fn (Branch $branch): array => ['id' => $branch->id, 'name' => $branch->name])
                ->values()
                ->all()),
        ];
    }
}
