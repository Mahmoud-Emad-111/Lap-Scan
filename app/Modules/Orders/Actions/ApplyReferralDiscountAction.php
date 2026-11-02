<?php

namespace App\Modules\Orders\Actions;

use App\Models\ReferralDiscountRule;

class ApplyReferralDiscountAction
{
    public function __construct(private readonly CalculateDiscountAction $calculateDiscount) {}

    public function handle(ReferralDiscountRule $rule, int $subtotalInCents): int
    {
        return $this->calculateDiscount->handle(
            $rule->discount_type,
            (float) $rule->discount_value,
            $rule->minimum_subtotal === null ? null : (float) $rule->minimum_subtotal,
            $rule->maximum_discount === null ? null : (float) $rule->maximum_discount,
            $subtotalInCents,
        );
    }
}
