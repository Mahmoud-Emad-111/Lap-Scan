<?php

namespace App\Enums;

enum PatientPromotionKind: string
{
    case Offer = 'offer';
    case Coupon = 'coupon';
    case ReferralTemplate = 'referral_template';
    case ReferralCoupon = 'referral_coupon';
}
