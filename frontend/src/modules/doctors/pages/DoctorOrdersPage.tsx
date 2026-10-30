import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import {
    DataTable,
    PageShell,
    PrimaryButton,
    StatusBadge,
    TableCell,
} from '@/components/laboratory/workflow-ui';
import { formatPrice } from '@/components/laboratory/workflow-types';
import {
    downloadDoctorResult,
    fetchDoctorBranches,
    fetchDoctorOrder,
    fetchDoctorOrders,
    fetchDoctorProfile,
    fetchDoctorResult,
} from '@/modules/doctors/services/doctorApi';
import type {
    DoctorOrder,
    DoctorPage,
    DoctorResult,
} from '@/modules/doctors/types';
import type { BranchOption } from '@/components/laboratory/workflow-types';

type OrderFilters = {
    search: string;
    status: string;
    priority: string;
    branchId: string;
    from: string;
    to: string;
    resultsAvailable: string;
};

const EMPTY_FILTERS: OrderFilters = {
    search: '',
    status: '',
    priority: '',
    branchId: '',
    from: '',
    to: '',
    resultsAvailable: '',
};

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

export function DoctorOrdersPage({ token }: { token: string }) {
    const [orders, setOrders] = useState<DoctorPage | null>(null);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS);
    const [selectedOrder, setSelectedOrder] = useState<DoctorOrder | null>(
        null,
    );
    const [selectedResult, setSelectedResult] = useState<DoctorResult | null>(
        null,
    );
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadPage() {
            setLoading(true);
            setError('');

            try {
                const [doctorProfile, orderPage] = await Promise.all([
                    fetchDoctorProfile(token),
                    fetchDoctorOrders(token),
                ]);
                if (cancelled) return;
                setOrders(orderPage);

                if (doctorProfile.verification_status === 'verified') {
                    setBranches(await fetchDoctorBranches(token));
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'تعذّر تحميل الإحالات.',
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadPage();

        return () => {
            cancelled = true;
        };
    }, [token]);

    async function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setError('');

        const query = {
            ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.priority ? { priority: filters.priority } : {}),
            ...(filters.branchId ? { branch_id: filters.branchId } : {}),
            ...(filters.from ? { from: filters.from } : {}),
            ...(filters.to ? { to: filters.to } : {}),
            ...(filters.resultsAvailable
                ? { results_available: filters.resultsAvailable }
                : {}),
        };

        try {
            setOrders(await fetchDoctorOrders(token, query));
            setSelectedOrder(null);
            setSelectedResult(null);
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setErrors(requestError.validationErrors);
                if (Object.keys(requestError.validationErrors).length === 0) {
                    setError(requestError.message);
                }
            } else {
                setError('تعذّر تطبيق عوامل التصفية.');
            }
        } finally {
            setBusy(false);
        }
    }

    async function openOrder(orderId: number) {
        setBusy(true);
        setError('');
        setSelectedResult(null);

        try {
            setSelectedOrder(await fetchDoctorOrder(token, orderId));
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر فتح تفاصيل الإحالة.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function openResult(resultId: number) {
        setBusy(true);
        setError('');

        try {
            setSelectedResult(await fetchDoctorResult(token, resultId));
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'النتيجة غير متاحة حالياً.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function downloadResult(resultId: number) {
        setBusy(true);
        setError('');

        try {
            await downloadDoctorResult(token, resultId);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تنزيل التقرير.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function loadPage(url: string | null) {
        if (!url) return;
        setBusy(true);
        setError('');
        try {
            setOrders(await fetchDoctorOrders(token, url));
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل صفحة الإحالات.',
            );
        } finally {
            setBusy(false);
        }
    }

    const rows = orders?.data ?? [];

    return (
        <PageShell
            title="إحالاتي الطبية"
            description="تابع الإحالات المسجلة باسمك فقط، ولا تظهر النتائج إلا بعد اعتمادها."
        >
            {error && <ErrorBanner message={error} />}
            {loading ? (
                <LoadingState />
            ) : (
                <div className="grid gap-5">
                    <form
                        onSubmit={applyFilters}
                        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:grid-cols-2 xl:grid-cols-4"
                    >
                        <input
                            value={filters.search}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    search: event.target.value,
                                }))
                            }
                            placeholder="رقم الطلب أو اسم/هاتف المريض"
                            className={inputClass}
                        />
                        <select
                            value={filters.status}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    status: event.target.value,
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="">كل الحالات</option>
                            <option value="registered">مسجل</option>
                            <option value="processing">قيد التنفيذ</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                        </select>
                        <select
                            value={filters.priority}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    priority: event.target.value,
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="">كل الأولويات</option>
                            <option value="urgent">عاجل</option>
                            <option value="normal">عادي</option>
                        </select>
                        <select
                            value={filters.branchId}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    branchId: event.target.value,
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="">كل الفروع</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        <label className="grid gap-1 text-xs text-slate-500">
                            من تاريخ
                            <input
                                type="date"
                                value={filters.from}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        from: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            />
                        </label>
                        <label className="grid gap-1 text-xs text-slate-500">
                            إلى تاريخ
                            <input
                                type="date"
                                value={filters.to}
                                onChange={(event) =>
                                    setFilters((current) => ({
                                        ...current,
                                        to: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            />
                            {errors.to?.[0] && (
                                <span className="text-rose-600">
                                    {errors.to[0]}
                                </span>
                            )}
                        </label>
                        <select
                            value={filters.resultsAvailable}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    resultsAvailable: event.target.value,
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="">كل النتائج</option>
                            <option value="true">نتائج معتمدة متاحة</option>
                            <option value="false">لا توجد نتيجة معتمدة</option>
                        </select>
                        <div className="flex items-end">
                            <PrimaryButton type="submit" disabled={busy}>
                                تطبيق التصفية
                            </PrimaryButton>
                        </div>
                    </form>

                    {rows.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
                            لا توجد إحالات مطابقة.
                        </div>
                    ) : (
                        <DataTable
                            headings={[
                                'رقم الطلب',
                                'المريض',
                                'الفرع',
                                'الأولوية',
                                'الحالة',
                                'الإجمالي',
                                'النتيجة',
                                '',
                            ]}
                        >
                            {rows.map((order) => (
                                <tr key={order.id}>
                                    <TableCell>{order.order_number}</TableCell>
                                    <TableCell>
                                        {order.patient.full_name}
                                    </TableCell>
                                    <TableCell>{order.branch.name}</TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                order.priority === 'urgent'
                                                    ? 'font-bold text-rose-700'
                                                    : 'text-slate-600'
                                            }
                                        >
                                            {order.priority === 'urgent'
                                                ? 'عاجل'
                                                : 'عادي'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="block font-semibold text-slate-800">
                                            {formatPrice(order.total)}
                                        </span>
                                        {Number(order.discount_amount) > 0 && (
                                            <span className="block text-xs text-emerald-700">
                                                خصم:{' '}
                                                {formatPrice(
                                                    order.discount_amount,
                                                )}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.results_available
                                            ? 'متاحة'
                                            : 'قيد الإجراء'}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() =>
                                                void openOrder(order.id)
                                            }
                                            className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                                        >
                                            التفاصيل
                                        </button>
                                    </TableCell>
                                </tr>
                            ))}
                        </DataTable>
                    )}

                    {orders && orders.meta.last_page > 1 && (
                        <nav className="flex justify-between rounded-2xl border border-slate-200 bg-white p-3">
                            <button
                                type="button"
                                disabled={!orders.links.prev || busy}
                                onClick={() => void loadPage(orders.links.prev)}
                                className="rounded-lg px-3 py-2 text-sm disabled:opacity-40"
                            >
                                السابق
                            </button>
                            <span className="self-center text-xs text-slate-500">
                                صفحة {orders.meta.current_page} من{' '}
                                {orders.meta.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={!orders.links.next || busy}
                                onClick={() => void loadPage(orders.links.next)}
                                className="rounded-lg px-3 py-2 text-sm disabled:opacity-40"
                            >
                                التالي
                            </button>
                        </nav>
                    )}

                    {selectedOrder && (
                        <OrderDetails
                            order={selectedOrder}
                            busy={busy}
                            onResult={openResult}
                            onDownload={downloadResult}
                        />
                    )}
                    {selectedResult && (
                        <ResultDetails result={selectedResult} />
                    )}
                </div>
            )}
        </PageShell>
    );
}

function OrderDetails({
    order,
    busy,
    onResult,
    onDownload,
}: {
    order: DoctorOrder;
    busy: boolean;
    onResult: (resultId: number) => void;
    onDownload: (resultId: number) => void;
}) {
    return (
        <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="font-bold text-slate-900">
                        تفاصيل الطلب {order.order_number}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        المريض: {order.patient.full_name} · الفرع:{' '}
                        {order.branch.name}
                    </p>
                </div>
                {order.priority === 'urgent' && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                        عاجل
                    </span>
                )}
            </div>
            {order.urgent_reason && (
                <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                    سبب الاستعجال: {order.urgent_reason}
                </p>
            )}
            <div className="grid gap-3">
                {order.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                    >
                        <div>
                            <strong className="text-sm text-slate-800">
                                {item.test_name}
                            </strong>
                            <p className="mt-1 text-xs text-slate-500">
                                العينة: {item.sample_status ?? '—'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {item.result_available && item.result_id && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onResult(item.result_id!)
                                        }
                                        className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                                    >
                                        عرض النتيجة
                                    </button>
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() =>
                                            onDownload(item.result_id!)
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                    >
                                        تنزيل PDF
                                    </button>
                                </>
                            )}
                            {!item.result_available && (
                                <span className="text-xs text-slate-500">
                                    النتيجة بانتظار الاعتماد
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500">
                الوقت المتوقع:{' '}
                {order.expected_result_at
                    ? new Date(order.expected_result_at).toLocaleString('ar-EG')
                    : 'بانتظار تأكيد المختبر'}
            </p>
        </article>
    );
}

function ResultDetails({ result }: { result: DoctorResult }) {
    return (
        <article className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-bold">{result.test_name}</h3>
                <span className="text-xs">
                    معتمدة في{' '}
                    {result.approved_at
                        ? new Date(result.approved_at).toLocaleString('ar-EG')
                        : '—'}
                </span>
            </div>
            <p className="text-lg font-bold">
                {result.value} {result.unit ?? ''}
            </p>
            <p className="text-sm">
                المدى المرجعي: {result.reference_range ?? 'غير محدد'}
            </p>
            {result.notes && <p className="text-sm">{result.notes}</p>}
        </article>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
            {message}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            {[1, 2, 3].map((line) => (
                <div
                    key={line}
                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
            ))}
        </div>
    );
}
