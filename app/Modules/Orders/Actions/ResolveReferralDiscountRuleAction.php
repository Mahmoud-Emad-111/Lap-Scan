<?php

namespace App\Modules\Orders\Actions;

use App\Enums\ReferralDiscountScope;
use App\Models\Branch;
use App\Models\ReferralDiscountRule;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ResolveReferralDiscountRuleAction
{
    public function handle(
        User $doctor,
        Branch $branch,
        bool $isFirstReferral,
        int $subtotalInCents,
    ): ReferralDiscountRule {
        $businessDate = today(config('app.business_timezone'));

        $rules = ReferralDiscountRule::query()
            ->where('is_active', true)
            ->where(function ($query) use ($businessDate): void {
                $query->whereNull('valid_from')
                    ->orWhereDate('valid_from', '<=', $businessDate);
            })
            ->where(function ($query) use ($businessDate): void {
                $query->whereNull('valid_until')
                    ->orWhereDate('valid_until', '>=', $businessDate);
            })
            ->where(function ($query) use ($doctor): void {
                $query->whereNull('doctor_id')->orWhere('doctor_id', $doctor->id);
            })
            ->where(function ($query) use ($branch): void {
                $query->whereNull('branch_id')->orWhere('branch_id', $branch->id);
            })
            ->where(function ($query) use ($isFirstReferral): void {
                $query->where('referral_scope', ReferralDiscountScope::AllReferrals->value);

                if ($isFirstReferral) {
                    $query->orWhere('referral_scope', ReferralDiscountScope::FirstReferral->value);
                }
            })
            ->lockForUpdate()
            ->get();
        $rules = $rules->filter(
            fn (ReferralDiscountRule $rule): bool => $rule->minimum_subtotal === null
                || $subtotalInCents >= (int) round((float) $rule->minimum_subtotal * 100),
        )->values();

        if ($rules->isEmpty()) {
            throw ValidationException::withMessages([
                'discount' => 'لا توجد قاعدة خصم سارية تنطبق على هذه الإحالة. أوقف خيار تطبيق الخصم أو راجع إعدادات الخصم لدى المعمل.',
            ]);
        }

        $highestSpecificity = $rules->max(
            fn (ReferralDiscountRule $rule): int => (int) ($rule->doctor_id !== null)
                + (int) ($rule->branch_id !== null),
        );

        /** @var Collection<int, ReferralDiscountRule> $mostSpecificRules */
        $mostSpecificRules = $rules->filter(
            fn (ReferralDiscountRule $rule): bool => (int) ($rule->doctor_id !== null)
                + (int) ($rule->branch_id !== null) === $highestSpecificity,
        )->values();

        if ($mostSpecificRules->count() !== 1) {
            throw ValidationException::withMessages([
                'discount' => 'توجد قواعد خصم متعارضة؛ يرجى مراجعتها قبل إنشاء الإحالة.',
            ]);
        }

        return $mostSpecificRules->first();
    }
}
