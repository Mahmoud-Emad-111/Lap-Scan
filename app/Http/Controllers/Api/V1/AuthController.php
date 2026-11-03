<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function store(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $identifier = $credentials['identifier'] ?? $credentials['email'];
        $user = User::query()->where('email', $identifier)->first();

        if ($user === null && ! filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $matchingUsers = User::query()
                ->where('phone', $identifier)
                ->orWhereHas('patientProfile', function ($patients) use ($identifier): void {
                    $patients->where('phone', $identifier)
                        ->whereHas(
                            'user',
                            fn ($users) => $users->where('role', UserRole::Patient),
                        );
                })
                ->limit(2)
                ->get();
            $user = $matchingUsers->count() === 1 ? $matchingUsers->first() : null;
        }

        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'The provided credentials are invalid.'], 401);
        }

        $token = $user->createToken(
            $credentials['device_name'],
            ['*'],
            now()->addMinutes((int) config('sanctum.expiration')),
        );

        return response()->json([
            'data' => [
                'token' => $token->plainTextToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role->value,
                    'doctor_verification_status' => $this->doctorVerificationStatus($user),
                ],
            ],
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role->value,
                'doctor_verification_status' => $this->doctorVerificationStatus($user),
            ],
        ]);
    }

    private function doctorVerificationStatus(User $user): ?string
    {
        if ($user->role !== UserRole::Doctor) {
            return null;
        }

        $doctorProfile = $user->doctorProfile()->first();

        if ($doctorProfile === null) {
            return DoctorVerificationStatus::Pending->value;
        }

        return $doctorProfile->verification_status->value;
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
