export type ApiPage<T> = {
    data: T[];
    links: {
        next: string | null;
        prev: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
};

export type ApiList<T> = {
    data: T[];
};

export type ApiData<T> = {
    data: T;
};

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'lab_staff' | 'lab_admin';
};

export type PatientProfile = {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
    date_of_birth: string | null;
    gender: string | null;
};

export type LabTest = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    specimen_type: string;
    price: string;
    turnaround_time_minutes: number;
    is_active: boolean;
};

export type Branch = {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    is_default: boolean;
};

export type PatientAddress = {
    id: number;
    label: string;
    address: string;
    instructions: string | null;
    is_default: boolean;
};

export type PatientPromotionKind = 'offer' | 'coupon' | 'referral_coupon';

export type PatientPromotion = {
    id: number;
    kind: PatientPromotionKind;
    name: string;
    description: string | null;
    code: string | null;
    discount_type: 'percentage' | 'fixed_amount';
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

export type PatientReferralSummary = {
    referral_code: string;
    accepted_count: number;
    rewarded_count: number;
    has_been_referred: boolean;
    enabled: boolean;
};

export type OrderSample = {
    id: number;
    barcode: string;
    specimen_type: string;
    status: 'pending_collection' | 'collected';
    collected_at: string | null;
};

export type OrderItem = {
    id: number;
    test_id: number | null;
    test_code: string;
    test_name: string;
    specimen_type: string;
    price: string;
    sample: OrderSample | null;
};

export type PatientOrder = {
    id: number;
    order_number: string;
    source: 'laboratory' | 'doctor' | 'home_collection';
    status: 'registered' | 'processing' | 'completed' | 'cancelled';
    notes: string | null;
    subtotal: string;
    discount_amount: string;
    total: string;
    collection_address: string | null;
    collection_requested_at: string | null;
    expected_result_at: string | null;
    items: OrderItem[];
    created_at: string;
};

export type PatientResult = {
    id: number;
    order_number: string;
    test_name: string;
    value: string;
    unit: string | null;
    reference_range: string | null;
    approved_at: string | null;
    has_pdf: boolean;
};

export type LoginResponse = {
    data: {
        token: string;
        user: AuthUser;
    };
};

export type CurrentUserResponse = ApiData<AuthUser>;

export type PatientPortalSettings = {
    home_collection_enabled: boolean;
};
