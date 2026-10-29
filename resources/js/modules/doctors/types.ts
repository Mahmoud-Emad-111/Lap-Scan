import type {
    ApiPage,
    BranchOption,
    TestOption,
} from '@/components/laboratory/workflow-types';

export type DoctorVerificationStatus =
    | 'pending'
    | 'verified'
    | 'rejected'
    | 'suspended';

export type DoctorProfile = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    specialty: string | null;
    license_number: string | null;
    verification_status: DoctorVerificationStatus;
    verification_note: string | null;
    reviewed_at?: string | null;
    verified_at?: string | null;
};

export type DoctorOrderItem = {
    id: number;
    test_name: string;
    price: string;
    sample_status: string | null;
    collected_at: string | null;
    result_available: boolean;
    result_id: number | null;
};

export type DoctorOrder = {
    id: number;
    order_number: string;
    status: string;
    priority: 'normal' | 'urgent';
    urgent_reason: string | null;
    notes: string | null;
    branch: { id: number; name: string };
    patient: { full_name: string };
    items: DoctorOrderItem[];
    results_available: boolean;
    expected_result_at: string | null;
    subtotal: string;
    discount_amount: string;
    discount: {
        rule_id: number;
        name: string;
        discount_type: ReferralDiscountType;
        discount_value: string;
        minimum_subtotal: string | null;
        maximum_discount: string | null;
        referral_scope: ReferralDiscountScope;
        discount_amount: string;
        applied_at: string;
    } | null;
    total: string;
    created_at: string;
};

export type ReferralDiscountType = 'percentage' | 'fixed_amount';
export type ReferralDiscountScope = 'first_referral' | 'all_referrals';

export type DoctorResult = {
    id: number;
    order_number: string;
    patient_name: string;
    test_name: string;
    value: string;
    unit: string | null;
    reference_range: string | null;
    notes: string | null;
    status: string;
    approved_at: string | null;
};

export type DoctorPatientMatch = {
    id: number;
    full_name: string;
    phone: string;
};

export type DoctorReferralPayload = {
    request_key: string;
    patient_id?: number;
    patient_full_name: string;
    patient_phone: string;
    patient_email: string | null;
    patient_date_of_birth: string | null;
    patient_gender: string | null;
    branch_id: number;
    test_ids: number[];
    priority: 'normal' | 'urgent';
    urgent_reason: string | null;
    notes: string | null;
};

export type DoctorPage = ApiPage<DoctorOrder>;
export type DoctorBranchOption = BranchOption;
export type DoctorTestOption = TestOption;
