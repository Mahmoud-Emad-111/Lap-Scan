<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Test;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class DemoLabDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('Demo laboratory data can only be seeded outside production.');
        }

        $catalog = [
            ['code' => 'DEMO-CBC', 'name' => 'صورة دم كاملة - تجريبي', 'specimen_type' => 'دم كامل', 'price' => '250.00'],
            ['code' => 'DEMO-GLU', 'name' => 'سكر صائم - تجريبي', 'specimen_type' => 'مصل', 'price' => '100.00'],
            ['code' => 'DEMO-TSH', 'name' => 'هرمون الغدة الدرقية - تجريبي', 'specimen_type' => 'مصل', 'price' => '300.00'],
        ];

        foreach ($catalog as $test) {
            Test::query()->firstOrCreate(
                ['code' => $test['code']],
                [
                    ...$test,
                    'description' => 'بيانات تعليمية للتجربة فقط، ولا تمثل نتيجة أو توصية طبية.',
                    'turnaround_time_minutes' => 240,
                    'is_active' => true,
                ],
            );
        }

        $patient = Patient::query()
            ->whereHas('user', fn ($query) => $query->where('email', 'patient@lab.test'))
            ->firstOrFail();
        $branch = Branch::query()->where('is_default', true)->firstOrFail();
        $admin = User::query()->where('email', 'admin@lab.test')->firstOrFail();
        $order = Order::query()->firstOrCreate(
            ['order_number' => 'DEMO-ORDER-0001'],
            [
                'branch_id' => $branch->id,
                'patient_id' => $patient->id,
                'created_by' => $admin->id,
                'status' => 'registered',
                'notes' => 'طلب توضيحي ببيانات غير حقيقية.',
                'total' => '250.00',
            ],
        );

        if ($order->items()->exists()) {
            return;
        }

        $test = Test::query()->where('code', 'DEMO-CBC')->firstOrFail();
        $item = $order->items()->create([
            'test_id' => $test->id,
            'test_code' => $test->code,
            'test_name' => $test->name,
            'specimen_type' => $test->specimen_type,
            'price' => $test->price,
        ]);
        $item->sample()->create([
            'barcode' => 'DEMO-SAMPLE-0001',
            'specimen_type' => $test->specimen_type,
        ]);
    }
}
