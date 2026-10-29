export type Patient = {
    id: number;
    full_name: string;
    phone: string;
    email: string | null;
    date_of_birth: string | null;
    gender: string | null;
};

export type PatientPayload = Pick<Patient, 'full_name' | 'phone'> &
    Partial<Pick<Patient, 'email' | 'date_of_birth' | 'gender'>>;

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

export type LabTestPayload = Omit<LabTest, 'id'>;

export type Branch = {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    is_default: boolean;
};

export type BranchPayload = Omit<Branch, 'id'>;

export type DashboardSummary = {
    orders_today: number;
    pending_samples: number | null;
    pending_results: number | null;
    patient_results: number | null;
    doctor_orders?: number | null;
    doctor_urgent_orders?: number | null;
    doctor_available_results?: number | null;
};
