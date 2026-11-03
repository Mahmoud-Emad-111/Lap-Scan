<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use App\Models\ShiftSchedule;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreShiftScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ShiftSchedule::class) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i'],
            'effective_from' => ['required', 'date_format:Y-m-d'],
            'effective_until' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:effective_from'],
        ];
    }

    /** @return array<int, \Closure(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->hasAny([
                    'branch_id',
                    'user_id',
                    'day_of_week',
                    'starts_at',
                    'ends_at',
                    'effective_from',
                    'effective_until',
                ])) {
                    return;
                }

                if ($this->string('starts_at')->value() === $this->string('ends_at')->value()) {
                    $validator->errors()->add('ends_at', 'يجب أن يختلف وقت الانتهاء عن وقت البداية.');

                    return;
                }

                $staff = User::query()->find($this->integer('user_id'));

                if ($staff?->role !== UserRole::LabStaff) {
                    $validator->errors()->add('user_id', 'يجب إسناد المناوبة إلى موظف مختبر.');

                    return;
                }

                if (! $staff->branches()->whereKey($this->integer('branch_id'))->exists()) {
                    $validator->errors()->add('branch_id', 'الموظف غير مرتبط بهذا الفرع.');

                    return;
                }

                $this->validateNoOverlappingSchedule($validator, $staff);
            },
        ];
    }

    private function validateNoOverlappingSchedule(Validator $validator, User $staff): void
    {
        $newStart = $this->string('starts_at')->value();
        $newEnd = $this->string('ends_at')->value();
        $effectiveFrom = CarbonImmutable::parse($this->string('effective_from')->value());
        $effectiveUntil = $this->input('effective_until') === null
            ? null
            : CarbonImmutable::parse($this->string('effective_until')->value());
        $schedules = ShiftSchedule::query()
            ->where('user_id', $staff->id)
            ->where('is_active', true)
            ->whereDate('effective_from', '<=', $effectiveUntil?->addDay()->toDateString() ?? '9999-12-31')
            ->where(function ($query) use ($effectiveFrom): void {
                $query->whereNull('effective_until')
                    ->orWhereDate('effective_until', '>=', $effectiveFrom->subDay()->toDateString());
            })
            ->get();

        foreach ($schedules as $schedule) {
            $candidateStart = $effectiveFrom->greaterThan($schedule->effective_from->toImmutable()->subDay())
                ? $effectiveFrom
                : $schedule->effective_from->toImmutable()->subDay();
            $lastDateToCheck = $effectiveUntil ?? $candidateStart->addDays(6);

            if ($schedule->effective_until !== null) {
                $existingUntil = $schedule->effective_until->toImmutable()->addDay();

                if ($existingUntil->lessThan($lastDateToCheck)) {
                    $lastDateToCheck = $existingUntil;
                }
            }

            $maximumWeekDate = $candidateStart->addDays(6);

            if ($maximumWeekDate->lessThan($lastDateToCheck)) {
                $lastDateToCheck = $maximumWeekDate;
            }

            for ($date = $candidateStart; $date->lessThanOrEqualTo($lastDateToCheck); $date = $date->addDay()) {
                if (
                    $date->toDateString() < $effectiveFrom->toDateString()
                    || ($effectiveUntil !== null && $date->toDateString() > $effectiveUntil->toDateString())
                    || $date->dayOfWeek !== $this->integer('day_of_week')
                ) {
                    continue;
                }

                foreach ([$date->subDay(), $date, $date->addDay()] as $existingDate) {
                    if (
                        $existingDate->dayOfWeek !== $schedule->day_of_week
                        || $existingDate->toDateString() < $schedule->effective_from->toDateString()
                        || (
                            $schedule->effective_until !== null
                            && $existingDate->toDateString() > $schedule->effective_until->toDateString()
                        )
                    ) {
                        continue;
                    }

                    if ($this->timesOverlap(
                        $date,
                        $existingDate,
                        $newStart,
                        $newEnd,
                        $schedule->starts_at,
                        $schedule->ends_at,
                    )) {
                        $validator->errors()->add('starts_at', 'لدى الموظف مناوبة أخرى تتداخل مع اليوم والوقت المحددين.');

                        return;
                    }
                }
            }
        }
    }

    private function timesOverlap(
        CarbonImmutable $date,
        CarbonImmutable $existingDate,
        string $newStart,
        string $newEnd,
        string $existingStart,
        string $existingEnd,
    ): bool {
        $timezone = config('app.timezone');
        $newStartAt = CarbonImmutable::parse($date->toDateString().' '.$newStart, $timezone);
        $newEndAt = CarbonImmutable::parse($date->toDateString().' '.$newEnd, $timezone);
        $existingStartAt = CarbonImmutable::parse($existingDate->toDateString().' '.$existingStart, $timezone);
        $existingEndAt = CarbonImmutable::parse($existingDate->toDateString().' '.$existingEnd, $timezone);

        if ($newEndAt <= $newStartAt) {
            $newEndAt = $newEndAt->addDay();
        }

        if ($existingEndAt <= $existingStartAt) {
            $existingEndAt = $existingEndAt->addDay();
        }

        return $newStartAt < $existingEndAt && $newEndAt > $existingStartAt;
    }
}
