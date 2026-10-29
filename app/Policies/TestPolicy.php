<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User;

class TestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Test $test): bool
    {
        return $test->is_active || $user->role->canManageCatalog();
    }

    public function create(User $user): bool
    {
        return $user->role->canManageCatalog();
    }

    public function update(User $user, Test $test): bool
    {
        return $user->role->canManageCatalog();
    }
}
