<?php

namespace App\Modules\Users\Actions;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateUserAction
{
    /**
     * @param  array{name: string, email: string, password: string, role: string, branch_ids?: list<int>}  $attributes
     */
    public function handle(array $attributes): User
    {
        return DB::transaction(function () use ($attributes): User {
            $user = User::query()->create([
                'name' => $attributes['name'],
                'email' => $attributes['email'],
                'password' => $attributes['password'],
            ]);
            $user->forceFill(['role' => UserRole::from($attributes['role'])])->save();
            $user->branches()->sync($attributes['branch_ids'] ?? []);

            return $user->load('branches');
        });
    }
}
