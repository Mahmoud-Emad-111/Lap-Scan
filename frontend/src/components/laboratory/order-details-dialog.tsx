import { useEffect } from 'react';
import {
    formatPrice,
    type WorkflowRow,
} from '@/components/laboratory/workflow-types';
import { StatusBadge } from '@/components/laboratory/workflow-ui';

export function OrderDetailsDialog({
    order,
    onClose,
}: {
    order: WorkflowRow;
    onClose: () => void;
}) {
    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => {
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <button
                type="button"
                aria-label="إغلاق تفاصيل الطلب"
                className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
                onClick={onClose}
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
                className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7"
            >
                <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="grid gap-2">
                        <p className="text-xs font-semibold text-slate-500">
                            تفاصيل طلب المختبر
                        </p>
                        <h2
                            id="order-details-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            {order.order_number}
                        </h2>
                    </div>
                    <button
                        type="button"
                        autoFocus
                        onClick={onClose}
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-lg text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                        aria-label="إغلاق"
                    >
                        ×
                    </button>
                </header>

                <dl className="grid gap-x-6 gap-y-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-1">
                        <dt className="text-xs text-slate-500">المريض</dt>
                        <dd className="text-sm font-semibold text-slate-800">
                            {order.patient?.full_name ?? '—'}
                        </dd>
                    </div>
                    <div className="grid gap-1">
                        <dt className="text-xs text-slate-500">الفرع</dt>
                        <dd className="text-sm font-semibold text-slate-800">
                            {order.branch?.name ?? '—'}
                        </dd>
                    </div>
                    <div className="grid gap-1">
                        <dt className="text-xs text-slate-500">الحالة</dt>
                        <dd>
                            <StatusBadge status={order.status} />
                        </dd>
                    </div>
                    <div className="grid gap-1">
                        <dt className="text-xs text-slate-500">
                            الطبيب المحوّل
                        </dt>
                        <dd className="text-sm font-semibold text-slate-800">
                            {order.referring_doctor?.name ?? 'طلب مباشر'}
                        </dd>
                    </div>
                    <div className="grid gap-1">
                        <dt className="text-xs text-slate-500">الأولوية</dt>
                        <dd className="text-sm font-semibold text-slate-800">
                            {order.priority === 'urgent'
                                ? `عاجل${order.urgent_reason ? `: ${order.urgent_reason}` : ''}`
                                : 'عادي'}
                        </dd>
                    </div>
                    <div className="grid gap-1">
                        <dt className="text-xs text-slate-500">تاريخ الإنشاء</dt>
                        <dd className="text-sm font-semibold text-slate-800">
                            {order.created_at
                                ? new Date(order.created_at).toLocaleString(
                                      'ar-EG',
                                  )
                                : '—'}
                        </dd>
                    </div>
                    {order.expected_result_at && (
                        <div className="grid gap-1">
                            <dt className="text-xs text-slate-500">
                                موعد النتيجة المتوقع
                            </dt>
                            <dd className="text-sm font-semibold text-slate-800">
                                {new Date(
                                    order.expected_result_at,
                                ).toLocaleString('ar-EG')}
                            </dd>
                        </div>
                    )}
                </dl>

                {order.notes && (
                    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="mb-1 text-xs font-semibold text-slate-500">
                            ملاحظات الطلب
                        </h3>
                        <p className="text-sm leading-6 whitespace-pre-wrap text-slate-800">
                            {order.notes}
                        </p>
                    </div>
                )}

                <section aria-labelledby="order-tests-title">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h3
                            id="order-tests-title"
                            className="text-sm font-bold text-slate-900"
                        >
                            التحاليل المطلوبة
                        </h3>
                        <span className="text-xs text-slate-500">
                            {order.items?.length ?? 0} تحليل
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                        {order.items?.map((item) => (
                            <div
                                key={item.id}
                                className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                            >
                                <div className="grid gap-1">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {item.test_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {item.specimen_type}
                                        {item.sample?.barcode
                                            ? ` · باركود العينة: ${item.sample.barcode}`
                                            : ''}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">
                                    {formatPrice(item.price)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        {Number(order.discount_amount) > 0 && (
                            <span className="text-emerald-700">
                                الخصم:{' '}
                                {formatPrice(order.discount_amount ?? '0')}
                            </span>
                        )}
                        <span className="font-bold text-slate-900">
                            الإجمالي: {formatPrice(order.total ?? '0')}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="hover:bg-brand-800 h-10 rounded-lg bg-brand-700 px-5 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                    >
                        إغلاق
                    </button>
                </footer>
            </section>
        </div>
    );
}
