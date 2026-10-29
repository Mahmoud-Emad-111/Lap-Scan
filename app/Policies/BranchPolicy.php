<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [UserRole::LabStaff, UserRole::LabAdmin], true);
    }

    public function view(User $user, Branch $branch): bool
    {
        return $user->isLabAdministrator()
            || ($user->role === UserRole::LabStaff && $branch->users()->whereKey($user->id)->exists());
    }

    public function create(User $user): bool
    {
        return $user->isLabAdministrator();
    }

    public function update(User $user, Branch $branch): bool
    {
        return $user->isLabAdministrator();
    }
}
