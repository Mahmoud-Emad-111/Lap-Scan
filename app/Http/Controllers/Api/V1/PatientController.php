<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePatientRequest;
use App\Http\Requests\Api\V1\UpdatePatientRequest;
use App\Http\Resources\Api\V1\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PatientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Patient::class);
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        return PatientResource::collection(
            Patient::query()
                ->when(
                    isset($filters['search']) && $filters['search'] !== '',
                    fn ($patients) => $patients->where(function ($patients) use ($filters): void {
                        $search = $filters['search'];
                        $patients
                            ->where('full_name', 'like', '%'.$search.'%')
                            ->orWhere('phone', 'like', '%'.$search.'%');
                    }),
                )
                ->orderBy('full_name')
                ->orderBy('id')
                ->paginate(25)
                ->withQueryString(),
        );
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = Patient::query()->create($request->validated());

        return PatientResource::make($patient)->response()->setStatusCode(201);
    }

    public function show(Patient $patient): PatientResource
    {
        Gate::authorize('view', $patient);

        return PatientResource::make($patient);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        $patient->update($request->validated());

        return PatientResource::make($patient->refresh());
    }
}
