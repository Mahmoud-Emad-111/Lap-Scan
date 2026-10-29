<?php

namespace App\Enums;

enum ReferralDiscountScope: string
{
    case FirstReferral = 'first_referral';
    case AllReferrals = 'all_referrals';
}
