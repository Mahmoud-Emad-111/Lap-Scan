<?php

namespace App\Modules\Shifts\Actions;

use App\Models\ShiftAttendance;
use App\Models\ShiftSchedule;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordShiftAttendanceAction
{
    public function clockIn(ShiftSchedule $schedule, User $staff, string $shiftDate): ShiftAttendance
    {
        return DB::transaction(function () use ($schedule, $staff, $shiftDate): ShiftAttendance {
            $lockedSchedule = ShiftSchedule::query()
                ->whereKey($schedule->id)
                ->lockForUpdate()
                ->firstOrFail();
            $date = CarbonImmutable::parse($shiftDate, config('app.timezone'));

            $this->assertAssignedStaff($lockedSchedule, $staff);
            $this->assertOccurrence($lockedSchedule, $date, true);

            if (! now()->isSameDay($date)) {
                throw ValidationException::withMessages([
                    'shift_date' => 'يمكن تسجيل الحضور في يوم المناوبة فقط.',
                ]);
            }

            $attendance = ShiftAttendance::query()
                ->where('shift_schedule_id', $lockedSchedule->id)
                ->whereDate('shift_date', $shiftDate)
                ->lockForUpdate()
                ->first();

            if ($attendance !== null) {
                throw ValidationException::withMessages([
                    'shift_date' => 'تم تسجيل الحضور لهذه المناوبة بالفعل.',
                ]);
            }

            return ShiftAttendance::query()->create([
                'shift_schedule_id' => $lockedSchedule->id,
                'shift_date' => $shiftDate,
                'clocked_in_at' => now(),
            ]);
        }, 3);
    }

    public function clockOut(ShiftSchedule $schedule, User $staff, string $shiftDate): ShiftAttendance
    {
        return DB::transaction(function () use ($schedule, $staff, $shiftDate): ShiftAttendance {
            $lockedSchedule = ShiftSchedule::query()
                ->whereKey($schedule->id)
                ->lockForUpdate()
                ->firstOrFail();
            $date = CarbonImmutable::parse($shiftDate, config('app.timezone'));
            $this->assertAssignedStaff($lockedSchedule, $staff);
            $attendance = ShiftAttendance::query()
                ->where('shift_schedule_id', $lockedSchedule->id)
                ->whereDate('shift_date', $shiftDate)
                ->lockForUpdate()
                ->first();

            if ($attendance === null || $attendance->clocked_in_at === null) {
                throw ValidationException::withMessages([
                    'shift_date' => 'يجب تسجيل الحضور قبل الانصراف.',
                ]);
            }

            $this->assertOccurrence($lockedSchedule, $date, false);
            $allowedClockOutDate = $lockedSchedule->ends_at < $lockedSchedule->starts_at
                ? $date->addDay()
                : $date;

            if (! now()->isSameDay($date) && ! now()->isSameDay($allowedClockOutDate)) {
                throw ValidationException::withMessages([
                    'shift_date' => 'لا يمكن تسجيل الانصراف خارج يوم المناوبة.',
                ]);
            }

            if ($attendance->clocked_out_at !== null) {
                throw ValidationException::withMessages([
                    'shift_date' => 'تم تسجيل الانصراف لهذه المناوبة بالفعل.',
                ]);
            }

            $attendance->update(['clocked_out_at' => now()]);

            return $attendance->refresh();
        }, 3);
    }

    private function assertOccurrence(
        ShiftSchedule $schedule,
        CarbonImmutable $date,
        bool $requireActive,
    ): void {
        if (
            $date->dayOfWeek !== $schedule->day_of_week
            || $date->toDateString() < $schedule->effective_from->toDateString()
            || (
                $schedule->effective_until !== null
                && $date->toDateString() > $schedule->effective_until->toDateString()
            )
            || ($requireActive && ! $schedule->is_active)
        ) {
            throw ValidationException::withMessages([
                'shift_date' => 'هذا التاريخ لا يطابق موعد المناوبة النشطة.',
            ]);
        }
    }

    private function assertAssignedStaff(ShiftSchedule $schedule, User $staff): void
    {
        if ($schedule->user_id !== $staff->id) {
            throw ValidationException::withMessages([
                'shift_schedule' => 'هذه المناوبة غير مسندة إليك.',
            ]);
        }
    }
}
