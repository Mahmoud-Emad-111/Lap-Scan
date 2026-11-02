<?php

namespace App\Modules\Promotions\Actions;

use App\Enums\OrderStatus;
use App\Enums\PatientPromotionKind;
use App\Models\Order;
use App\Models\Patient;
use App\Models\PatientPromotion;
use App\Models\PatientReferral;
use App\Models\User;
use Illuminate\Support\Str;

class IssuePatientReferralRewardsAction
{
    public function handle(Patient $invitedPatient, Order $completedOrder, User $creator): void
    {
        if ($completedOrder->patient_id !== $invitedPatient->id) {
            return;
        }

        $referral = PatientReferral::query()
            ->where('invited_patient_id', $invitedPatient->id)
            ->whereNull('rewarded_at')
            ->lockForUpdate()
            ->first();

        if ($referral === null) {
            return;
        }

        if (
            $completedOrder->created_at === null
            || $completedOrder->created_at->lt($referral->accepted_at)
            || Order::query()
                ->where('patient_id', $invitedPatient->id)
                ->where('status', OrderStatus::Completed->value)
                ->where('created_at', '>=', $referral->accepted_at)
                ->where('id', '!=', $completedOrder->id)
                ->exists()
        ) {
            return;
        }

        $template = $referral->rewardTemplate()->firstOrFail();
        $validFrom = today(config('app.business_timezone'));
        $validUntil = $validFrom->copy()->addDays(max(0, ($template->validity_days ?? 1) - 1));

        foreach ([$referral->invited_patient_id, $referral->inviter_patient_id] as $patientId) {
            do {
                $code = 'FRIEND-'.Str::upper(Str::random(10));
            } while (PatientPromotion::query()->where('code', $code)->exists());

            PatientPromotion::query()->create([
                'kind' => PatientPromotionKind::ReferralCoupon,
                'name' => 'مكافأة دعوة صديق',
                'description' => 'مكافأة على إكمال أول طلب بعد الدعوة.',
                'code' => $code,
                'patient_id' => $patientId,
                'template_id' => $template->id,
                'discount_type' => $template->discount_type,
                'discount_value' => $template->discount_value,
                'minimum_subtotal' => $template->minimum_subtotal,
                'maximum_discount' => $template->maximum_discount,
                'valid_from' => $validFrom,
                'valid_until' => $validUntil,
                'usage_limit' => 1,
                'per_patient_limit' => 1,
                'is_active' => true,
                'created_by' => $creator->id,
            ]);
        }

        $referral->update(['rewarded_at' => now()]);
    }
}
