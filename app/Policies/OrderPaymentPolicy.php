<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\OrderPayment;
use App\Models\User;

class OrderPaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [UserRole::LabStaff, UserRole::LabAdmin], true);
    }

    public function view(User $user, OrderPayment $orderPayment): bool
    {
        return $user->role === UserRole::LabAdmin
            || ($user->role === UserRole::LabStaff
                && $user->branches()->whereKey($orderPayment->branch_id)->exists());
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::LabStaff, UserRole::LabAdmin], true);
    }

    public function viewFinanceReport(User $user): bool
    {
        return $user->role === UserRole::LabAdmin;
    }

    public function update(User $user, OrderPayment $orderPayment): bool
    {
        return false;
    }

    public function delete(User $user, OrderPayment $orderPayment): bool
    {
        return false;
    }
}
