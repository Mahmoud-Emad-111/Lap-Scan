<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ShiftAttendanceRequest;
use App\Http\Resources\Api\V1\ShiftAttendanceResource;
use App\Models\ShiftAttendance;
use App\Models\ShiftSchedule;
use App\Modules\Shifts\Actions\RecordShiftAttendanceAction;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ShiftAttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewCalendar', ShiftSchedule::class);
        $filters = $request->validate([
            'week' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'branch_id' => ['sometimes', 'nullable', 'integer', 'exists:branches,id'],
            'user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ]);
        $weekStart = CarbonImmutable::parse(
            $filters['week'] ?? now()->toDateString(),
            config('app.timezone'),
        )->startOfWeek(CarbonImmutable::SUNDAY);
        $weekEnd = $weekStart->addDays(6);
        $dates = collect(range(0, 6))->map(fn (int $offset): CarbonImmutable => $weekStart->addDays($offset));
        $schedules = ShiftSchedule::query()
            ->with([
                'user:id,name',
                'branch:id,name',
                'attendances' => fn ($query) => $query->whereBetween('shift_date', [
                    $weekStart->toDateString(),
                    $weekEnd->toDateString(),
                ]),
            ])
            ->where(function ($query) use ($weekStart, $weekEnd): void {
                $query->where('is_active', true)
                    ->orWhereHas('attendances', fn ($attendances) => $attendances->whereBetween('shift_date', [
                        $weekStart->toDateString(),
                        $weekEnd->toDateString(),
                    ]));
            })
            ->whereIn('day_of_week', $dates->map(fn (CarbonImmutable $date): int => $date->dayOfWeek)->unique())
            ->whereDate('effective_from', '<=', $weekEnd->toDateString())
            ->where(function ($query) use ($weekStart): void {
                $query->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $weekStart->toDateString());
            })
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->where('user_id', $request->user()->id),
            )
            ->when(isset($filters['user_id']), fn ($query) => $query->where('user_id', $filters['user_id']))
            ->when(isset($filters['branch_id']), fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->orderBy('day_of_week')
            ->orderBy('starts_at')
            ->orderBy('id')
            ->paginate(100)
            ->withQueryString();
        $occurrences = $schedules->getCollection()
            ->flatMap(function (ShiftSchedule $schedule) use ($dates): array {
                return $dates
                    ->filter(fn (CarbonImmutable $date): bool => $date->dayOfWeek === $schedule->day_of_week)
                    ->filter(fn (CarbonImmutable $date): bool => (
                        $date->toDateString() >= $schedule->effective_from->toDateString()
                        && (
                            $schedule->effective_until === null
                            || $date->toDateString() <= $schedule->effective_until->toDateString()
                        )
                    ))
                    ->map(fn (CarbonImmutable $date): array => $this->occurrence($schedule, $date))
                    ->all();
            })
            ->sortBy('starts_at')
            ->values();
        $schedules->setCollection($occurrences);

        return response()->json($schedules);
    }

    public function clockIn(
        ShiftAttendanceRequest $request,
        ShiftSchedule $shiftSchedule,
        RecordShiftAttendanceAction $recordAttendance,
    ): JsonResponse {
        $attendance = $recordAttendance->clockIn(
            $shiftSchedule,
            $request->user(),
            $request->validated('shift_date'),
        );

        return ShiftAttendanceResource::make($attendance)->response()->setStatusCode(201);
    }

    public function clockOut(
        ShiftAttendanceRequest $request,
        ShiftSchedule $shiftSchedule,
        RecordShiftAttendanceAction $recordAttendance,
    ): ShiftAttendanceResource {
        return ShiftAttendanceResource::make($recordAttendance->clockOut(
            $shiftSchedule,
            $request->user(),
            $request->validated('shift_date'),
        ));
    }

    /**
     * @return array<string, mixed>
     */
    private function occurrence(ShiftSchedule $schedule, CarbonImmutable $date): array
    {
        $timezone = config('app.timezone');
        $startsAt = CarbonImmutable::parse($date->toDateString().' '.$schedule->starts_at, $timezone);
        $endsAt = CarbonImmutable::parse($date->toDateString().' '.$schedule->ends_at, $timezone);

        if ($endsAt <= $startsAt) {
            $endsAt = $endsAt->addDay();
        }

        $attendance = $schedule->attendances->first(
            fn (ShiftAttendance $attendance): bool => $attendance->shift_date->toDateString() === $date->toDateString(),
        );

        return [
            'shift_schedule_id' => $schedule->id,
            'shift_date' => $date->toDateString(),
            'starts_at' => $startsAt->toISOString(),
            'ends_at' => $endsAt->toISOString(),
            'branch' => ['id' => $schedule->branch->id, 'name' => $schedule->branch->name],
            'user' => ['id' => $schedule->user->id, 'name' => $schedule->user->name],
            'attendance' => $attendance === null ? null : [
                'id' => $attendance->id,
                'clocked_in_at' => $attendance->clocked_in_at?->toISOString(),
                'clocked_out_at' => $attendance->clocked_out_at?->toISOString(),
            ],
        ];
    }
}
