import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PortalRouter } from '@/app/router';
import {
    canAccessPortalSection,
    getPortalPath,
    getPortalSection,
    type PortalSection,
} from '@/app/routes';
import { ApiError } from '@/lib/api-client';
import type { ApiPage } from '@/types/api';
import type { UserRole } from '@/types/common';
import {
    fetchCurrentUser,
    login,
    logout,
} from '@/modules/auth/services/authApi';
import type { AuthUser } from '@/modules/auth/types';
import {
    fetchBranches,
    fetchDashboardSummary,
    fetchPatients,
    fetchTests,
    saveBranch,
    savePatient,
    saveTest,
} from '@/modules/laboratory/services/laboratoryApi';
import {
    isWorkflowSection,
    WorkflowSectionPage,
    workflowSectionTitle,
} from '@/components/laboratory/workflow-pages';
import type {
    Branch,
    BranchPayload,
    DashboardSummary,
    LabTest,
    LabTestPayload,
    Patient,
    PatientPayload,
} from '@/modules/laboratory/types';
import {
    DoctorPortalPage,
    doctorSectionTitle,
    isDoctorPortalSection,
} from '@/modules/doctors/pages/DoctorPortalPage';
import { DoctorManagementPage } from '@/modules/doctors/pages/DoctorManagementPage';
import { ReferralDiscountRulesPage } from '@/modules/referral-discounts/pages/ReferralDiscountRulesPage';

type Section = PortalSection;
type User = AuthUser;
type Editor = {
    kind: 'patient' | 'test' | 'branch';
    id?: number;
    values: Record<string, string | boolean>;
};
type IconName =
    | 'activity'
    | 'arrow-left'
    | 'arrow-right'
    | 'beaker'
    | 'branch'
    | 'check'
    | 'chevron-down'
    | 'clock'
    | 'clipboard'
    | 'close'
    | 'dashboard'
    | 'edit'
    | 'file'
    | 'report'
    | 'flask'
    | 'logout'
    | 'menu'
    | 'plus'
    | 'search'
    | 'shield'
    | 'users';

const TOKEN_KEY = 'lab-portal-token';

const roleLabels: Record<UserRole, string> = {
    patient: 'مريض',
    doctor: 'طبيب',
    lab_staff: 'فريق المختبر',
    lab_admin: 'مدير المختبر',
};

const formatPrice = (price: string): string =>
    new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 2,
    }).format(Number(price));

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true as const,
    };

    const shapes: Record<IconName, ReactNode> = {
        activity: (
            <>
                <path d="M3 12h4l3-8 4 16 3-8h4" />
            </>
        ),
        'arrow-left': (
            <>
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
            </>
        ),
        'arrow-right': (
            <>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </>
        ),
        beaker: (
            <>
                <path d="M9 3h6" />
                <path d="M10 3v7l-5.3 8.2A2.5 2.5 0 0 0 6.8 22h10.4a2.5 2.5 0 0 0 2.1-3.8L14 10V3" />
                <path d="M8 16h8" />
            </>
        ),
        branch: (
            <>
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
                <path d="M7 10v3a3 3 0 0 0 3 3h4" />
                <path d="M17 14v-3a3 3 0 0 0-3-3h-4" />
            </>
        ),
        check: (
            <>
                <path d="m5 12 4 4L19 6" />
            </>
        ),
        'chevron-down': (
            <>
                <path d="m6 9 6 6 6-6" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        clipboard: (
            <>
                <rect x="5" y="4" width="14" height="17" rx="2" />
                <path d="M9 4.5h6a1.5 1.5 0 0 0-3-1.5h0a1.5 1.5 0 0 0-3 1.5ZM8 11h8M8 15h8" />
            </>
        ),
        close: (
            <>
                <path d="m18 6-12 12M6 6l12 12" />
            </>
        ),
        dashboard: (
            <>
                <rect x="3" y="3" width="8" height="8" rx="2" />
                <rect x="13" y="3" width="8" height="5" rx="2" />
                <rect x="13" y="10" width="8" height="11" rx="2" />
                <rect x="3" y="13" width="8" height="8" rx="2" />
            </>
        ),
        edit: (
            <>
                <path d="m16 4 4 4L9 19l-5 1 1-5L16 4Z" />
                <path d="m14 6 4 4" />
            </>
        ),
        file: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h8" />
            </>
        ),
        report: (
            <>
                <path d="M4 19V5M4 19h17" />
                <path d="m7 15 4-4 3 2 5-7" />
            </>
        ),
        flask: (
            <>
                <path d="M9 3h6M10 3v7l-5.3 8.2A2.5 2.5 0 0 0 6.8 22h10.4a2.5 2.5 0 0 0 2.1-3.8L14 10V3" />
                <path d="M8 16h8" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </>
        ),
        menu: (
            <>
                <path d="M4 6h16M4 12h16M4 18h16" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14M5 12h14" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
            </>
        ),
    };

    return <svg {...common}>{shapes[name]}</svg>;
}

