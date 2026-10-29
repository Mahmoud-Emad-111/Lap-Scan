<?php

namespace App\Modules\Orders\Actions;

use App\Enums\ReferralDiscountType;
use App\Models\ReferralDiscountRule;
use Illuminate\Validation\ValidationException;

class ApplyReferralDiscountAction
{
    public function handle(ReferralDiscountRule $rule, int $subtotalInCents): int
    {
        $minimumInCents = (int) round((float) ($rule->minimum_subtotal ?? 0) * 100);

        if ($subtotalInCents < $minimumInCents) {
            throw ValidationException::withMessages([
                'discount' => 'لا ينطبق الخصم المحدد لأن قيمة الطلب أقل من الحد الأدنى.',
            ]);
        }

        $discountInCents = $rule->discount_type === ReferralDiscountType::Percentage
            ? $this->percentageInCents($subtotalInCents, (float) $rule->discount_value)
            : (int) round((float) $rule->discount_value * 100);

        if ($rule->maximum_discount !== null) {
            $maximumInCents = (int) round((float) $rule->maximum_discount * 100);
            $discountInCents = min($discountInCents, $maximumInCents);
        }

        return min($discountInCents, $subtotalInCents);
    }

    private function percentageInCents(int $subtotalInCents, float $percentage): int
    {
        $percentageInBasisPoints = (int) round($percentage * 100);

        return intdiv(($subtotalInCents * $percentageInBasisPoints) + 5000, 10000);
    }
}
