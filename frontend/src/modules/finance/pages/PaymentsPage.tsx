import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api-client';
import { useNotifications } from '@/components/ui/notification-provider';
import {
    DataTable,
    PageShell,
    PrimaryButton,
    TableCell,
} from '@/components/laboratory/workflow-ui';
import { formatPrice } from '@/components/laboratory/workflow-types';
import {
    fetchFinanceReport,
    fetchOrderPayments,
    fetchOutstandingOrders,
    recordOrderPayment,
} from '@/modules/finance/services/financeApi';
import type {
    FinanceOrder,
    FinanceReport,
    OrderPaymentPage,
    PaymentMethod,
} from '@/modules/finance/types';

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

type PaymentsPageProps = {
    token: string;
    isAdministrator: boolean;
};

export function PaymentsPage({ token, isAdministrator }: PaymentsPageProps) {
    const { showSuccessNotice } = useNotifications();
    const [orders, setOrders] = useState<FinanceOrder[]>([]);
    const [ordersNextUrl, setOrdersNextUrl] = useState<string | null>(null);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const [payments, setPayments] = useState<OrderPaymentPage | null>(null);
    const [report, setReport] = useState<FinanceReport | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<FinanceOrder | null>(
        null,
    );
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [from, setFrom] = useState(monthStart());
    const [to, setTo] = useState(localDate());
    const [recordedBy, setRecordedBy] = useState<number | ''>('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string[]>
    >({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
    const [loadingMorePayments, setLoadingMorePayments] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const [orderPage, paymentPage, financeReport] = await Promise.all([
                fetchOutstandingOrders(token, appliedSearch),
                fetchOrderPayments(
                    token,
                    recordedBy === '' ? undefined : recordedBy,
                ),
                isAdministrator
                    ? fetchFinanceReport(token, from, to)
                    : Promise.resolve(null),
            ]);
            setOrders(orderPage.data);
            setOrdersNextUrl(orderPage.links.next);
            setOrdersTotal(orderPage.meta.total);
            setPayments(paymentPage);
            setReport(financeReport);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل بيانات التحصيل.',
            );
        } finally {
            setLoading(false);
        }
    }, [appliedSearch, from, isAdministrator, recordedBy, to, token]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    function selectOrder(order: FinanceOrder) {
        setSelectedOrder(order);
        setAmount(order.balance_due);
        setMethod('cash');
        setValidationErrors({});
        setError('');
    }

    async function submitPayment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedOrder) {
            return;
        }

        setBusy(true);
        setValidationErrors({});
        setError('');

        try {
            const payment = await recordOrderPayment(token, selectedOrder.id, {
                amount: amount.trim(),
                method,
            });
            setSelectedOrder(null);
            showSuccessNotice(
                `تم تسجيل تحصيل ${formatPrice(payment.amount)} للطلب ${payment.order.order_number}.`,
            );
            await loadData();
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setValidationErrors(requestError.validationErrors);
                const nonFieldError = Object.entries(
                    requestError.validationErrors,
                ).find(([field]) => field !== 'amount')?.[1][0];
                if (nonFieldError) {
                    setError(nonFieldError);
                } else if (
                    Object.keys(requestError.validationErrors).length === 0
                ) {
                    setError(requestError.message);
                }
            } else {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر تسجيل التحصيل.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    function searchOrders(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setAppliedSearch(search.trim());
    }

    async function loadMoreOrders() {
        if (!ordersNextUrl || loadingMoreOrders) {
            return;
        }

        setLoadingMoreOrders(true);
        setError('');

        try {
            const page = await fetchOutstandingOrders(
                token,
                appliedSearch,
                ordersNextUrl,
            );
            setOrders((current) => [...current, ...page.data]);
            setOrdersNextUrl(page.links.next);
            setOrdersTotal(page.meta.total);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل المزيد من الطلبات.',
            );
        } finally {
            setLoadingMoreOrders(false);
        }
    }

    async function loadMorePayments() {
        const nextUrl = payments?.links.next;

        if (!nextUrl || loadingMorePayments) {
            return;
        }

        setLoadingMorePayments(true);
        setError('');

        try {
            const page = await fetchOrderPayments(
                token,
                recordedBy === '' ? undefined : recordedBy,
                nextUrl,
            );
            setPayments((current) =>
                current
                    ? { ...page, data: [...current.data, ...page.data] }
                    : page,
            );
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل المزيد من التحصيلات.',
            );
        } finally {
            setLoadingMorePayments(false);
        }
    }

    const recentPayments = payments?.data ?? [];
    const orderError = validationErrors.amount?.[0];

    return (
        <PageShell
            title="المدفوعات والتحصيل"
            description="سجّل التحصيل النقدي أو بالمحفظة الإلكترونية، وتابع المبالغ المتبقية وسجل التحصيلات."
        >
            {error && (
                <ErrorMessage message={error} onDismiss={() => setError('')} />
            )}

            {isAdministrator && (
                <section
                    aria-label="ملخص التحصيل المالي"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
                        من
                        <input
                            type="date"
                            value={from}
                            max={to}
                            onChange={(event) => setFrom(event.target.value)}
                            className={inputClass}
                        />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold text-slate-600">
                        إلى
                        <input
                            type="date"
                            value={to}
                            min={from}
                            max={localDate()}
                            onChange={(event) => setTo(event.target.value)}
                            className={inputClass}
                        />
                    </label>
                    <MetricCard
                        label="إجمالي التحصيل بالفترة"
                        value={report?.summary.total_collected}
                        loading={loading}
                    />
                    <MetricCard
                        label="المبالغ المتبقية لطلبات الفترة"
                        value={report?.summary.outstanding_balance}
                        loading={loading}
                    />
                    <MetricCard
                        label="قيمة الطلبات بالفترة"
                        value={report?.summary.billed_total}
                        loading={loading}
                    />
                    <MetricCard
                        label="عدد عمليات التحصيل"
                        value={
                            report
                                ? String(report.summary.payment_count)
                                : undefined
                        }
                        loading={loading}
                        isCurrency={false}
                    />
                </section>
            )}

            {isAdministrator && report && (
                <section className="grid gap-4 xl:grid-cols-2">
                    <ReportBreakdown
                        title="التحصيل حسب طريقة الدفع"
                        emptyMessage="لا توجد تحصيلات خلال الفترة المحددة."
                        rows={report.by_method.map((item) => ({
                            id: item.method,
                            label: paymentMethodLabel(item.method),
                            amount: item.total,
                            count: item.count,
                        }))}
                    />
                    <ReportBreakdown
                        title="التحصيل حسب الفرع"
                        emptyMessage="لا توجد تحصيلات خلال الفترة المحددة."
                        rows={report.by_branch.map((item) => ({
                            id: String(item.branch.id),
                            label: item.branch.name,
                            amount: item.total,
                            count: item.count,
                        }))}
                    />
                </section>
            )}

            {selectedOrder && (
                <section
                    aria-labelledby="payment-form-title"
                    className="border-brand-200 grid gap-4 rounded-2xl border bg-brand-50/50 p-5 sm:p-6"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3
                                id="payment-form-title"
                                className="font-bold text-slate-900"
                            >
                                تسجيل تحصيل للطلب{' '}
                                <bdi dir="ltr">
                                    {selectedOrder.order_number}
                                </bdi>
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {selectedOrder.patient.full_name} · المتبقي{' '}
                                {formatPrice(selectedOrder.balance_due)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
                        >
                            إلغاء
                        </button>
                    </div>
                    <form
                        onSubmit={submitPayment}
                        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
                        <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                            مبلغ التحصيل (جنيه)
                            <input
                                required
                                min="0.01"
                                max={selectedOrder.balance_due}
                                step="0.01"
                                type="number"
                                inputMode="decimal"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                                aria-invalid={Boolean(orderError)}
                                aria-describedby={
                                    orderError
                                        ? 'payment-amount-error'
                                        : undefined
                                }
                                className={inputClass}
                            />
                            {orderError && (
                                <span
                                    id="payment-amount-error"
                                    role="alert"
                                    className="text-xs font-medium text-rose-700"
                                >
                                    {orderError}
                                </span>
                            )}
                        </label>
                        <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                            طريقة الدفع
                            <select
                                value={method}
                                onChange={(event) =>
                                    setMethod(
                                        event.target.value as PaymentMethod,
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="cash">نقدي</option>
                                <option value="wallet">محفظة إلكترونية</option>
                            </select>
                        </label>
                        <div className="flex items-end">
                            <PrimaryButton type="submit" loading={busy}>
                                تأكيد التحصيل
                            </PrimaryButton>
                        </div>
                    </form>
                </section>
            )}

            <section className="grid gap-4">
                <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            طلبات عليها مبالغ متبقية
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            يشمل الطلبات غير المدفوعة والمدفوعة جزئيًا، ويستبعد
                            الطلبات الملغاة.
                        </p>
                    </div>
                    <form
                        onSubmit={searchOrders}
                        className="flex w-full gap-2 sm:max-w-md"
                    >
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="ابحث برقم الطلب أو اسم المريض"
                            className={inputClass}
                            aria-label="البحث في الطلبات غير المسددة"
                        />
                        <PrimaryButton type="submit">بحث</PrimaryButton>
                    </form>
                </header>
                <DataTable
                    headings={[
                        'رقم الطلب',
                        'المريض',
                        'الفرع',
                        'قيمة الطلب',
                        'المحصّل',
                        'المتبقي',
                        'إجراء',
                    ]}
                >
                    {loading ? (
                        <EmptyTableRow
                            colSpan={7}
                            message="جارٍ تحميل الطلبات..."
                        />
                    ) : orders.length === 0 ? (
                        <EmptyTableRow
                            colSpan={7}
                            message="لا توجد طلبات بمبالغ مستحقة تطابق البحث."
                        />
                    ) : (
                        orders.map((order) => (
                            <tr key={order.id}>
                                <TableCell>
                                    <bdi
                                        dir="ltr"
                                        className="font-semibold text-slate-800"
                                    >
                                        {order.order_number}
                                    </bdi>
                                </TableCell>
                                <TableCell>{order.patient.full_name}</TableCell>
                                <TableCell>{order.branch.name}</TableCell>
                                <TableCell className="font-semibold tabular-nums">
                                    <span className="inline-flex rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-900">
                                        {formatPrice(order.total)}
                                    </span>
                                </TableCell>
                                <TableCell className="font-semibold tabular-nums">
                                    <span className="inline-flex rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-900">
                                        {formatPrice(order.paid_amount)}
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold tabular-nums">
                                    <span className="inline-flex rounded-lg border border-dashed border-rose-300 bg-rose-50 px-3 py-1.5 text-rose-800">
                                        {formatPrice(order.balance_due)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <button
                                        type="button"
                                        onClick={() => selectOrder(order)}
                                        className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                                    >
                                        تسجيل تحصيل
                                    </button>
                                </TableCell>
                            </tr>
                        ))
                    )}
                </DataTable>
                {ordersNextUrl && !loading && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                            عرض {orders.length} من {ordersTotal} طلب
                        </span>
                        <PrimaryButton
                            type="button"
                            loading={loadingMoreOrders}
                            onClick={() => void loadMoreOrders()}
                        >
                            تحميل المزيد
                        </PrimaryButton>
                    </div>
                )}
            </section>

            <section className="grid gap-4">
                <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            أحدث التحصيلات
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {payments?.meta.total ?? 0} عملية مسجلة
                        </p>
                    </div>
                    <label className="grid gap-1.5 text-xs font-semibold text-slate-700 sm:min-w-56">
                        تصفية حسب الموظف
                        <select
                            value={recordedBy}
                            disabled={loading || loadingMorePayments}
                            onChange={(event) =>
                                setRecordedBy(
                                    event.target.value
                                        ? Number(event.target.value)
                                        : '',
                                )
                            }
                            className={inputClass}
                        >
                            <option value="">كل الموظفين</option>
                            {(payments?.recorders ?? []).map((recorder) => (
                                <option key={recorder.id} value={recorder.id}>
                                    {recorder.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="button"
                        onClick={() => void loadData()}
                        disabled={loading}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                    >
                        تحديث
                    </button>
                </header>
                <DataTable
                    headings={[
                        'الطلب',
                        'المريض',
                        'الفرع',
                        'طريقة الدفع',
                        'سجّلها',
                        'التاريخ',
                        'المبلغ',
                    ]}
                >
                    {loading ? (
                        <EmptyTableRow
                            colSpan={7}
                            message="جارٍ تحميل التحصيلات..."
                        />
                    ) : recentPayments.length === 0 ? (
                        <EmptyTableRow
                            colSpan={7}
                            message="لا توجد تحصيلات مسجلة حتى الآن."
                        />
                    ) : (
                        recentPayments.map((payment) => (
                            <tr key={payment.id}>
                                <TableCell>
                                    <bdi
                                        dir="ltr"
                                        className="font-semibold text-slate-800"
                                    >
                                        {payment.order.order_number}
                                    </bdi>
                                </TableCell>
                                <TableCell>
                                    {payment.order.patient ?? '—'}
                                </TableCell>
                                <TableCell>{payment.branch.name}</TableCell>
                                <TableCell>
                                    {paymentMethodLabel(payment.method)}
                                </TableCell>
                                <TableCell>
                                    {payment.recorded_by.name}
                                </TableCell>
                                <TableCell>
                                    {formatDateTime(payment.created_at)}
                                </TableCell>
                                <TableCell className="font-bold tabular-nums">
                                    <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
                                        {formatPrice(payment.amount)}
                                    </span>
                                </TableCell>
                            </tr>
                        ))
                    )}
                </DataTable>
                {payments?.links.next && !loading && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                            عرض {recentPayments.length} من {payments.meta.total}{' '}
                            عملية
                        </span>
                        <PrimaryButton
                            type="button"
                            loading={loadingMorePayments}
                            onClick={() => void loadMorePayments()}
                        >
                            تحميل المزيد
                        </PrimaryButton>
                    </div>
                )}
            </section>
        </PageShell>
    );
}

function MetricCard({
    label,
    value,
    loading,
    isCurrency = true,
}: {
    label: string;
    value?: string;
    loading: boolean;
    isCurrency?: boolean;
}) {
    return (
        <article className="grid min-h-24 content-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)]">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-900">
                {loading
                    ? '…'
                    : value === undefined
                      ? '—'
                      : isCurrency
                        ? formatPrice(value)
                        : value}
            </p>
        </article>
    );
}

function ReportBreakdown({
    title,
    emptyMessage,
    rows,
}: {
    title: string;
    emptyMessage: string;
    rows: Array<{ id: string; label: string; amount: string; count: number }>;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)]">
            <h3 className="font-bold text-slate-900">{title}</h3>
            {rows.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>
            ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                    {rows.map((row) => (
                        <li
                            key={row.id}
                            className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                        >
                            <span className="text-slate-700">
                                {row.label}{' '}
                                <span className="text-xs text-slate-400">
                                    ({row.count} عملية)
                                </span>
                            </span>
                            <strong className="text-slate-900">
                                {formatPrice(row.amount)}
                            </strong>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function ErrorMessage({
    message,
    onDismiss,
}: {
    message: string;
    onDismiss: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
            <span>{message}</span>
            <button type="button" onClick={onDismiss} className="font-semibold">
                إغلاق
            </button>
        </div>
    );
}

function EmptyTableRow({
    colSpan,
    message,
}: {
    colSpan: number;
    message: string;
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-5 py-10 text-center text-sm text-slate-500"
            >
                {message}
            </td>
        </tr>
    );
}

function paymentMethodLabel(method: PaymentMethod): string {
    return method === 'wallet' ? 'محفظة إلكترونية' : 'نقدي';
}

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function localDate(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function monthStart(): string {
    const date = new Date();
    date.setDate(1);

    return localDate(date);
}
