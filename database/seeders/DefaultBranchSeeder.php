<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class DefaultBranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Branch::query()->firstOrCreate(
            ['code' => 'main'],
            [
                'name' => 'الفرع الرئيسي',
                'is_active' => true,
                'is_default' => true,
            ],
        );
    }
}
