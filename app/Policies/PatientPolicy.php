<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role->canManagePatients();
    }

    public function view(User $user, Patient $patient): bool
    {
        return $user->role->canManagePatients();
    }

    public function create(User $user): bool
    {
        return $user->role->canManagePatients();
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->role->canManagePatients();
    }
}
