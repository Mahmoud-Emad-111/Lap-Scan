import type { ApiPage } from '@/components/laboratory/workflow-types';

export type ReferralDiscountType = 'percentage' | 'fixed_amount';
export type ReferralDiscountScope = 'first_referral' | 'all_referrals';

export type ReferralDiscountRule = {
    id: number;
    name: string;
    discount_type: ReferralDiscountType;
    discount_value: string;
    minimum_subtotal: string | null;
    maximum_discount: string | null;
    valid_from: string | null;
    valid_until: string | null;
    doctor: { id: number; name: string } | null;
    branch: { id: number; name: string } | null;
    referral_scope: ReferralDiscountScope;
    is_active: boolean;
    created_by: number;
    updated_by: number | null;
};

export type ReferralDiscountRulePayload = {
    name: string;
    discount_type: ReferralDiscountType;
    discount_value: string;
    minimum_subtotal: string | null;
    maximum_discount: string | null;
    valid_from: string | null;
    valid_until: string | null;
    doctor_id: number | null;
    branch_id: number | null;
    referral_scope: ReferralDiscountScope;
    is_active: boolean;
};

export type ReferralDiscountDoctorOption = {
    id: number;
    name: string;
    verification_status: string;
};

export type ReferralDiscountBranchOption = {
    id: number;
    name: string;
    is_active: boolean;
};

export type ReferralDiscountRulePage = ApiPage<ReferralDiscountRule>;
