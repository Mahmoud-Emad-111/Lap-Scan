<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ShiftSchedule;
use App\Models\User;

class ShiftSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::LabAdmin;
    }

    public function view(User $user, ShiftSchedule $shiftSchedule): bool
    {
        return $user->role === UserRole::LabAdmin
            || ($user->role === UserRole::LabStaff && $shiftSchedule->user_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::LabAdmin;
    }

    public function update(User $user, ShiftSchedule $shiftSchedule): bool
    {
        return $user->role === UserRole::LabAdmin;
    }

    public function delete(User $user, ShiftSchedule $shiftSchedule): bool
    {
        return false;
    }

    public function viewCalendar(User $user): bool
    {
        return in_array($user->role, [UserRole::LabStaff, UserRole::LabAdmin], true);
    }

    public function clockAttendance(User $user, ShiftSchedule $shiftSchedule): bool
    {
        return $user->role === UserRole::LabStaff
            && $shiftSchedule->user_id === $user->id;
    }
}
