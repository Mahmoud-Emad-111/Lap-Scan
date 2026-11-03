import type { ApiPage } from '@/types/api';

export type PaymentMethod = 'cash' | 'wallet';

export type FinanceOrder = {
    id: number;
    order_number: string;
    branch: { id: number; name: string };
    patient: { id: number; full_name: string; phone: string };
    status: string;
    total: string;
    paid_amount: string;
    balance_due: string;
    payment_status: 'unpaid' | 'partial' | 'paid';
    created_at: string;
};

export type OrderPayment = {
    id: number;
    amount: string;
    method: PaymentMethod;
    order: {
        id: number;
        order_number: string;
        patient: string | null;
    };
    branch: { id: number; name: string };
    recorded_by: { id: number; name: string };
    created_at: string;
};

export type PaymentRecorder = { id: number; name: string };

export type FinanceReport = {
    period: { from: string; to: string };
    summary: {
        total_collected: string;
        payment_count: number;
        billed_total: string;
        outstanding_balance: string;
    };
    by_method: Array<{
        method: PaymentMethod;
        total: string;
        count: number;
    }>;
    by_branch: Array<{
        branch: { id: number; name: string };
        total: string;
        count: number;
    }>;
};

export type FinanceOrderPage = ApiPage<FinanceOrder>;
export type OrderPaymentPage = ApiPage<OrderPayment> & {
    recorders: PaymentRecorder[];
};
