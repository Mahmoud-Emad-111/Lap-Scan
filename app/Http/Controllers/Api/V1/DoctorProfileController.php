<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateDoctorProfileRequest;
use App\Http\Resources\Api\V1\DoctorProfileResource;
use App\Models\DoctorProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorProfileController extends Controller
{
    public function show(Request $request): DoctorProfileResource
    {
        abort_unless($request->user()->role === UserRole::Doctor, 403);

        return DoctorProfileResource::make($request->user()->load('doctorProfile'));
    }

    public function update(UpdateDoctorProfileRequest $request): DoctorProfileResource
    {
        $user = $request->user();
        $attributes = $request->validated();

        DB::transaction(function () use ($user, $attributes): void {
            $profile = DoctorProfile::query()->firstOrNew(['user_id' => $user->id]);
            $profileNeedsReview = ! $profile->exists
                || $profile->phone !== $attributes['phone']
                || $profile->specialty !== $attributes['specialty']
                || $profile->license_number !== $attributes['license_number']
                || $user->name !== $attributes['name'];
            $profile->fill([
                'phone' => $attributes['phone'],
                'specialty' => $attributes['specialty'],
                'license_number' => $attributes['license_number'],
            ]);

            $user->name = $attributes['name'];
            $user->save();

            if ($profileNeedsReview) {
                $profile->forceFill([
                    'verification_status' => DoctorVerificationStatus::Pending,
                    'verification_note' => null,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    'verified_by' => null,
                    'verified_at' => null,
                ]);
            }

            $profile->save();
        });

        return DoctorProfileResource::make($user->refresh()->load('doctorProfile'));
    }
}