function Field({
    label,
    error,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
}) {
    return (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
            {label}
            <input
                {...props}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
            {error && (
                <span className="text-xs font-normal text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function EmptyState({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: IconName;
}) {
    return (
        <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="grid justify-items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon name={icon} size={22} />
                </span>
                <div className="grid gap-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="max-w-sm text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

function LoadingRows() {
    return (
        <div className="grid gap-3 p-5" aria-label="جاري التحميل">
            {[1, 2, 3].map((row) => (
                <div
                    key={row}
                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
            ))}
        </div>
    );
}

export default function Welcome() {
    return <PortalRouter page={<WelcomePage />} />;
}

function WelcomePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [booting, setBooting] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showDemoCredentials, setShowDemoCredentials] = useState(false);
    const [busy, setBusy] = useState(false);
    const section = getPortalSection(location.pathname) ?? 'overview';
    const [patients, setPatients] = useState<ApiPage<Patient> | null>(null);
    const [tests, setTests] = useState<ApiPage<LabTest> | null>(null);
    const [branches, setBranches] = useState<ApiPage<Branch> | null>(null);
    const [dashboardSummary, setDashboardSummary] =
        useState<DashboardSummary | null>(null);
    const [loadingSection, setLoadingSection] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [query, setQuery] = useState('');
    const [editor, setEditor] = useState<Editor | null>(null);
    const [editorErrors, setEditorErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [notice, setNotice] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const canManagePatients =
        user?.role === 'lab_staff' || user?.role === 'lab_admin';
    const canManageBranches = user?.role === 'lab_admin';
    const canManageUsers = user?.role === 'lab_admin';
    const navItems = useMemo(
        () => [
            {
                id: 'overview' as const,
                label: 'نظرة عامة',
                icon: 'dashboard' as const,
            },
            ...(canManagePatients
                ? [
                      {
                          id: 'patients' as const,
                          label: 'المرضى',
                          icon: 'users' as const,
                      },
                  ]
                : []),
            {
                id: 'tests' as const,
                label: 'كتالوج التحاليل',
                icon: 'beaker' as const,
            },
            ...(canManagePatients
                ? [
                      {
                          id: 'branches' as const,
                          label: 'الفروع',
                          icon: 'branch' as const,
                      },
                      {
                          id: 'orders' as const,
                          label: 'الطلبات',
                          icon: 'clipboard' as const,
                      },
                      {
                          id: 'samples' as const,
                          label: 'العينات',
                          icon: 'flask' as const,
                      },
                      {
                          id: 'results' as const,
                          label: 'النتائج',
                          icon: 'file' as const,
                      },
                      {
                          id: 'reports' as const,
                          label: 'التقارير',
                          icon: 'report' as const,
                      },
                  ]
                : []),
            ...(canManageUsers
                ? [
                      {
                          id: 'users' as const,
                          label: 'المستخدمون',
                          icon: 'shield' as const,
                      },
                      {
                          id: 'doctor-review' as const,
                          label: 'اعتماد الأطباء',
                          icon: 'check' as const,
                      },
                      {
                          id: 'referral-discounts' as const,
                          label: 'خصومات الإحالات',
                          icon: 'report' as const,
                      },
                  ]
                : []),
            ...(user?.role === 'doctor'
                ? [
                      {
                          id: 'doctor-profile' as const,
                          label: 'ملفي الطبي',
                          icon: 'shield' as const,
                      },
                      {
                          id: 'doctor-orders' as const,
                          label: 'إحالاتي الطبية',
                          icon: 'clipboard' as const,
                      },
                      {
                          id: 'doctor-new-referral' as const,
                          label: 'إحالة جديدة',
                          icon: 'plus' as const,
                      },
                  ]
                : []),
            ...(user?.role === 'patient'
                ? [
                      {
                          id: 'patient-orders' as const,
                          label: 'طلباتي',
                          icon: 'clipboard' as const,
                      },
                      {
                          id: 'patient-results' as const,
                          label: 'نتائجي',
                          icon: 'file' as const,
                      },
                  ]
                : []),
        ],
        [canManagePatients, canManageUsers, user?.role],
    );

    const loadPage = useCallback(
        async (kind: 'patients' | 'tests' | 'branches', url?: string) => {
            if (!token) {
                return null;
            }

            if (kind === 'patients') {
                const response = await fetchPatients(token, url);
                setPatients(response);
                return response;
            }

            if (kind === 'tests') {
                const response = await fetchTests(token, url);
                setTests(response);
                return response;
            }

            const response = await fetchBranches(token, url);
            setBranches(response);

            return response;
        },
        [token],
    );

    const loadOverview = useCallback(async () => {
        if (!token) {
            return;
        }

        setLoadingSection(true);
        setLoadError('');

        const requests: Promise<unknown>[] = [
            loadPage('tests'),
            fetchDashboardSummary(token).then(setDashboardSummary),
        ];

        if (canManagePatients) {
            requests.push(loadPage('patients'));
            requests.push(loadPage('branches'));
        }

        const results = await Promise.allSettled(requests);
        const failed = results.find(
            (result): result is PromiseRejectedResult =>
                result.status === 'rejected',
        );

        if (failed) {
            setLoadError(
                failed.reason instanceof Error
                    ? failed.reason.message
                    : 'تعذّر تحميل بيانات لوحة التحكم.',
            );
        }

        setLoadingSection(false);
    }, [canManagePatients, loadPage, token]);

    const loadSection = useCallback(
        async (nextSection: Section, url?: string) => {
            setQuery('');
            setLoadError('');
            setLoadingSection(true);

            try {
                if (nextSection === 'patients') {
                    await loadPage('patients', url);
                }
                if (nextSection === 'tests') {
                    await loadPage('tests', url);
                }
                if (nextSection === 'branches') {
                    await loadPage('branches', url);
                }
            } catch (error) {
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : 'تعذّر تحميل البيانات.',
                );
            } finally {
                setLoadingSection(false);
                setMobileMenuOpen(false);
            }
        },
        [loadPage],
    );

    function navigateToSection(nextSection: Section) {
        setQuery('');
        setLoadError('');
        setMobileMenuOpen(false);
        void navigate(getPortalPath(nextSection));
    }

    useEffect(() => {
        setShowDemoCredentials(
            ['localhost', '127.0.0.1'].includes(window.location.hostname),
        );

        const savedToken = window.sessionStorage.getItem(TOKEN_KEY);

        if (!savedToken) {
            setBooting(false);
            return;
        }

        let cancelled = false;

        void fetchCurrentUser(savedToken)
            .then((authenticatedUser) => {
                if (cancelled) return;
                setToken(savedToken);
                setUser(authenticatedUser);
                setBooting(false);
            })
            .catch(() => {
                window.sessionStorage.removeItem(TOKEN_KEY);
                if (!cancelled) setBooting(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (user && token && section === 'overview') {
            void loadOverview();
        }
    }, [loadOverview, section, token, user]);

    useEffect(() => {
        if (
            token &&
            user &&
            canAccessPortalSection(user.role, section) &&
            (section === 'patients' ||
                section === 'tests' ||
                section === 'branches')
        ) {
            void loadSection(section);
        }
    }, [loadSection, section, token, user]);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setLoginError('');

        try {
            const response = await login({
                email: loginEmail,
                password: loginPassword,
                device_name: 'laboratory-web',
            });

            window.sessionStorage.setItem(TOKEN_KEY, response.data.token);
            setToken(response.data.token);
            setUser(response.data.user);
            setLoginPassword('');
            void navigate(getPortalPath('overview'));
        } catch (error) {
            setLoginError(
                error instanceof Error ? error.message : 'تعذّر تسجيل الدخول.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function handleLogout() {
        if (token) {
            try {
                await logout(token);
            } catch {
                setNotice(
                    'تعذّر تأكيد تسجيل الخروج من الخادم، وتم إنهاء الجلسة على هذا الجهاز.',
                );
            }
        }

        window.sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setPatients(null);
        setTests(null);
        setBranches(null);
        setDashboardSummary(null);
        void navigate('/');
    }

    function openEditor(
        kind: Editor['kind'],
        record?: Patient | LabTest | Branch,
    ) {
        setEditorErrors({});

        if (kind === 'patient') {
            const patient = record as Patient | undefined;
            setEditor({
                kind,
                id: patient?.id,
                values: {
                    full_name: patient?.full_name ?? '',
                    phone: patient?.phone ?? '',
                    email: patient?.email ?? '',
                    date_of_birth: patient?.date_of_birth ?? '',
                    gender: patient?.gender ?? '',
                },
            });
        } else if (kind === 'test') {
            const test = record as LabTest | undefined;
            setEditor({
                kind,
                id: test?.id,
                values: {
                    code: test?.code ?? '',
                    name: test?.name ?? '',
                    description: test?.description ?? '',
                    specimen_type: test?.specimen_type ?? '',
                    price: test?.price ?? '',
                    turnaround_time_minutes: String(
                        test?.turnaround_time_minutes ?? 60,
                    ),
                    is_active: test?.is_active ?? true,
                },
            });
        } else {
            const branch = record as Branch | undefined;
            setEditor({
                kind,
                id: branch?.id,
                values: {
                    name: branch?.name ?? '',
                    code: branch?.code ?? '',
                    address: branch?.address ?? '',
                    phone: branch?.phone ?? '',
                    is_active: branch?.is_active ?? true,
                    is_default: branch?.is_default ?? false,
                },
            });
        }
    }

    async function saveEditor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editor || !token) return;

        setBusy(true);
        setEditorErrors({});
        setLoadError('');

        try {
            const { kind, id, values } = editor;
            const stringValue = (key: string) => {
                const value = values[key];

                return typeof value === 'string' ? value : '';
            };

            if (kind === 'patient') {
                const payload: PatientPayload = {
                    full_name: stringValue('full_name'),
                    phone: stringValue('phone'),
                    ...(stringValue('email')
                        ? { email: stringValue('email') }
                        : {}),
                    ...(stringValue('date_of_birth')
                        ? { date_of_birth: stringValue('date_of_birth') }
                        : {}),
                    ...(stringValue('gender')
                        ? { gender: stringValue('gender') }
                        : {}),
                };
                await savePatient(token, id, payload);
            } else if (kind === 'test') {
                const payload: LabTestPayload = {
                    code: stringValue('code'),
                    name: stringValue('name'),
                    description: stringValue('description') || null,
                    specimen_type: stringValue('specimen_type'),
                    price: stringValue('price'),
                    turnaround_time_minutes: Number(
                        stringValue('turnaround_time_minutes'),
                    ),
                    is_active: values.is_active === true,
                };
                await saveTest(token, id, payload);
            } else {
                const payload: BranchPayload = {
                    name: stringValue('name'),
                    code: stringValue('code'),
                    address: stringValue('address') || null,
                    phone: stringValue('phone') || null,
                    is_active: values.is_active === true,
                    is_default: values.is_default === true,
                };
                await saveBranch(token, id, payload);
            }
            setEditor(null);
            setNotice('تم حفظ التغييرات بنجاح.');

            if (section === 'overview') {
                await loadOverview();
            } else {
                await loadSection(section);
            }
        } catch (error) {
            if (error instanceof ApiError) {
                setEditorErrors(error.validationErrors);
                setLoadError(
                    error.validationErrors &&
                        Object.keys(error.validationErrors).length === 0
                        ? error.message
                        : '',
                );
            } else {
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : 'تعذّر حفظ البيانات.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    const activeRecords =
        section === 'patients'
            ? (patients?.data ?? [])
            : section === 'tests'
              ? (tests?.data ?? [])
              : section === 'branches'
                ? (branches?.data ?? [])
                : [];
    const filteredRecords = activeRecords.filter((record) =>
        JSON.stringify(record)
            .toLocaleLowerCase('ar')
            .includes(query.toLocaleLowerCase('ar')),
    );
    const activePage =
        section === 'patients'
            ? patients
            : section === 'tests'
              ? tests
              : section === 'branches'
                ? branches
                : null;

    if (booting) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#f3f6f5]">
                <div className="grid justify-items-center gap-4 text-sm text-slate-500">
                    <span className="grid size-16 place-items-center rounded-[1.4rem] bg-white text-brand-700 shadow-[0_14px_40px_-22px_rgba(17,107,94,0.5)]">
                        <Icon name="flask" size={27} />
                    </span>
                    <span className="size-6 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
                    جارٍ تجهيز مساحة العمل...
                </div>
            </main>
        );
    }

    if (!user || !token) {
        return (
            <>
                <main className="relative grid min-h-screen overflow-hidden bg-[#f3f6f5] px-4 py-7 lg:grid-cols-[1fr_0.9fr] lg:px-0 lg:py-0">
                    <div className="pointer-events-none absolute -top-36 -right-28 size-[28rem] rounded-full bg-brand-100/70 blur-3xl" />
                    <section className="relative order-2 mx-auto flex w-full max-w-xl flex-col justify-center px-2 py-10 lg:order-1 lg:px-16 xl:px-24">
                        <div className="mb-10 flex items-center gap-3">
                            <span className="grid size-12 place-items-center rounded-[1.15rem] bg-brand-700 text-white shadow-lg shadow-brand-700/20">
                                <Icon name="flask" size={25} />
                            </span>
                            <div>
                                <p className="text-lg font-bold text-ink-950">
                                    معمل
                                </p>
                                <p className="text-xs text-slate-500">
                                    نظام إدارة المختبر
                                </p>
                            </div>
                        </div>

                        <div className="mb-8 grid gap-3">
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                بوابة المختبر الآمنة
                            </span>
                            <h1 className="text-3xl leading-[1.45] font-bold tracking-tight text-ink-950 sm:text-[2.7rem]">
                                أهلاً بك،
                                <br />
                                <span className="text-brand-600">
                                    رعاية أدق تبدأ هنا.
                                </span>
                            </h1>
                            <p className="max-w-md text-[15px] leading-8 text-slate-500">
                                سجّل الدخول لإدارة بيانات المرضى وكتالوج التحاليل
                                والفروع حسب صلاحيات حسابك.
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="grid gap-5 rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-[0_28px_90px_-42px_rgba(20,54,49,0.3)] ring-1 ring-slate-900/[0.03] sm:p-8"
                        >
                            <div className="grid gap-1">
                                <h2 className="text-xl font-bold text-slate-900">
                                    تسجيل الدخول
                                </h2>
                                <p className="text-sm text-slate-500">
                                    استخدم بيانات الحساب التي وفرها مسؤول
                                    النظام.
                                </p>
                            </div>
                            {loginError && <ErrorBanner message={loginError} />}
                            <Field
                                label="البريد الإلكتروني"
                                type="email"
                                autoComplete="username"
                                placeholder="name@example.com"
                                value={loginEmail}
                                onChange={(event) =>
                                    setLoginEmail(event.target.value)
                                }
                                required
                                dir="ltr"
                            />
                            <Field
                                label="كلمة المرور"
                                type="password"
                                autoComplete="current-password"
                                placeholder="أدخل كلمة المرور"
                                value={loginPassword}
                                onChange={(event) =>
                                    setLoginPassword(event.target.value)
                                }
                                required
                            />
                            <button
                                type="submit"
                                disabled={busy}
                                className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-700/15 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {busy
                                    ? 'جارٍ تسجيل الدخول...'
                                    : 'دخول إلى النظام'}
                                {!busy && <Icon name="arrow-left" size={17} />}
                            </button>
                            <p className="text-center text-xs leading-5 text-slate-400">
                                {showDemoCredentials
                                    ? 'حساب التطوير: admin@lab.test — كلمة المرور من LAB_DEMO_PASSWORD (الافتراضية: password).'
                                    : 'استخدم بيانات الحساب التي وفرها مسؤول النظام.'}
                            </p>
                        </form>

                        <p className="mt-8 text-center text-xs text-slate-400 lg:text-right">
                            بيانات المرضى محمية ولا تظهر إلا للمستخدمين المخوّلين.
                        </p>
                    </section>

                    <aside className="relative order-1 hidden overflow-hidden bg-[#103c37] p-12 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between xl:p-16">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(75,190,170,0.28),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(25,117,108,0.65),transparent_42%),linear-gradient(145deg,#103c37,#102e2d)]" />
                        <div className="relative flex items-center justify-between">
                            <span className="text-sm font-semibold tracking-wide text-white/75">
                                LABORATORY MANAGEMENT
                            </span>
                            <span className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-white/10">
                                <Icon name="activity" size={22} />
                            </span>
                        </div>
                        <div className="relative mx-auto grid max-w-lg gap-8">
                            <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
                                <div className="mb-8 flex items-center justify-between">
                                    <div className="grid gap-1">
                                        <span className="text-sm text-white/65">
                                            رعاية متصلة
                                        </span>
                                        <span className="text-xl font-semibold">
                                            من العينة إلى النتيجة
                                        </span>
                                    </div>
                                    <span className="grid size-12 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200">
                                        <Icon name="beaker" size={25} />
                                    </span>
                                </div>
                                <div className="grid gap-3">
                                    {[
                                        [
                                            '01',
                                            'بيانات منظمة',
                                            'ملفات المرضى والتحاليل في مكان واحد',
                                        ],
                                        [
                                            '02',
                                            'صلاحيات واضحة',
                                            'كل مستخدم يرى ما تسمح به صلاحياته',
                                        ],
                                        [
                                            '03',
                                            'خطوة بخطوة',
                                            'قاعدة جاهزة لتوسيع دورة الطلبات والنتائج',
                                        ],
                                    ].map(([number, title, description]) => (
                                        <div
                                            key={number}
                                            className="flex items-center gap-4 rounded-2xl bg-black/10 p-4"
                                        >
                                            <span className="text-xs font-semibold text-emerald-200/75">
                                                {number}
                                            </span>
                                            <div className="grid gap-1">
                                                <span className="text-sm font-semibold">
                                                    {title}
                                                </span>
                                                <span className="text-xs text-white/55">
                                                    {description}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-center text-sm text-white/55">
                                نظام موحد لمختبر واحد وفروعه.
                            </p>
                        </div>
                        <p className="relative text-xs text-white/40">
                            واجهة عربية • متوافقة مع الأجهزة المختلفة
                        </p>
                    </aside>
                </main>
            </>
        );
    }

    if (!canAccessPortalSection(user.role, section)) {
        return <Navigate to={getPortalPath('overview')} replace />;
    }

    const pageTitle = isDoctorPortalSection(section)
        ? doctorSectionTitle(section)
        : section === 'doctor-review'
          ? 'اعتماد الأطباء'
          : section === 'referral-discounts'
            ? 'خصومات الإحالات'
            : isWorkflowSection(section)
              ? workflowSectionTitle(section)
              : section === 'patients'
                ? 'المرضى'
                : section === 'tests'
                  ? 'كتالوج التحاليل'
                  : section === 'branches'
                    ? 'الفروع'
                    : 'نظرة عامة';
    const displayName = user.name.split(' ')[0] || user.name;

    return (
        <>
            <div className="min-h-screen bg-transparent text-slate-800">
                {mobileMenuOpen && (
                    <button
                        type="button"
                        aria-label="إغلاق القائمة"
                        className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
                <aside
                    className={`fixed inset-y-0 right-0 z-40 flex w-[272px] flex-col border-l border-white/10 bg-[#123a36] text-white shadow-2xl shadow-slate-950/10 transition-transform duration-200 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-6">
                        <span className="grid size-11 place-items-center rounded-[1rem] bg-emerald-300/15 text-emerald-200 ring-1 ring-white/10">
                            <Icon name="flask" size={21} />
                        </span>
                        <div>
                            <p className="font-bold text-white">معمل</p>
                            <p className="text-[11px] text-emerald-100/55">
                                إدارة المختبر
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-1.5 px-4 py-7">
                        <p className="px-3 pb-3 text-[10px] font-bold tracking-widest text-emerald-100/45">
                            القائمة الرئيسية
                        </p>
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                to={getPortalPath(item.id)}
                                onClick={() => {
                                    setQuery('');
                                    setLoadError('');
                                    setMobileMenuOpen(false);
                                }}
                                className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${section === item.id ? 'bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-100/10' : 'text-emerald-50/65 hover:bg-white/[0.06] hover:text-white'}`}
                            >
                                <span
                                    className={`grid size-8 place-items-center rounded-lg transition ${section === item.id ? 'bg-emerald-200/10 text-emerald-200' : 'text-emerald-100/55 group-hover:text-white'}`}
                                >
                                    <Icon name={item.icon} size={17} />
                                </span>
                                <span>{item.label}</span>
                                {section === item.id && (
                                    <span className="mr-auto size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto grid gap-3 border-t border-white/10 p-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.05] p-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-200/10 text-sm font-bold text-emerald-100 ring-1 ring-white/10">
                                {displayName.slice(0, 1)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">
                                    {user.name}
                                </p>
                                <p className="text-xs text-emerald-100/55">
                                    {roleLabels[user.role]}
                                </p>
                            </div>
                            <span className="size-2 rounded-full bg-emerald-300" />
                        </div>
                        <button
                            type="button"
                            onClick={() => void handleLogout()}
                            className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-emerald-50/60 transition hover:bg-rose-400/10 hover:text-rose-200"
                        >
                            <Icon name="logout" size={17} />
                            تسجيل الخروج
                        </button>
                    </div>
                </aside>

                <div className="min-h-screen lg:mr-[272px]">
                    <header className="sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="فتح القائمة"
                                onClick={() => setMobileMenuOpen(true)}
                                className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
                            >
                                <Icon name="menu" />
                            </button>
                            <div>
                                <p className="text-xs font-medium text-slate-400">
                                    مرحباً، {displayName}
                                </p>
                                <h1 className="text-lg font-bold text-ink-950 sm:text-xl">
                                    {pageTitle}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:inline-flex">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                اتصال آمن
                            </span>
                            <span className="grid size-10 place-items-center rounded-2xl bg-brand-700 font-bold text-white shadow-md shadow-brand-700/15">
                                {displayName.slice(0, 1)}
                            </span>
                        </div>
                    </header>

                    <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
                        {notice && (
                            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                <span className="flex items-center gap-2">
                                    <Icon name="check" size={17} />
                                    {notice}
                                </span>
                                <button
                                    type="button"
                                    aria-label="إغلاق الإشعار"
                                    onClick={() => setNotice('')}
                                >
                                    <Icon name="close" size={17} />
                                </button>
                            </div>
                        )}
                        {loadError && (
                            <div className="mb-5">
                                <ErrorBanner
                                    message={loadError}
                                    onDismiss={() => setLoadError('')}
                                />
                            </div>
                        )}

                        {section === 'overview' ? (
                            <Overview
                                user={user}
                                canManagePatients={canManagePatients}
                                testsTotal={tests?.meta.total}
                                patientsTotal={patients?.meta.total}
                                branchesTotal={branches?.meta.total}
                                summary={dashboardSummary}
                                loading={loadingSection}
                                onNavigate={navigateToSection}
                            />
                        ) : isDoctorPortalSection(section) ? (
                            <DoctorPortalPage
                                section={section}
                                token={token}
                                onNotice={setNotice}
                            />
                        ) : section === 'doctor-review' ? (
                            <DoctorManagementPage
                                token={token}
                                onNotice={setNotice}
                            />
                        ) : section === 'referral-discounts' ? (
                            <ReferralDiscountRulesPage
                                token={token}
                                onNotice={setNotice}
                            />
                        ) : isWorkflowSection(section) ? (
                            <WorkflowSectionPage
                                section={section}
                                token={token}
                                role={user.role}
                                currentUserId={user.id}
                                onNotice={setNotice}
                            />
                        ) : (
                            <section className="grid gap-5">
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                    <div className="grid gap-1">
                                        <p className="text-sm text-slate-500">
                                            إدارة وتحديث بيانات {pageTitle}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            تعرض النتائج الحالية فقط؛ لا يدعم
                                            الـAPI البحث من الخادم بعد.
                                        </p>
                                    </div>
                                    {((section === 'patients' &&
                                        canManagePatients) ||
                                        (section === 'tests' &&
                                            canManagePatients) ||
                                        (section === 'branches' &&
                                            canManageBranches)) && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditor(
                                                    section === 'patients'
                                                        ? 'patient'
                                                        : section === 'tests'
                                                          ? 'test'
                                                          : 'branch',
                                                )
                                            }
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
                                        >
                                            <Icon name="plus" size={17} />
                                            إضافة{' '}
                                            {section === 'patients'
                                                ? 'مريض'
                                                : section === 'tests'
                                                  ? 'تحليل'
                                                  : 'فرع'}
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="relative w-full sm:max-w-sm">
                                        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">
                                            <Icon name="search" size={17} />
                                        </span>
                                        <input
                                            value={query}
                                            onChange={(event) =>
                                                setQuery(event.target.value)
                                            }
                                            placeholder={`بحث في ${pageTitle} المعروضة`}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 text-sm transition outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {activePage
                                            ? `إجمالي ${activePage.meta.total} سجل`
                                            : 'لا توجد بيانات محملة'}
                                    </span>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                                    {loadingSection ? (
                                        <LoadingRows />
                                    ) : filteredRecords.length === 0 ? (
                                        <EmptyState
                                            title={
                                                query
                                                    ? 'لا توجد نتائج مطابقة'
                                                    : 'لا توجد سجلات بعد'
                                            }
                                            description={
                                                query
                                                    ? 'جرّب تغيير عبارة البحث.'
                                                    : 'أضف أول سجل ليظهر هنا.'
                                            }
                                            icon={
                                                section === 'patients'
                                                    ? 'users'
                                                    : section === 'branches'
                                                      ? 'branch'
                                                      : 'beaker'
                                            }
                                        />
                                    ) : section === 'patients' ? (
                                        <PatientTable
                                            rows={filteredRecords as Patient[]}
                                            canEdit={canManagePatients}
                                            onEdit={(record) =>
                                                openEditor('patient', record)
                                            }
                                        />
                                    ) : section === 'tests' ? (
                                        <TestTable
                                            rows={filteredRecords as LabTest[]}
                                            canEdit={canManagePatients}
                                            onEdit={(record) =>
                                                openEditor('test', record)
                                            }
                                        />
                                    ) : (
                                        <BranchTable
                                            rows={filteredRecords as Branch[]}
                                            canEdit={canManageBranches}
                                            onEdit={(record) =>
                                                openEditor('branch', record)
                                            }
                                        />
                                    )}
                                </div>

                                {activePage &&
                                    activePage.meta.last_page > 1 && (
                                        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                                            <button
                                                type="button"
                                                disabled={
                                                    !activePage.links.prev ||
                                                    loadingSection
                                                }
                                                onClick={() => {
                                                    const previousUrl =
                                                        activePage.links.prev;
                                                    if (previousUrl)
                                                        void loadSection(
                                                            section,
                                                            previousUrl,
                                                        );
                                                }}
                                                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Icon
                                                    name="arrow-right"
                                                    size={16}
                                                />{' '}
                                                السابق
                                            </button>
                                            <span className="text-xs text-slate-500">
                                                صفحة{' '}
                                                {activePage.meta.current_page}{' '}
                                                من {activePage.meta.last_page}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={
                                                    !activePage.links.next ||
                                                    loadingSection
                                                }
                                                onClick={() => {
                                                    const nextUrl =
                                                        activePage.links.next;
                                                    if (nextUrl)
                                                        void loadSection(
                                                            section,
                                                            nextUrl,
                                                        );
                                                }}
                                                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                التالي{' '}
                                                <Icon
                                                    name="arrow-left"
                                                    size={16}
                                                />
                                            </button>
                                        </div>
                                    )}
                            </section>
                        )}
                    </main>
                </div>

                {editor && (
                    <EditorDialog
                        editor={editor}
                        errors={editorErrors}
                        busy={busy}
                        onClose={() => {
                            setEditor(null);
                            setEditorErrors({});
                        }}
                        onChange={(key, value) =>
                            setEditor((current) =>
                                current
                                    ? {
                                          ...current,
                                          values: {
                                              ...current.values,
                                              [key]: value,
                                          },
                                      }
                                    : null,
                            )
                        }
                        onSubmit={saveEditor}
                    />
                )}
            </div>
        </>
    );
}

function ErrorBanner({
    message,
    onDismiss,
}: {
    message: string;
    onDismiss?: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
        >
            <span>{message}</span>
            {onDismiss && (
                <button type="button" aria-label="إغلاق" onClick={onDismiss}>
                    <Icon name="close" size={17} />
                </button>
            )}
        </div>
    );
}

function Overview({
    user,
    canManagePatients,
    testsTotal,
    patientsTotal,
    branchesTotal,
    summary,
    loading,
    onNavigate,
}: {
    user: User;
    canManagePatients: boolean;
    testsTotal?: number;
    patientsTotal?: number;
    branchesTotal?: number;
    summary: DashboardSummary | null;
    loading: boolean;
    onNavigate: (section: Section) => void;
}) {
    const cards = [
        ...(canManagePatients
            ? [
                  {
                      label: 'إجمالي المرضى',
                      value: patientsTotal,
                      icon: 'users' as const,
                      tint: 'bg-sky-50 text-sky-700',
                      section: 'patients' as const,
                  },
                  {
                      label: 'الفروع المتاحة',
                      value: branchesTotal,
                      icon: 'branch' as const,
                      tint: 'bg-violet-50 text-violet-700',
                      section: 'branches' as const,
                  },
              ]
            : []),
        {
            label: 'التحاليل النشطة',
            value: testsTotal,
            icon: 'beaker' as const,
            tint: 'bg-brand-50 text-brand-700',
            section: 'tests' as const,
        },
        ...(canManagePatients
            ? [
                  {
                      label: 'طلبات اليوم',
                      value: summary?.orders_today,
                      icon: 'clipboard' as const,
                      tint: 'bg-amber-50 text-amber-700',
                      section: 'orders' as const,
                  },
                  {
                      label: 'عينات بانتظار الاستلام',
                      value: summary?.pending_samples ?? undefined,
                      icon: 'flask' as const,
                      tint: 'bg-cyan-50 text-cyan-700',
                      section: 'samples' as const,
                  },
                  {
                      label: 'نتائج بانتظار الاعتماد',
                      value: summary?.pending_results ?? undefined,
                      icon: 'file' as const,
                      tint: 'bg-orange-50 text-orange-700',
                      section: 'results' as const,
                  },
              ]
            : user.role === 'patient'
              ? [
                    {
                        label: 'نتائج معتمدة',
                        value: summary?.patient_results ?? undefined,
                        icon: 'file' as const,
                        tint: 'bg-emerald-50 text-emerald-700',
                        section: 'patient-results' as const,
                    },
                ]
              : user.role === 'doctor'
                ? [
                      {
                          label: 'إحالاتي الطبية',
                          value: summary?.doctor_orders ?? undefined,
                          icon: 'clipboard' as const,
                          tint: 'bg-sky-50 text-sky-700',
                          section: 'doctor-orders' as const,
                      },
                      {
                          label: 'إحالات عاجلة',
                          value: summary?.doctor_urgent_orders ?? undefined,
                          icon: 'activity' as const,
                          tint: 'bg-rose-50 text-rose-700',
                          section: 'doctor-orders' as const,
                      },
                      {
                          label: 'نتائج معتمدة',
                          value: summary?.doctor_available_results ?? undefined,
                          icon: 'file' as const,
                          tint: 'bg-emerald-50 text-emerald-700',
                          section: 'doctor-orders' as const,
                      },
                  ]
                : []),
    ];

    return (
        <div className="grid gap-8">
            <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#123e39] px-6 py-8 text-white shadow-[0_22px_55px_-36px_rgba(12,68,57,0.65)] sm:px-9 sm:py-9">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_15%,rgba(90,190,157,0.24),transparent_30%),linear-gradient(112deg,rgba(13,55,50,0.12),rgba(17,89,75,0.56))]" />
                <div className="absolute -top-28 -left-12 -z-10 size-72 rounded-full border border-white/[0.07]" />
                <div className="absolute -top-18 -left-2 -z-10 size-52 rounded-full border border-white/[0.07]" />
                <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
                    <div className="grid max-w-xl gap-3">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.7)]" />
                            <span className="text-xs font-semibold tracking-wide text-emerald-100/80">
                                {roleLabels[user.role]} · مساحة العمل
                            </span>
                        </div>
                        <h2 className="text-2xl leading-[1.5] font-bold sm:text-3xl">
                            {canManagePatients
                                ? 'مساحة عملك جاهزة.'
                                : user.role === 'doctor'
                                  ? 'تابع إحالاتك ونتائج مرضاك.'
                                  : 'مرحباً بك في بوابة المختبر.'}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-white/70">
                            {canManagePatients
                                ? 'تابع بيانات المرضى والفروع وكتالوج التحاليل من مكان واحد. الأرقام هنا مبنية على سجلات النظام الفعلية.'
                                : user.role === 'patient'
                                  ? 'تابع طلباتك واطّلع على النتائج التي اعتمدها المختبر.'
                                  : 'استعرض كتالوج التحاليل المتاحة للمختبر.'}
                        </p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 sm:flex">
                        <span className="grid size-11 place-items-center rounded-xl bg-emerald-200/10 text-emerald-100">
                            <Icon name="activity" size={23} />
                        </span>
                        <span className="grid gap-1">
                            <span className="text-xs text-white/55">
                                حالة النظام
                            </span>
                            <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                <span className="size-1.5 rounded-full bg-emerald-300" />
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
                    className={`grid gap-4 ${cards.length > 2 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}
                >
                    {cards.map((card) => (
                        <button
                            key={card.label}
                            type="button"
                            onClick={() => onNavigate(card.section)}
                            className="group relative grid gap-5 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-right shadow-[0_8px_24px_-22px_rgba(20,54,49,0.45)] transition duration-200 hover:-translate-y-1 hover:border-brand-100 hover:bg-white hover:shadow-[0_20px_40px_-28px_rgba(20,54,49,0.35)]"
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className={`grid size-11 place-items-center rounded-[0.95rem] ${card.tint}`}
                                >
                                    <Icon name={card.icon} size={20} />
                                </span>
                                <span className="grid size-8 place-items-center rounded-full text-slate-300 transition group-hover:bg-brand-50 group-hover:text-brand-700">
                                    <Icon name="arrow-left" size={16} />
                                </span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-[13px] font-medium text-slate-500">
                                    {card.label}
                                </span>
                                <span className="text-[2rem] leading-tight font-bold tracking-tight text-ink-950">
                                    {loading || card.value === undefined
                                        ? '—'
                                        : new Intl.NumberFormat('ar-EG').format(
                                              card.value,
                                          )}
                                </span>
                            </div>
                        </button>
                    ))}
                </section>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.45)] sm:p-6">
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
                        {canManagePatients && (
                            <QuickLink
                                title="ملفات المرضى"
                                description="عرض وإضافة وتحديث بيانات المرضى"
                                icon="users"
                                onClick={() => onNavigate('patients')}
                            />
                        )}
                        <QuickLink
                            title="كتالوج التحاليل"
                            description="الأسعار والعينات ومدة الإنجاز"
                            icon="beaker"
                            onClick={() => onNavigate('tests')}
                        />
                        {canManagePatients && (
                            <QuickLink
                                title="الفروع"
                                description="الفروع المسندة إلى حسابك"
                                icon="branch"
                                onClick={() => onNavigate('branches')}
                            />
                        )}
                        {canManagePatients && (
                            <QuickLink
                                title="طلبات التحاليل"
                                description="تسجيل الطلبات ومتابعة حالتها"
                                icon="clipboard"
                                onClick={() => onNavigate('orders')}
                            />
                        )}
                        {canManagePatients && (
                            <QuickLink
                                title="استلام العينات"
                                description="تحديث حالة العينات المسجلة"
                                icon="flask"
                                onClick={() => onNavigate('samples')}
                            />
                        )}
                        {canManagePatients && (
                            <QuickLink
                                title="النتائج"
                                description="إدخال النتائج واعتمادها"
                                icon="file"
                                onClick={() => onNavigate('results')}
                            />
                        )}
                        {user.role === 'patient' && (
                            <QuickLink
                                title="نتائجي"
                                description="عرض النتائج المعتمدة"
                                icon="file"
                                onClick={() => onNavigate('patient-results')}
                            />
                        )}
                    </div>
                </div>
                <div className="grid content-start gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.45)] sm:p-6">
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

function QuickLink({
    title,
    description,
    icon,
    onClick,
}: {
    title: string;
    description: string;
    icon: IconName;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-right transition hover:border-brand-100 hover:bg-brand-50/50"
        >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-brand-700">
                <Icon name={icon} size={19} />
            </span>
            <span className="grid min-w-0 gap-1">
                <span className="text-sm font-semibold text-slate-800">
                    {title}
                </span>
                <span className="truncate text-xs text-slate-500">
                    {description}
                </span>
            </span>
        </button>
    );
}

function TableShell({ children }: { children: ReactNode }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-right text-sm">
                {children}
            </table>
        </div>
    );
}

function TableHead({ labels }: { labels: string[] }) {
    return (
        <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500">
            <tr>
                {labels.map((label) => (
                    <th key={label} className="px-5 py-4">
                        {label}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

function PatientTable({
    rows,
    canEdit,
    onEdit,
}: {
    rows: Patient[];
    canEdit: boolean;
    onEdit: (patient: Patient) => void;
}) {
    return (
        <TableShell>
            <TableHead
                labels={[
                    'اسم المريض',
                    'رقم الهاتف',
                    'البريد الإلكتروني',
                    'تاريخ الميلاد',
                    '',
                ]}
            />
            <tbody className="divide-y divide-slate-100">
                {rows.map((patient) => (
                    <tr
                        key={patient.id}
                        className="transition hover:bg-slate-50/70"
                    >
                        <td className="px-5 py-4 font-semibold text-slate-800">
                            {patient.full_name}
                        </td>
                        <td className="px-5 py-4 text-slate-600" dir="ltr">
                            {patient.phone}
                        </td>
                        <td className="px-5 py-4 text-slate-500" dir="ltr">
                            {patient.email || '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                            {patient.date_of_birth || '—'}
                        </td>
                        <td className="px-5 py-4 text-left">
                            {canEdit && (
                                <EditButton onClick={() => onEdit(patient)} />
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableShell>
    );
}

function TestTable({
    rows,
    canEdit,
    onEdit,
}: {
    rows: LabTest[];
    canEdit: boolean;
    onEdit: (test: LabTest) => void;
}) {
    return (
        <TableShell>
            <TableHead
                labels={[
                    'اسم التحليل',
                    'الكود',
                    'نوع العينة',
                    'السعر',
                    'مدة الإنجاز',
                    '',
                ]}
            />
            <tbody className="divide-y divide-slate-100">
                {rows.map((test) => (
                    <tr
                        key={test.id}
                        className="transition hover:bg-slate-50/70"
                    >
                        <td className="px-5 py-4 font-semibold text-slate-800">
                            {test.name}
                            {test.description && (
                                <p className="mt-1 max-w-xs truncate text-xs font-normal text-slate-400">
                                    {test.description}
                                </p>
                            )}
                        </td>
                        <td className="px-5 py-4">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {test.code}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                            {test.specimen_type}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700">
                            {formatPrice(test.price)}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                            {new Intl.NumberFormat('ar-EG').format(
                                test.turnaround_time_minutes,
                            )}{' '}
                            دقيقة
                        </td>
                        <td className="px-5 py-4 text-left">
                            {canEdit && (
                                <EditButton onClick={() => onEdit(test)} />
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableShell>
    );
}

function BranchTable({
    rows,
    canEdit,
    onEdit,
}: {
    rows: Branch[];
    canEdit: boolean;
    onEdit: (branch: Branch) => void;
}) {
    return (
        <TableShell>
            <TableHead
                labels={[
                    'اسم الفرع',
                    'الكود',
                    'العنوان',
                    'الهاتف',
                    'الحالة',
                    '',
                ]}
            />
            <tbody className="divide-y divide-slate-100">
                {rows.map((branch) => (
                    <tr
                        key={branch.id}
                        className="transition hover:bg-slate-50/70"
                    >
                        <td className="px-5 py-4 font-semibold text-slate-800">
                            {branch.name}
                            {branch.is_default && (
                                <span className="mr-2 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">
                                    افتراضي
                                </span>
                            )}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                            {branch.code}
                        </td>
                        <td className="max-w-xs truncate px-5 py-4 text-slate-500">
                            {branch.address || '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-500" dir="ltr">
                            {branch.phone || '—'}
                        </td>
                        <td className="px-5 py-4">
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${branch.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {branch.is_active ? 'نشط' : 'غير نشط'}
                            </span>
                        </td>
                        <td className="px-5 py-4 text-left">
                            {canEdit && (
                                <EditButton onClick={() => onEdit(branch)} />
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableShell>
    );
}

function EditButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            aria-label="تعديل"
            onClick={onClick}
            className="hover:border-brand-200 grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700"
        >
            <Icon name="edit" size={16} />
        </button>
    );
}

function EditorDialog({
    editor,
    errors,
    busy,
    onClose,
    onChange,
    onSubmit,
}: {
    editor: Editor;
    errors: Record<string, string[]>;
    busy: boolean;
    onClose: () => void;
    onChange: (key: string, value: string | boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    const title =
        editor.kind === 'patient'
            ? editor.id
                ? 'تعديل بيانات المريض'
                : 'إضافة مريض'
            : editor.kind === 'test'
              ? editor.id
                  ? 'تعديل التحليل'
                  : 'إضافة تحليل'
              : editor.id
                ? 'تعديل الفرع'
                : 'إضافة فرع';

    function input(
        key: string,
        label: string,
        options: InputHTMLAttributes<HTMLInputElement> = {},
    ) {
        return (
            <Field
                label={label}
                value={String(editor.values[key] ?? '')}
                onChange={(event) => onChange(key, event.target.value)}
                error={errors[key]?.[0]}
                {...options}
            />
        );
    }

    function toggle(key: string, label: string) {
        return (
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <input
                    type="checkbox"
                    checked={Boolean(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.checked)}
                    className="size-4 accent-brand-600"
                />
                {label}
            </label>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4"
            onMouseDown={(event) =>
                event.target === event.currentTarget && !busy && onClose()
            }
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="editor-title"
                className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2
                            id="editor-title"
                            className="font-bold text-slate-900"
                        >
                            {title}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            يتم حفظ البيانات عبر واجهة الـAPI.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="إغلاق"
                        disabled={busy}
                        onClick={onClose}
                        className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <Icon name="close" />
                    </button>
                </header>
                <form onSubmit={onSubmit} className="grid gap-5 p-6">
                    {editor.kind === 'patient' ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {input('full_name', 'الاسم بالكامل', {
                                required: true,
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('phone', 'رقم الهاتف', {
                                required: true,
                                dir: 'ltr',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('email', 'البريد الإلكتروني', {
                                type: 'email',
                                dir: 'ltr',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('date_of_birth', 'تاريخ الميلاد', {
                                type: 'date',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                النوع
                                <select
                                    value={String(editor.values.gender)}
                                    onChange={(event) =>
                                        onChange('gender', event.target.value)
                                    }
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                >
                                    <option value="">غير محدد</option>
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                    <option value="other">أخرى</option>
                                </select>
                                {errors.gender?.[0] && (
                                    <span className="text-xs font-normal text-rose-600">
                                        {errors.gender[0]}
                                    </span>
                                )}
                            </label>
                        </div>
                    ) : editor.kind === 'test' ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {input('code', 'كود التحليل', {
                                required: true,
                                dir: 'ltr',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('name', 'اسم التحليل', {
                                required: true,
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('specimen_type', 'نوع العينة', {
                                required: true,
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('price', 'السعر بالجنيه', {
                                type: 'number',
                                min: '0',
                                step: '0.01',
                                required: true,
                                dir: 'ltr',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input(
                                'turnaround_time_minutes',
                                'مدة الإنجاز بالدقائق',
                                {
                                    type: 'number',
                                    min: '1',
                                    required: true,
                                    dir: 'ltr',
                                    className:
                                        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                                },
                            )}
                            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                                وصف التحليل
                                <textarea
                                    value={String(editor.values.description)}
                                    onChange={(event) =>
                                        onChange(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />
                                {errors.description?.[0] && (
                                    <span className="text-xs font-normal text-rose-600">
                                        {errors.description[0]}
                                    </span>
                                )}
                            </label>
                            {toggle('is_active', 'التحليل نشط ومتاح')}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {input('name', 'اسم الفرع', {
                                required: true,
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('code', 'كود الفرع', {
                                required: true,
                                dir: 'ltr',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('phone', 'رقم الهاتف', {
                                dir: 'ltr',
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {input('address', 'العنوان', {
                                className:
                                    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
                            })}
                            {toggle('is_active', 'الفرع نشط')}
                            {toggle('is_default', 'الفرع الافتراضي')}
                        </div>
                    )}
                    <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={onClose}
                            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="h-11 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                        >
                            {busy ? 'جارٍ الحفظ...' : 'حفظ البيانات'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
