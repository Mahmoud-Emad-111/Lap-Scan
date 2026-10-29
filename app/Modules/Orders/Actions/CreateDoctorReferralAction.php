<?php

namespace App\Modules\Orders\Actions;

use App\Enums\DoctorVerificationStatus;
use App\Enums\OrderPriority;
use App\Enums\OrderSource;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateDoctorReferralAction
{
    /**
     * @param  array{
     *     request_key: string,
     *     patient_id?: int|null,
     *     patient_full_name?: string|null,
     *     patient_phone: string,
     *     patient_email?: string|null,
     *     patient_date_of_birth?: string|null,
     *     patient_gender?: string|null,
     *     branch_id: int,
     *     test_ids: list<int>,
     *     priority: string,
     *     urgent_reason?: string|null,
     *     notes?: string|null
     * }  $attributes
     */
    public function handle(
        array $attributes,
        User $doctor,
        CreateOrderAction $createOrder,
    ): Order {
        return DB::transaction(function () use ($attributes, $doctor, $createOrder): Order {
            $profile = $doctor->doctorProfile()->lockForUpdate()->first();

            if (
                $doctor->role !== UserRole::Doctor
                || $profile?->verification_status !== DoctorVerificationStatus::Verified
            ) {
                throw ValidationException::withMessages([
                    'doctor' => 'يجب اعتماد حساب الطبيب قبل إرسال الإحالات.',
                ]);
            }

            $existingOrder = Order::query()
                ->where('referring_doctor_id', $doctor->id)
                ->where('request_key', $attributes['request_key'])
                ->first();

            if ($existingOrder !== null) {
                return $existingOrder->load([
                    'branch',
                    'patient',
                    'referringDoctor',
                    'items.sample',
                    'items.test',
                ]);
            }

            $branch = Branch::query()
                ->whereKey($attributes['branch_id'])
                ->where('is_active', true)
                ->first();

            if ($branch === null) {
                throw ValidationException::withMessages([
                    'branch_id' => 'الفرع المحدد غير متاح لاستقبال الطلبات.',
                ]);
            }

            $patient = $this->resolvePatient($attributes);
            $patient = Patient::query()->whereKey($patient->id)->lockForUpdate()->firstOrFail();
            $isFirstReferral = ! Order::query()
                ->where('patient_id', $patient->id)
                ->where('source', OrderSource::Doctor->value)
                ->exists();

            return $createOrder->handle([
                'patient_id' => $patient->id,
                'branch_id' => $branch->id,
                'test_ids' => $attributes['test_ids'],
                'notes' => $attributes['notes'] ?? null,
                'referring_doctor_id' => $doctor->id,
                'source' => OrderSource::Doctor,
                'priority' => OrderPriority::from($attributes['priority']),
                'urgent_reason' => $attributes['urgent_reason'] ?? null,
                'request_key' => $attributes['request_key'],
            ], $doctor, [
                'doctor' => $doctor,
                'branch' => $branch,
                'is_first_referral' => $isFirstReferral,
            ]);
        });
    }

    /**
     * @param  array{
     *     patient_id?: int|null,
     *     patient_full_name?: string|null,
     *     patient_phone: string,
     *     patient_email?: string|null,
     *     patient_date_of_birth?: string|null,
     *     patient_gender?: string|null
     * }  $attributes
     */
    private function resolvePatient(array $attributes): Patient
    {
        if (isset($attributes['patient_id'])) {
            $patient = Patient::query()->findOrFail($attributes['patient_id']);

            if ($patient->phone !== $attributes['patient_phone']) {
                throw ValidationException::withMessages([
                    'patient_phone' => 'رقم الهاتف لا يطابق المريض المحدد.',
                ]);
            }

            return $patient;
        }

        $matches = Patient::query()
            ->where('phone', $attributes['patient_phone'])
            ->limit(2)
            ->get();

        if ($matches->count() > 1) {
            throw ValidationException::withMessages([
                'patient_id' => 'توجد سجلات متعددة بهذا الرقم؛ اختر سجل المريض المطابق.',
            ]);
        }

        if ($matches->isNotEmpty()) {
            return $matches->first();
        }

        $fullName = $attributes['patient_full_name'] ?? null;

        if ($fullName === null) {
            throw ValidationException::withMessages([
                'patient_full_name' => 'اسم المريض مطلوب لإنشاء سجل جديد.',
            ]);
        }

        return Patient::query()->create([
            'full_name' => $fullName,
            'phone' => $attributes['patient_phone'],
            'email' => $attributes['patient_email'] ?? null,
            'date_of_birth' => $attributes['patient_date_of_birth'] ?? null,
            'gender' => $attributes['patient_gender'] ?? null,
        ]);
    }
}
