<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\LabResult;
use App\Models\User;

class LabResultPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role->canManageOrders();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LabResult $labResult): bool
    {
        return $user->role === UserRole::LabAdmin
            || ($user->role === UserRole::LabStaff
                && $user->branches()->whereKey($labResult->orderItem->order->branch_id)->exists());
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, LabResult $labResult): bool
    {
        return $this->view($user, $labResult);
    }

    public function correct(User $user, LabResult $labResult): bool
    {
        return $this->view($user, $labResult);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LabResult $labResult): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LabResult $labResult): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LabResult $labResult): bool
    {
        return false;
    }
}
