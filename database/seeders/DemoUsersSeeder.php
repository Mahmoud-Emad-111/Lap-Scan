<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Demo accounts can only be seeded outside production.');
        }

        $password = config('lab.demo_password');

        if (! is_string($password) || strlen($password) < 8) {
            throw new RuntimeException('LAB_DEMO_PASSWORD must contain at least 8 characters.');
        }

        $defaultBranch = Branch::query()->where('is_default', true)->firstOrFail();
        $accounts = [
            ['name' => 'مدير المختبر التجريبي', 'email' => 'admin@lab.test', 'role' => UserRole::LabAdmin],
            ['name' => 'موظف المختبر التجريبي', 'email' => 'staff@lab.test', 'role' => UserRole::LabStaff],
            ['name' => 'طبيب تجريبي', 'email' => 'doctor@lab.test', 'role' => UserRole::Doctor],
            ['name' => 'مريض تجريبي', 'email' => 'patient@lab.test', 'role' => UserRole::Patient],
        ];

        foreach ($accounts as $account) {
            $user = User::query()->firstOrCreate(
                ['email' => $account['email']],
                ['name' => $account['name'], 'password' => $password],
            );
            $user->forceFill(['role' => $account['role']])->save();
        }

        User::query()
            ->where('email', 'staff@lab.test')
            ->firstOrFail()
            ->branches()
            ->syncWithoutDetaching([$defaultBranch->id]);

        $patientUser = User::query()->where('email', 'patient@lab.test')->firstOrFail();
        Patient::query()->firstOrCreate(
            ['user_id' => $patientUser->id],
            [
                'full_name' => 'مريض تجريبي',
                'phone' => '01000000000',
                'email' => $patientUser->email,
                'gender' => 'other',
            ],
        );
    }
}
