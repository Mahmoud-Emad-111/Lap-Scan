<?php

namespace App\Modules\Orders\Actions;

use App\Enums\ReferralDiscountType;
use Illuminate\Validation\ValidationException;

class CalculateDiscountAction
{
    public function handle(
        ReferralDiscountType $discountType,
        float $discountValue,
        ?float $minimumSubtotal,
        ?float $maximumDiscount,
        int $subtotalInCents,
    ): int {
        $minimumInCents = (int) round(($minimumSubtotal ?? 0) * 100);

        if ($subtotalInCents < $minimumInCents) {
            throw ValidationException::withMessages([
                'discount' => 'لا ينطبق الخصم المحدد لأن قيمة الطلب أقل من الحد الأدنى.',
            ]);
        }

        $discountInCents = $discountType === ReferralDiscountType::Percentage
            ? $this->percentageInCents($subtotalInCents, $discountValue)
            : (int) round($discountValue * 100);

        if ($maximumDiscount !== null) {
            $discountInCents = min($discountInCents, (int) round($maximumDiscount * 100));
        }

        return min($discountInCents, $subtotalInCents);
    }

    private function percentageInCents(int $subtotalInCents, float $percentage): int
    {
        $percentageInBasisPoints = (int) round($percentage * 100);

        return intdiv(($subtotalInCents * $percentageInBasisPoints) + 5000, 10000);
    }
}
