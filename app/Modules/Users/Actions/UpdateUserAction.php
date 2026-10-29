<?php

namespace App\Modules\Users\Actions;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateUserAction
{
    /**
     * @param  array{name?: string, email?: string, password?: string, role?: string, branch_ids?: list<int>}  $attributes
     */
    public function handle(User $user, array $attributes): User
    {
        return DB::transaction(function () use ($user, $attributes): User {
            $branchIds = $attributes['branch_ids'] ?? null;
            unset($attributes['branch_ids']);

            if (isset($attributes['role'])) {
                $user->forceFill(['role' => UserRole::from($attributes['role'])]);
                unset($attributes['role']);
            }

            $user->fill($attributes)->save();

            if ($branchIds !== null || $user->role !== UserRole::LabStaff) {
                $user->branches()->sync($branchIds ?? []);
            }

            return $user->refresh()->load('branches');
        });
    }
}
