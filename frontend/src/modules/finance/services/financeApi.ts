import BranchController from '@/actions/App/Http/Controllers/Api/V1/BranchController';
import FinanceReportController from '@/actions/App/Http/Controllers/Api/V1/FinanceReportController';
import OrderController from '@/actions/App/Http/Controllers/Api/V1/OrderController';
import OrderPaymentController from '@/actions/App/Http/Controllers/Api/V1/OrderPaymentController';
import { apiRequest } from '@/lib/api-client';
import type {
    FinanceOrderPage,
    FinanceReport,
    OrderPayment,
    OrderPaymentPage,
    PaymentMethod,
} from '@/modules/finance/types';

type DataResponse<T> = { data: T };

export function fetchOutstandingOrders(
    token: string,
    search = '',
    url?: string,
): Promise<FinanceOrderPage> {
    return apiRequest<FinanceOrderPage>(
        url ??
            OrderController.index({
                query: {
                    payment_status: 'outstanding',
                    ...(search ? { search } : {}),
                },
            }),
        token,
    );
}

export function fetchOrderPayments(
    token: string,
    recordedBy?: number,
    url?: string,
): Promise<OrderPaymentPage> {
    return apiRequest<OrderPaymentPage>(
        url ??
            OrderPaymentController.index({
                query: recordedBy ? { recorded_by: recordedBy } : {},
            }),
        token,
    );
}

export async function recordOrderPayment(
    token: string,
    orderId: number,
    payload: { amount: string; method: PaymentMethod },
): Promise<OrderPayment> {
    const response = await apiRequest<DataResponse<OrderPayment>>(
        OrderPaymentController.store({ order: orderId }),
        token,
        payload,
    );

    return response.data;
}

export async function fetchFinanceReport(
    token: string,
    from: string,
    to: string,
): Promise<FinanceReport> {
    const response = await apiRequest<DataResponse<FinanceReport>>(
        FinanceReportController({ query: { from, to } }),
        token,
    );

    return response.data;
}

export async function fetchBranchOptions(
    token: string,
): Promise<Array<{ id: number; name: string }>> {
    const response = await apiRequest<{
        data: Array<{ id: number; name: string; is_active: boolean }>;
        links: { next: string | null };
    }>(BranchController.index(), token);

    return response.data.filter((branch) => branch.is_active);
}
