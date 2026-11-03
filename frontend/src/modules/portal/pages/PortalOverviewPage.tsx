import { useEffect, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';
import { StatusBadge } from '@/components/laboratory/workflow-ui';
import {
    type ApiPage,
    type ReportData,
    type WorkflowRow,
} from '@/components/laboratory/workflow-types';
import {
    fetchOperationsReport,
    fetchWorkflowRows,
    getWorkflowOrdersUrl,
} from '@/modules/laboratory/services/workflowApi';
import type { DashboardSummary } from '@/modules/laboratory/types';
import type { AuthUser } from '@/modules/auth/types';
import type { PortalSection } from '@/app/routes';

type PortalOverviewPageProps = {
    user: AuthUser;
    roleLabel: string;
    canManagePatients: boolean;
    testsTotal?: number;
    patientsTotal?: number;
    branchesTotal?: number;
    summary: DashboardSummary | null;
    loading: boolean;
    token: string;
    orderRealtimeRevision: number;
    onNavigate: (section: PortalSection) => void;
    onViewOrder: (orderNumber: string) => void;
    onViewUrgentOrders: () => void;
};

type Metric = {
    label: string;
    value?: number;
    icon: IconName;
    tint: string;
    section: PortalSection;
};

type QuickAction = {
    title: string;
    description: string;
    icon: IconName;
    section: PortalSection;
};

export function PortalOverviewPage({
    user,
    roleLabel,
    canManagePatients,
    testsTotal,
    patientsTotal,
    branchesTotal,
    summary,
    loading,
    token,
    orderRealtimeRevision,
    onNavigate,
    onViewOrder,
    onViewUrgentOrders,
}: PortalOverviewPageProps) {
    const [orders, setOrders] = useState<ApiPage<WorkflowRow> | null>(null);
    const [workflowReport, setWorkflowReport] = useState<ReportData | null>(
        null,
    );
    const [urgentOrdersCount, setUrgentOrdersCount] = useState<number | null>(
        null,
    );
    const [orderStatusFilter, setOrderStatusFilter] = useState<
        '' | 'processing' | 'completed'
    >('');
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [workflowLoading, setWorkflowLoading] = useState(true);
    const [ordersError, setOrdersError] = useState('');
    const [workflowError, setWorkflowError] = useState('');
    const [refreshRevision, setRefreshRevision] = useState(0);

    useEffect(() => {
        if (!canManagePatients) {
            return;
        }

        let cancelled = false;
        const url = orderStatusFilter
            ? getWorkflowOrdersUrl({ status: orderStatusFilter })
            : undefined;

        setOrdersLoading(true);
        setOrdersError('');

        fetchWorkflowRows(token, 'orders', url)
            .then((response) => {
                if (!cancelled) {
                    setOrders(response);
                }
            })
            .catch((requestError: unknown) => {
                if (!cancelled) {
                    setOrdersError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'تعذّر تحميل أحدث الطلبات.',
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setOrdersLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [
        canManagePatients,
        orderRealtimeRevision,
        orderStatusFilter,
        refreshRevision,
        token,
    ]);

    useEffect(() => {
        if (!canManagePatients) {
            return;
        }

        let cancelled = false;
        setWorkflowLoading(true);
        setWorkflowError('');

        void Promise.allSettled([
            fetchOperationsReport(token),
            fetchWorkflowRows(
                token,
                'orders',
                getWorkflowOrdersUrl({
                    priority: 'urgent',
                    status: 'registered',
                }),
            ),
            fetchWorkflowRows(
                token,
                'orders',
                getWorkflowOrdersUrl({
                    priority: 'urgent',
                    status: 'processing',
                }),
            ),
        ])
            .then(
                ([
                    reportResult,
                    urgentRegisteredOrdersResult,
                    urgentProcessingOrdersResult,
                ]) => {
                    if (cancelled) {
                        return;
                    }

                    const errors: string[] = [];

                    if (reportResult.status === 'fulfilled') {
                        setWorkflowReport(reportResult.value);
                    } else {
                        errors.push('تعذّر تحميل ملخص دورة العمل.');
                    }

                    if (
                        urgentRegisteredOrdersResult.status === 'fulfilled' &&
                        urgentProcessingOrdersResult.status === 'fulfilled'
                    ) {
                        setUrgentOrdersCount(
                            urgentRegisteredOrdersResult.value.meta.total +
                                urgentProcessingOrdersResult.value.meta.total,
                        );
                    } else {
                        errors.push('تعذّر التحقق من الطلبات العاجلة.');
                    }

                    setWorkflowError(errors.join(' '));
                },
            )
            .finally(() => {
                if (!cancelled) {
                    setWorkflowLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [canManagePatients, orderRealtimeRevision, refreshRevision, token]);

    const metrics: Metric[] = [];

    if (canManagePatients) {
        metrics.push(
            {
                label: 'إجمالي المرضى',
                value: patientsTotal,
                icon: 'users',
                tint: 'bg-sky-50 text-sky-700',
                section: 'patients',
            },
            {
                label: 'الفروع المتاحة',
                value: branchesTotal,
                icon: 'branch',
                tint: 'bg-violet-50 text-violet-700',
                section: 'branches',
            },
        );
    }

    metrics.push({
        label: 'التحاليل النشطة',
        value: testsTotal,
        icon: 'beaker',
        tint: 'bg-brand-50 text-brand-700',
        section: 'tests',
    });

    if (canManagePatients) {
        metrics.push({
            label: 'طلبات اليوم',
            value: summary?.orders_today,
            icon: 'clipboard',
            tint: 'bg-amber-50 text-amber-700',
            section: 'orders',
        });
    } else if (user.role === 'patient') {
        metrics.push({
            label: 'نتائج معتمدة',
            value: summary?.patient_results ?? undefined,
            icon: 'file',
            tint: 'bg-emerald-50 text-emerald-700',
            section: 'patient-results',
        });
    } else if (user.role === 'doctor') {
        metrics.push(
            {
                label: 'إحالاتي الطبية',
                value: summary?.doctor_orders ?? undefined,
                icon: 'clipboard',
                tint: 'bg-sky-50 text-sky-700',
                section: 'doctor-orders',
            },
            {
                label: 'إحالات عاجلة',
                value: summary?.doctor_urgent_orders ?? undefined,
                icon: 'activity',
                tint: 'bg-rose-50 text-rose-700',
                section: 'doctor-orders',
            },
            {
                label: 'نتائج معتمدة',
                value: summary?.doctor_available_results ?? undefined,
                icon: 'file',
                tint: 'bg-emerald-50 text-emerald-700',
                section: 'doctor-orders',
            },
        );
    }

    const quickActions: QuickAction[] = [
        ...(canManagePatients
            ? [
                  {
                      title: 'ملفات المرضى',
                      description: 'عرض وإضافة وتحديث بيانات المرضى',
                      icon: 'users' as const,
                      section: 'patients' as const,
                  },
              ]
            : []),
        {
            title: 'كتالوج التحاليل',
            description: 'الأسعار والعينات ومدة الإنجاز',
            icon: 'beaker',
            section: 'tests',
        },
        ...(canManagePatients
            ? [
                  {
                      title: 'الفروع',
                      description: 'الفروع المسندة إلى حسابك',
                      icon: 'branch' as const,
                      section: 'branches' as const,
                  },
                  {
                      title: 'طلبات التحاليل',
                      description: 'تسجيل الطلبات ومتابعة حالتها',
                      icon: 'clipboard' as const,
                      section: 'orders' as const,
                  },
                  {
                      title: 'استلام العينات',
                      description: 'تحديث حالة العينات المسجلة',
                      icon: 'flask' as const,
                      section: 'samples' as const,
                  },
                  {
                      title: 'النتائج',
                      description: 'إدخال النتائج واعتمادها',
                      icon: 'file' as const,
                      section: 'results' as const,
                  },
              ]
            : user.role === 'patient'
              ? [
                    {
                        title: 'نتائجي',
                        description: 'عرض النتائج المعتمدة',
                        icon: 'file' as const,
                        section: 'patient-results' as const,
                    },
                ]
              : []),
    ];

    return (
        <div className="grid gap-7">
            {canManagePatients ? (
                <section className="flex flex-wrap items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <p className="text-xs font-medium text-brand-700">
                            {roleLabel}
                        </p>
                        <h2 className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
                            ملخص تشغيل المختبر
                        </h2>
                        <p className="text-sm text-slate-500">
                            أرقام مباشرة تساعدك تتابع سير العمل اليوم.
                        </p>
                    </div>
                </section>
            ) : (
                <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-[0_2px_8px_-4px_rgba(15,55,48,0.12)] sm:px-7 sm:py-7">
                    <div className="grid max-w-xl gap-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="size-1.5 rounded-full bg-brand-500" />
                            <span>{roleLabel} · مساحة العمل</span>
                        </div>
                        <h2 className="text-2xl leading-[1.5] font-bold text-ink-950 sm:text-[1.7rem]">
                            {user.role === 'doctor'
                                ? 'تابع إحالاتك ونتائج مرضاك.'
                                : 'مرحباً بك في بوابة المختبر.'}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-slate-500">
                            {user.role === 'patient'
                                ? 'تابع طلباتك واطّلع على النتائج التي اعتمدها المختبر.'
                                : 'استعرض كتالوج التحاليل المتاحة للمختبر.'}
                        </p>
                    </div>
                </section>
            )}

            <section className="grid gap-4">
                <div className="flex items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <h3 className="text-base font-bold text-ink-950">
                            المؤشرات الرئيسية
                        </h3>
                        <p className="text-xs text-slate-500">
                            أعداد السجلات المسجلة حاليًا
                        </p>
                    </div>
                </div>
                <section
                    className={`grid gap-3 ${canManagePatients ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4' : metrics.length > 2 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}
                >
                    {metrics.map((metric) => (
                        <button
                            key={metric.label}
                            type="button"
                            aria-busy={loading}
                            onClick={() => onNavigate(metric.section)}
                            className="group hover:border-brand-200 relative flex min-h-28 items-center gap-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 text-right shadow-[0_2px_8px_-4px_rgba(15,55,48,0.1)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-15px_rgba(15,85,72,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:min-h-32 sm:gap-4 sm:p-5"
                        >
                            <span
                                className={`grid size-10 shrink-0 place-items-center rounded-xl transition duration-200 group-hover:scale-105 sm:size-11 ${metric.tint}`}
                            >
                                <Icon name={metric.icon} size={20} />
                            </span>
                            <div className="grid min-w-0 flex-1 gap-1">
                                <span className="text-xs leading-5 font-medium text-slate-500 sm:text-[13px]">
                                    {metric.label}
                                </span>
                                <span className="text-2xl leading-tight font-bold tracking-tight text-ink-950 sm:text-3xl">
                                    {loading ? (
                                        <span
                                            aria-label="جارٍ تحميل المؤشر"
                                            className="block h-7 w-14 animate-pulse rounded-md bg-slate-100"
                                        />
                                    ) : metric.value === undefined ? (
                                        '—'
                                    ) : (
                                        new Intl.NumberFormat('ar-EG').format(
                                            metric.value,
                                        )
                                    )}
                                </span>
                            </div>
                            <span className="shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-brand-700">
                                <Icon name="arrow-left" size={15} />
                            </span>
                        </button>
                    ))}
                </section>
            </section>

            {canManagePatients ? (
                <LaboratoryDashboardSections
                    summary={summary}
                    report={workflowReport}
                    orders={orders}
                    urgentOrdersCount={urgentOrdersCount}
                    ordersLoading={ordersLoading}
                    workflowLoading={workflowLoading}
                    ordersError={ordersError}
                    workflowError={workflowError}
                    orderStatusFilter={orderStatusFilter}
                    onOrderStatusFilterChange={setOrderStatusFilter}
                    onRetry={() =>
                        setRefreshRevision((revision) => revision + 1)
                    }
                    onNavigate={onNavigate}
                    onViewOrder={onViewOrder}
                    onViewUrgentOrders={onViewUrgentOrders}
                />
            ) : null}

            {!canManagePatients && (
                <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,55,48,0.12)] transition-shadow duration-200 hover:shadow-[0_12px_28px_-18px_rgba(15,85,72,0.2)] sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900">
                                    الوصول السريع
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    انتقل مباشرة إلى القسم المطلوب.
                                </p>
                            </div>
                            <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                                <Icon name="activity" size={18} />
                            </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.section}
                                    type="button"
                                    onClick={() => onNavigate(action.section)}
                                    className="group hover:border-brand-200 flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-right transition duration-200 hover:-translate-y-0.5 hover:bg-brand-50/60 hover:shadow-[0_8px_18px_-12px_rgba(15,85,72,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                >
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-brand-700 transition group-hover:bg-white">
                                        <Icon name={action.icon} size={19} />
                                    </span>
                                    <span className="grid min-w-0 gap-1">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {action.title}
                                        </span>
                                        <span className="truncate text-xs text-slate-500">
                                            {action.description}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid content-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,55,48,0.12)] sm:p-6">
                        <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                            <Icon name="shield" size={19} />
                        </div>
                        <div className="grid gap-2">
                            <h3 className="font-bold text-slate-900">
                                نطاق المرحلة الحالية
                            </h3>
                            <p className="text-sm leading-6 text-slate-500">
                                إدارة دورة الطلب والعينة والنتيجة والتقارير
                                متصلة بواجهات الـAPI مع التحقق من الصلاحيات.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                            <span className="size-2 rounded-full bg-emerald-500" />{' '}
                            اتصال API جاهز
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

function LaboratoryDashboardSections({
    summary,
    report,
    orders,
    urgentOrdersCount,
    ordersLoading,
    workflowLoading,
    ordersError,
    workflowError,
    orderStatusFilter,
    onOrderStatusFilterChange,
    onRetry,
    onNavigate,
    onViewOrder,
    onViewUrgentOrders,
}: {
    summary: DashboardSummary | null;
    report: ReportData | null;
    orders: ApiPage<WorkflowRow> | null;
    urgentOrdersCount: number | null;
    ordersLoading: boolean;
    workflowLoading: boolean;
    ordersError: string;
    workflowError: string;
    orderStatusFilter: '' | 'processing' | 'completed';
    onOrderStatusFilterChange: (
        status: '' | 'processing' | 'completed',
    ) => void;
    onRetry: () => void;
    onNavigate: (section: PortalSection) => void;
    onViewOrder: (orderNumber: string) => void;
    onViewUrgentOrders: () => void;
}) {
    const attentionItems = [
        {
            title: 'استلام العينات',
            description: 'عينات بانتظار تسجيل الاستلام',
            value: summary?.pending_samples,
            icon: 'flask' as const,
            surface: 'border-emerald-100 bg-emerald-50/60',
            iconSurface: 'bg-white text-emerald-700',
            section: 'samples' as const,
            action: 'فتح قائمة الاستلام',
        },
        {
            title: 'النتائج',
            description: 'تحاليل بانتظار إدخال النتيجة أو اعتمادها',
            value: summary?.pending_results,
            icon: 'file' as const,
            surface: 'border-violet-100 bg-violet-50/50',
            iconSurface: 'bg-white text-violet-700',
            section: 'results' as const,
            action: 'فتح قائمة النتائج',
        },
    ];

    const workflowSteps = [
        {
            title: 'استلام العينات',
            detail: 'بانتظار تسجيل الاستلام',
            value: summary?.pending_samples,
            icon: 'flask' as const,
            section: 'samples' as const,
            tint: 'bg-amber-50 text-amber-700',
        },
        {
            title: 'إجراء التحاليل',
            detail: 'طلبات قيد التنفيذ',
            value: report?.orders_by_status.processing,
            icon: 'beaker' as const,
            section: 'orders' as const,
            tint: 'bg-sky-50 text-sky-700',
        },
        {
            title: 'مراجعة واعتماد',
            detail: 'مسودات نتائج غير معتمدة',
            value: report?.results_pending_approval,
            icon: 'file' as const,
            section: 'results' as const,
            tint: 'bg-violet-50 text-violet-700',
        },
        {
            title: 'طلبات مكتملة',
            detail: 'تم اعتماد كل النتائج',
            value: report?.completed_orders,
            icon: 'check' as const,
            section: 'orders' as const,
            tint: 'bg-emerald-50 text-emerald-700',
        },
    ];
    const visibleOrders = orders?.data.slice(0, 5) ?? [];

    return (
        <section className="grid gap-5">
            <div className="grid gap-3">
                <div className="flex items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <h3 className="text-base font-bold text-ink-950">
                            يحتاج انتباهك
                        </h3>
                        <p className="text-xs text-slate-500">
                            خطوات عمل يمكنك متابعتها الآن
                        </p>
                    </div>
                    <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        حسب صلاحياتك وفروعك
                    </span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                    {attentionItems.map((item) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => onNavigate(item.section)}
                            className={`group relative flex min-h-36 items-center justify-between gap-4 overflow-hidden rounded-2xl border p-5 text-right shadow-[0_2px_8px_-4px_rgba(15,55,48,0.1)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgba(15,85,72,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${item.surface}`}
                        >
                            <div className="grid min-w-0 gap-3">
                                <span className="text-xs font-semibold text-slate-500">
                                    {item.title}
                                </span>
                                <span className="text-xl leading-7 font-bold text-ink-950">
                                    {item.value == null
                                        ? '—'
                                        : new Intl.NumberFormat('ar-EG').format(
                                              item.value,
                                          )}{' '}
                                    {item.title === 'استلام العينات'
                                        ? 'عينات'
                                        : 'نتائج'}
                                </span>
                                <span className="text-xs leading-5 text-slate-600">
                                    {item.description}
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 transition group-hover:gap-3">
                                    {item.action}
                                    <Icon name="arrow-left" size={15} />
                                </span>
                            </div>
                            <span
                                className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.iconSurface}`}
                            >
                                <Icon name={item.icon} size={20} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {urgentOrdersCount !== null && urgentOrdersCount > 0 && (
                <button
                    type="button"
                    onClick={onViewUrgentOrders}
                    className="group flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-right transition duration-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-[0_8px_20px_-14px_rgba(146,93,15,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                    <span className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-white text-amber-700">
                            <Icon name="activity" size={18} />
                        </span>
                        <span className="grid gap-1">
                            <span className="text-sm font-bold text-amber-950">
                                طلبات عاجلة تحتاج الأولوية
                            </span>
                            <span className="text-xs text-amber-800">
                                يوجد{' '}
                                {new Intl.NumberFormat('ar-EG').format(
                                    urgentOrdersCount,
                                )}{' '}
                                طلب عاجل ضمن قائمة العمل الحالية.
                            </span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 transition group-hover:gap-3">
                        عرض قائمة الطلبات
                        <Icon name="arrow-left" size={15} />
                    </span>
                </button>
            )}

            {(ordersError || workflowError) && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                    <span>
                        {[ordersError, workflowError].filter(Boolean).join(' ')}
                    </span>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_8px_-4px_rgba(15,55,48,0.12)] transition-shadow duration-200 hover:shadow-[0_14px_30px_-18px_rgba(15,85,72,0.22)]">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h3 className="font-bold text-slate-900">
                                أحدث طلبات التحاليل
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                نظرة سريعة على الطلبات وحالتها الحالية
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('orders')}
                            className="hover:text-brand-900 inline-flex items-center gap-2 self-start text-xs font-semibold text-brand-700 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:self-auto"
                        >
                            جميع الطلبات
                            <Icon name="arrow-left" size={15} />
                        </button>
                    </div>
                    <div className="flex gap-2 border-b border-slate-100 px-5 pt-3 sm:px-6">
                        {[
                            { label: 'كل الطلبات', value: '' as const },
                            {
                                label: 'قيد التنفيذ',
                                value: 'processing' as const,
                            },
                            { label: 'مكتملة', value: 'completed' as const },
                        ].map((filter) => (
                            <button
                                key={filter.value || 'all'}
                                type="button"
                                aria-pressed={
                                    orderStatusFilter === filter.value
                                }
                                onClick={() =>
                                    onOrderStatusFilterChange(filter.value)
                                }
                                className={`border-b-2 px-2 pb-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                                    orderStatusFilter === filter.value
                                        ? 'text-brand-800 border-brand-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-x-auto">
                        {ordersLoading ? (
                            <div
                                aria-label="جارٍ تحميل الطلبات"
                                className="grid gap-3 p-5 sm:p-6"
                            >
                                {[1, 2, 3, 4].map((row) => (
                                    <div
                                        key={row}
                                        className="h-12 animate-pulse rounded-lg bg-slate-100"
                                    />
                                ))}
                            </div>
                        ) : ordersError ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                تعذّر تحميل الطلبات. استخدم زر إعادة المحاولة.
                            </div>
                        ) : visibleOrders.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                {orderStatusFilter
                                    ? 'لا توجد طلبات بهذه الحالة.'
                                    : 'لا توجد طلبات لعرضها بعد.'}
                            </div>
                        ) : (
                            <table className="w-full min-w-[690px] text-right text-sm">
                                <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 sm:px-6">
                                            رقم الطلب
                                        </th>
                                        <th className="px-4 py-3">المريض</th>
                                        <th className="px-4 py-3">التحاليل</th>
                                        <th className="px-4 py-3">الحالة</th>
                                        <th className="px-4 py-3">
                                            وقت الإنشاء
                                        </th>
                                        <th className="px-4 py-3">
                                            <span className="sr-only">
                                                فتح التفاصيل
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visibleOrders.map((order) => {
                                        const orderNumber = order.order_number;

                                        return (
                                            <tr
                                                key={order.id}
                                                className="transition-colors hover:bg-brand-50/40"
                                            >
                                                <td className="px-5 py-3.5 font-semibold text-slate-800 sm:px-6">
                                                    <span className="flex items-center gap-2">
                                                        {orderNumber ?? '—'}
                                                        {order.priority ===
                                                            'urgent' && (
                                                            <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                                عاجل
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-700">
                                                    {order.patient?.full_name ??
                                                        '—'}
                                                </td>
                                                <td className="max-w-56 truncate px-4 py-3.5 text-slate-600">
                                                    {order.items
                                                        ?.map(
                                                            (item) =>
                                                                item.test_name,
                                                        )
                                                        .join('، ') || '—'}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge
                                                        status={order.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3.5 text-xs whitespace-nowrap text-slate-500">
                                                    {formatOrderDate(
                                                        order.created_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {orderNumber && (
                                                        <button
                                                            type="button"
                                                            aria-label={`عرض الطلب ${orderNumber}`}
                                                            onClick={() =>
                                                                onViewOrder(
                                                                    orderNumber,
                                                                )
                                                            }
                                                            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                                        >
                                                            <Icon
                                                                name="arrow-left"
                                                                size={16}
                                                            />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {!ordersLoading && orders?.meta.total !== undefined && (
                        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">
                            إجمالي الطلبات في هذه القائمة:{' '}
                            {new Intl.NumberFormat('ar-EG').format(
                                orders.meta.total,
                            )}
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,55,48,0.12)] transition-shadow duration-200 hover:shadow-[0_14px_30px_-18px_rgba(15,85,72,0.22)] sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <h3 className="font-bold text-slate-900">
                                مسار العمل
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                متابعة مراحل الطلب من الاستلام حتى الاعتماد
                            </p>
                        </div>
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                            <Icon name="clipboard" size={18} />
                        </span>
                    </div>
                    <div className="grid">
                        {workflowSteps.map((step, index) => (
                            <button
                                key={step.title}
                                type="button"
                                onClick={() => onNavigate(step.section)}
                                className="group relative flex items-center gap-3 rounded-xl px-2 py-3 text-right transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                            >
                                {index < workflowSteps.length - 1 && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute top-[3.4rem] right-[1.3rem] h-6 border-r border-dashed border-slate-200"
                                    />
                                )}
                                <span
                                    className={`grid size-10 shrink-0 place-items-center rounded-full ${step.tint}`}
                                >
                                    <Icon name={step.icon} size={17} />
                                </span>
                                <span className="grid min-w-0 flex-1 gap-1">
                                    <span className="text-sm font-semibold text-slate-800">
                                        {step.title}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {step.detail}
                                    </span>
                                </span>
                                <span className="min-w-7 text-left text-sm font-bold text-slate-700">
                                    {workflowLoading || step.value == null
                                        ? '—'
                                        : new Intl.NumberFormat('ar-EG').format(
                                              step.value,
                                          )}
                                </span>
                            </button>
                        ))}
                    </div>
                    {workflowError && (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                            بعض مؤشرات المسار غير متاحة مؤقتًا.
                        </p>
                    )}
                </section>
            </div>

            {urgentOrdersCount !== null &&
                urgentOrdersCount === 0 &&
                workflowError === '' && (
                    <p className="text-center text-xs text-slate-400">
                        لا توجد طلبات عاجلة حاليًا.
                    </p>
                )}
        </section>
    );
}

function formatOrderDate(value: string | undefined): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? '—'
        : new Intl.DateTimeFormat('ar-EG', {
              dateStyle: 'short',
              timeStyle: 'short',
          }).format(date);
}
