<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePatientAddressRequest;
use App\Http\Requests\Api\V1\UpdatePatientAddressRequest;
use App\Http\Resources\Api\V1\PatientAddressResource;
use App\Models\PatientAddress;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PatientAddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $this->authorizePatient($user);

        return PatientAddressResource::collection(
            $user
                ->patientAddresses()
                ->orderByDesc('is_default')
                ->orderBy('id')
                ->get(),
        );
    }

    public function store(StorePatientAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $attributes = $request->validated();
        $address = DB::transaction(function () use ($user, $attributes): PatientAddress {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $isFirstAddress = ! $user->patientAddresses()->exists();
            $makeDefault = ($attributes['is_default'] ?? false) || $isFirstAddress;

            if ($makeDefault) {
                $user->patientAddresses()->update(['is_default' => false]);
            }

            $attributes['is_default'] = $makeDefault;

            return $user->patientAddresses()->create($attributes);
        });

        return PatientAddressResource::make($address)->response()->setStatusCode(201);
    }

    public function update(
        UpdatePatientAddressRequest $request,
        PatientAddress $patientAddress,
    ): PatientAddressResource {
        $user = $request->user();
        $address = $user->patientAddresses()->whereKey($patientAddress->id)->firstOrFail();
        $attributes = $request->validated();

        DB::transaction(function () use ($user, $address, $attributes): void {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->firstOrFail();

            if (($attributes['is_default'] ?? false) === true) {
                $user->patientAddresses()
                    ->where('id', '<>', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($attributes);

            if ($address->is_default === false) {
                $hasAnotherDefault = $user->patientAddresses()
                    ->where('is_default', true)
                    ->exists();

                if (! $hasAnotherDefault) {
                    $user->patientAddresses()
                        ->where('id', '<>', $address->id)
                        ->orderBy('id')
                        ->first()
                        ?->update(['is_default' => true]);
                }
            }
        });

        return PatientAddressResource::make($address->refresh());
    }

    public function destroy(
        Request $request,
        PatientAddress $patientAddress,
    ): JsonResponse {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $this->authorizePatient($user);
        $address = $user->patientAddresses()->whereKey($patientAddress->id)->firstOrFail();
        $wasDefault = $address->is_default;

        DB::transaction(function () use ($address, $user, $wasDefault): void {
            $user->newQuery()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $address->delete();

            if ($wasDefault) {
                $user->patientAddresses()
                    ->orderBy('id')
                    ->first()
                    ?->update(['is_default' => true]);
            }
        });

        return response()->json(['message' => 'تم حذف العنوان.']);
    }

    private function authorizePatient(User $user): void
    {
        abort_unless(
            $user->role === UserRole::Patient && $user->patientProfile()->exists(),
            403,
        );
    }
}
