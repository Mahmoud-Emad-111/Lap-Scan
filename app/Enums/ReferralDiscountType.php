<?php

namespace App\Enums;

enum ReferralDiscountType: string
{
    case Percentage = 'percentage';
    case FixedAmount = 'fixed_amount';
}
