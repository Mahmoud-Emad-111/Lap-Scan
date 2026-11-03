<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreShiftScheduleRequest;
use App\Http\Requests\Api\V1\UpdateShiftScheduleRequest;
use App\Http\Resources\Api\V1\ShiftScheduleResource;
use App\Models\ShiftSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ShiftScheduleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', ShiftSchedule::class);

        return ShiftScheduleResource::collection(
            ShiftSchedule::query()
                ->with(['user:id,name', 'branch:id,name'])
                ->orderBy('day_of_week')
                ->orderBy('starts_at')
                ->orderBy('id')
                ->paginate(25),
        );
    }

    public function store(StoreShiftScheduleRequest $request): JsonResponse
    {
        $schedule = ShiftSchedule::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return ShiftScheduleResource::make($schedule->load(['user:id,name', 'branch:id,name']))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateShiftScheduleRequest $request, ShiftSchedule $shiftSchedule): ShiftScheduleResource
    {
        $shiftSchedule->update($request->validated());

        return ShiftScheduleResource::make($shiftSchedule->load(['user:id,name', 'branch:id,name']));
    }
}
