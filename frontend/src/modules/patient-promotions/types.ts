import type { LabTest } from '@/modules/laboratory/types';
import type { ApiPage } from '@/types/api';

export type PatientPromotionKind = 'offer' | 'coupon' | 'referral_template';
export type PatientPromotionDiscountType = 'percentage' | 'fixed_amount';

export type PatientPromotion = {
    id: number;
    kind: PatientPromotionKind;
    name: string;
    description: string | null;
    code: string | null;
    discount_type: PatientPromotionDiscountType;
    discount_value: string;
    minimum_subtotal: string | null;
    maximum_discount: string | null;
    valid_from: string | null;
    valid_until: string | null;
    validity_days: number | null;
    usage_limit: number | null;
    used_count: number | null;
    per_patient_limit: number | null;
    is_active: boolean;
    tests: Array<Pick<LabTest, 'id' | 'name' | 'code'>>;
};

export type PatientPromotionPayload = {
    kind: PatientPromotionKind;
    name: string;
    description: string | null;
    code?: string;
    discount_type: PatientPromotionDiscountType;
    discount_value: string;
    minimum_subtotal: string | null;
    maximum_discount: string | null;
    valid_from: string | null;
    valid_until: string | null;
    validity_days?: number;
    usage_limit?: number | null;
    per_patient_limit?: number | null;
    test_ids?: number[];
    is_active: boolean;
};

export type PatientPromotionPage = ApiPage<PatientPromotion>;
