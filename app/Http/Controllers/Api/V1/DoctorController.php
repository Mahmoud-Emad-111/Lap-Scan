<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateDoctorVerificationRequest;
use App\Http\Resources\Api\V1\DoctorProfileResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('manageDoctors', User::class);

        return DoctorProfileResource::collection(
            User::query()
                ->where('role', UserRole::Doctor->value)
                ->with('doctorProfile')
                ->orderBy('name')
                ->orderBy('id')
                ->paginate(25),
        );
    }

    public function updateVerification(
        UpdateDoctorVerificationRequest $request,
        User $doctor,
    ): DoctorProfileResource {
        abort_unless($doctor->role === UserRole::Doctor, 404);

        $profile = $doctor->doctorProfile;

        if ($profile === null) {
            throw ValidationException::withMessages([
                'doctor_profile' => 'يجب استكمال بيانات ترخيص الطبيب قبل مراجعة الحساب.',
            ]);
        }

        $status = DoctorVerificationStatus::from($request->validated('verification_status'));
        $profile->forceFill([
            'verification_status' => $status,
            'verification_note' => $request->validated('verification_note'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'verified_by' => $status === DoctorVerificationStatus::Verified
                ? $request->user()->id
                : null,
            'verified_at' => $status === DoctorVerificationStatus::Verified
                ? now()
                : null,
        ])->save();

        return DoctorProfileResource::make($doctor->load('doctorProfile'));
    }
}
