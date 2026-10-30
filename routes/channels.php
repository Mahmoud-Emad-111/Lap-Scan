<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel(
    'branches.{branch}.orders',
    function (User $user, int|string $branch): bool {
        return $user->role === UserRole::LabAdmin
            || (
                $user->role === UserRole::LabStaff
                && $user->branches()->whereKey($branch)->exists()
            );
    },
);
