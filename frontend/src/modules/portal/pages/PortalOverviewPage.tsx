import { Icon, type IconName } from '@/components/ui/icon';
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
    onNavigate: (section: PortalSection) => void;
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
    onNavigate,
}: PortalOverviewPageProps) {
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
        metrics.push(
            {
                label: 'طلبات اليوم',
                value: summary?.orders_today,
                icon: 'clipboard',
                tint: 'bg-amber-50 text-amber-700',
                section: 'orders',
            },
            {
                label: 'عينات بانتظار الاستلام',
                value: summary?.pending_samples ?? undefined,
                icon: 'flask',
                tint: 'bg-cyan-50 text-cyan-700',
                section: 'samples',
            },
            {
                label: 'نتائج بانتظار الاعتماد',
                value: summary?.pending_results ?? undefined,
                icon: 'file',
                tint: 'bg-orange-50 text-orange-700',
                section: 'results',
            },
        );
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
            <section className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:px-7 sm:py-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="grid max-w-xl gap-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="size-1.5 rounded-full bg-brand-500" />
                            <span>{roleLabel} · مساحة العمل</span>
                        </div>
                        <h2 className="text-2xl leading-[1.5] font-bold text-ink-950 sm:text-[1.7rem]">
                            {canManagePatients
                                ? 'مساحة عملك جاهزة.'
                                : user.role === 'doctor'
                                  ? 'تابع إحالاتك ونتائج مرضاك.'
                                  : 'مرحباً بك في بوابة المختبر.'}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-slate-500">
                            {canManagePatients
                                ? 'تابع بيانات المرضى والفروع وكتالوج التحاليل من مكان واحد. الأرقام هنا مبنية على سجلات النظام الفعلية.'
                                : user.role === 'patient'
                                  ? 'تابع طلباتك واطّلع على النتائج التي اعتمدها المختبر.'
                                  : 'استعرض كتالوج التحاليل المتاحة للمختبر.'}
                        </p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 sm:flex">
                        <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-700">
                            <Icon name="activity" size={23} />
                        </span>
                        <span className="grid gap-1">
                            <span className="text-xs text-slate-500">
                                حالة النظام
                            </span>
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                متصل
                            </span>
                        </span>
                    </div>
                </div>
            </section>

            <section className="grid gap-4">
                <div className="flex items-end justify-between gap-3">
                    <div className="grid gap-1">
                        <h3 className="text-base font-bold text-ink-950">
                            مؤشرات المختبر
                        </h3>
                        <p className="text-xs text-slate-500">
                            نظرة سريعة على بيانات النظام الحالية
                        </p>
                    </div>
                    <span className="hidden rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-[11px] font-medium text-slate-500 sm:inline-flex">
                        تحديث مباشر من النظام
                    </span>
                </div>
                <section
                    className={`grid gap-4 ${metrics.length > 2 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}
                >
                    {metrics.map((metric) => (
                        <button
                            key={metric.label}
                            type="button"
                            onClick={() => onNavigate(metric.section)}
                            className="group relative grid gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] transition duration-200 hover:border-brand-100 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className={`grid size-11 place-items-center rounded-[0.95rem] ${metric.tint}`}
                                >
                                    <Icon name={metric.icon} size={20} />
                                </span>
                                <span className="grid size-8 place-items-center rounded-full text-slate-300 transition group-hover:bg-brand-50 group-hover:text-brand-700">
                                    <Icon name="arrow-left" size={16} />
                                </span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-[13px] font-medium text-slate-500">
                                    {metric.label}
                                </span>
                                <span className="text-[2rem] leading-tight font-bold tracking-tight text-ink-950">
                                    {loading || metric.value === undefined
                                        ? '—'
                                        : new Intl.NumberFormat('ar-EG').format(
                                              metric.value,
                                          )}
                                </span>
                            </div>
                        </button>
                    ))}
                </section>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:p-6">
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
                                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-right transition hover:border-brand-100 hover:bg-brand-50/50"
                            >
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-brand-700">
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
                <div className="grid content-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:p-6">
                    <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                        <Icon name="shield" size={19} />
                    </div>
                    <div className="grid gap-2">
                        <h3 className="font-bold text-slate-900">
                            نطاق المرحلة الحالية
                        </h3>
                        <p className="text-sm leading-6 text-slate-500">
                            إدارة دورة الطلب والعينة والنتيجة والتقارير متصلة
                            بواجهات الـAPI مع التحقق من الصلاحيات.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                        <span className="size-2 rounded-full bg-emerald-500" />{' '}
                        اتصال API جاهز
                    </div>
                </div>
            </section>
        </div>
    );
}
