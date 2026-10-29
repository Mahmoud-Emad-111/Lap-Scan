export type WorkflowSection =
    | 'users'
    | 'orders'
    | 'samples'
    | 'results'
    | 'reports'
    | 'patient-orders'
    | 'patient-results';

import type { UserRole } from '@/types/common';

export type { UserRole } from '@/types/common';
export type { ApiPage } from '@/types/api';
export type Value = string | string[] | boolean;
export type BranchOption = { id: number; name: string };
export type TestOption = {
    id: number;
    name: string;
    code: string;
    price: string;
};
export type PatientOption = { id: number; full_name: string; phone: string };
export type SampleRecord = {
    id: number;
    barcode: string;
    specimen_type: string;
    status: 'pending_collection' | 'collected';
    collected_at: string | null;
};
export type ResultRecord = {
    id: number;
    value: string;
    unit: string | null;
    reference_range: string | null;
    notes: string | null;
    status: 'draft' | 'approved';
    approved_at: string | null;
    has_pdf: boolean;
    document_name: string | null;
    document_size: number | null;
};
export type OrderItem = {
    id: number;
    test_name: string;
    specimen_type: string;
    price: string;
    sample?: SampleRecord | null;
    result?: ResultRecord | null;
};
export type WorkflowRow = {
    id: number;
    name?: string;
    email?: string;
    role?: UserRole;
    branches?: BranchOption[];
    order_number?: string;
    patient?: { full_name: string };
    branch?: { name: string };
    status?: string;
    priority?: 'normal' | 'urgent';
    urgent_reason?: string | null;
    referring_doctor?: { id: number; name: string } | null;
    subtotal?: string;
    discount_amount?: string;
    discount?: { name: string } | null;
    total?: string;
    created_at?: string;
    items?: OrderItem[];
    barcode?: string;
    specimen_type?: string;
    collected_at?: string | null;
    patient_name?: string;
    test_name?: string;
    value?: string;
    unit?: string | null;
    reference_range?: string | null;
    approved_at?: string | null;
};
export type ReportData = {
    orders_total: number;
    orders_by_status: Record<string, number>;
    samples_total: number;
    samples_pending: number;
    results_total: number;
    results_pending_approval: number;
    results_approved: number;
    completed_orders: number;
};
export type Editor =
    | { kind: 'user'; id?: number; values: Record<string, Value> }
    | { kind: 'order'; values: Record<string, Value> }
    | {
          kind: 'result';
          orderItemId: number;
          resultId?: number;
          context: {
              orderNumber?: string;
              patientName?: string;
              branchName?: string;
              testName: string;
              specimenType: string;
              sampleBarcode?: string;
              priority?: 'normal' | 'urgent';
          };
          hasPdf: boolean;
          documentName: string | null;
          documentSize: number | null;
          pdf: File | null;
          removePdf: boolean;
          values: Record<string, Value>;
      };

export const titles: Record<WorkflowSection, string> = {
    users: 'المستخدمون والصلاحيات',
    orders: 'طلبات التحاليل',
    samples: 'استلام العينات',
    results: 'النتائج والمراجعة',
    reports: 'التقارير التشغيلية',
    'patient-orders': 'طلباتي',
    'patient-results': 'نتائجي',
};

export const roleLabels: Record<UserRole, string> = {
    patient: 'مريض',
    doctor: 'طبيب',
    lab_staff: 'موظف مختبر',
    lab_admin: 'مدير مختبر',
};

const statusLabels: Record<string, string> = {
    registered: 'مسجل',
    processing: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    pending_collection: 'بانتظار الاستلام',
    collected: 'تم الاستلام',
    draft: 'مسودة',
    approved: 'معتمد',
};

export function getValue(value: Value | undefined): string {
    return typeof value === 'string' ? value : '';
}

export function getValues(value: Value | undefined): string[] {
    return Array.isArray(value) ? value : [];
}

export function formatPrice(value: string): string {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 2,
    }).format(Number(value));
}

export function displayStatus(status: string | undefined): string {
    return status ? (statusLabels[status] ?? status) : '—';
}
