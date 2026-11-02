<?php

namespace App\Modules\Promotions\Actions;

use App\Enums\OrderStatus;
use App\Enums\PatientPromotionKind;
use App\Models\Patient;
use App\Models\PatientPromotion;
use App\Models\PatientReferral;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AcceptPatientReferralAction
{
    public function handle(Patient $invitedPatient, string $referralCode): PatientReferral
    {
        return DB::transaction(function () use ($invitedPatient, $referralCode): PatientReferral {
            $invitedPatient = Patient::query()
                ->whereKey($invitedPatient->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($invitedPatient->referralReceived()->exists()) {
                throw ValidationException::withMessages([
                    'referral_code' => 'تم تسجيل دعوة لهذا الحساب بالفعل.',
                ]);
            }

            $inviter = Patient::query()
                ->where('referral_code', strtoupper(trim($referralCode)))
                ->lockForUpdate()
                ->first();

            if ($inviter === null) {
                throw ValidationException::withMessages([
                    'referral_code' => 'كود الدعوة غير صحيح.',
                ]);
            }

            if ($invitedPatient->orders()->where('status', OrderStatus::Completed->value)->exists()) {
                throw ValidationException::withMessages([
                    'referral_code' => 'كود الدعوة متاح قبل اكتمال أول طلب بس.',
                ]);
            }

            if ($inviter->is($invitedPatient)) {
                throw ValidationException::withMessages([
                    'referral_code' => 'مينفعش تستخدم كود الدعوة بتاعك.',
                ]);
            }

            $businessDate = today(config('app.business_timezone'));
            $template = PatientPromotion::query()
                ->where('kind', PatientPromotionKind::ReferralTemplate->value)
                ->where('is_active', true)
                ->where(function ($query) use ($businessDate): void {
                    $query->whereNull('valid_from')->orWhereDate('valid_from', '<=', $businessDate);
                })
                ->where(function ($query) use ($businessDate): void {
                    $query->whereNull('valid_until')->orWhereDate('valid_until', '>=', $businessDate);
                })
                ->lockForUpdate()
                ->first();

            if ($template === null) {
                throw ValidationException::withMessages([
                    'referral_code' => 'دعوة الأصدقاء مش متاحة حاليًا.',
                ]);
            }

            return PatientReferral::query()->create([
                'inviter_patient_id' => $inviter->id,
                'invited_patient_id' => $invitedPatient->id,
                'reward_template_id' => $template->id,
                'referral_code' => strtoupper(trim($referralCode)),
                'accepted_at' => now(),
            ]);
        });
    }
}
