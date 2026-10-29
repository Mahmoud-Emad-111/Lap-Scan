import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { WorkflowEditor } from '@/components/laboratory/workflow-editor';
import {
    displayStatus,
    getValue,
    getValues,
    titles,
    type ApiPage,
    type BranchOption,
    type Editor,
    type OrderItem,
    type PatientOption,
    type ReportData,
    type TestOption,
    type UserRole,
    type Value,
    type WorkflowRow,
    type WorkflowSection,
} from '@/components/laboratory/workflow-types';
import { PageShell, PrimaryButton } from '@/components/laboratory/workflow-ui';
import { WorkflowTable } from '@/components/laboratory/workflow-tables';
import {
    approveWorkflowResult,
    collectWorkflowSample,
    createWorkflowOrder,
    fetchBranchOptions,
    fetchOperationsReport,
    fetchPatientOptions,
    fetchTestOptions,
    fetchWorkflowRows,
    getWorkflowOrdersUrl,
    saveWorkflowResult,
    saveWorkflowUser,
} from '@/modules/laboratory/services/workflowApi';

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

export function isWorkflowSection(section: string): section is WorkflowSection {
    return section in titles;
}

export function workflowSectionTitle(section: WorkflowSection): string {
    return titles[section];
}

export function WorkflowSectionPage({
    section,
    token,
    role,
    currentUserId,
    onNotice,
}: {
    section: WorkflowSection;
    token: string;
    role: UserRole;
    currentUserId: number;
    onNotice: (message: string) => void;
}) {
    const [page, setPage] = useState<ApiPage<WorkflowRow> | null>(null);
    const [report, setReport] = useState<ReportData | null>(null);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [tests, setTests] = useState<TestOption[]>([]);
    const [query, setQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [editor, setEditor] = useState<Editor | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const loadPage = useCallback(
        async (url?: string) => {
            setLoading(true);
            setError('');

            try {
                if (section === 'reports') {
                    setReport(await fetchOperationsReport(token));
                    setPage(null);
                } else {
                    const response = await fetchWorkflowRows(
                        token,
                        section,
                        url,
                    );
                    setPage(response);
                    setReport(null);
                    setQuery('');
                }
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر تحميل بيانات الصفحة.',
                );
            } finally {
                setLoading(false);
            }
        },
        [section, token],
    );

    useEffect(() => {
        void loadPage();
    }, [loadPage]);

    const filteredRows = useMemo(() => {
        const rows = page?.data ?? [];

        if (section !== 'results' || !query) {
            return rows.filter((row) =>
                JSON.stringify(row)
                    .toLocaleLowerCase('ar')
                    .includes(query.toLocaleLowerCase('ar')),
            );
        }

        return rows.filter((order) =>
            order.items?.some((item) =>
                `${order.order_number} ${order.patient?.full_name} ${item.test_name}`
                    .toLocaleLowerCase('ar')
                    .includes(query.toLocaleLowerCase('ar')),
            ),
        );
    }, [page, query, section]);

    async function openUserEditor(user?: WorkflowRow) {
        setBusy(true);
        setErrors({});

        try {
            setBranches(await fetchBranchOptions(token));
            setEditor({
                kind: 'user',
                id: user?.id,
                values: {
                    name: user?.name ?? '',
                    email: user?.email ?? '',
                    password: '',
                    role: user?.role ?? 'lab_staff',
                    branch_ids:
                        user?.branches?.map((branch) => String(branch.id)) ??
                        [],
                },
            });
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل الفروع.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function openOrderEditor() {
        setBusy(true);
        setErrors({});

        try {
            const [patientOptions, branchOptions, testOptions] =
                await Promise.all([
                    fetchPatientOptions(token),
                    fetchBranchOptions(token),
                    fetchTestOptions(token),
                ]);
            setPatients(patientOptions);
            setBranches(branchOptions);
            setTests(testOptions);
            setEditor({
                kind: 'order',
                values: {
                    patient_id: '',
                    branch_id: '',
                    test_ids: [],
                    notes: '',
                },
            });
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل بيانات الطلب.',
            );
        } finally {
            setBusy(false);
        }
    }

    function openResultEditor(item: OrderItem) {
        setErrors({});
        setEditor({
            kind: 'result',
            orderItemId: item.id,
            resultId: item.result?.id,
            values: {
                value: item.result?.value ?? '',
                unit: item.result?.unit ?? '',
                reference_range: item.result?.reference_range ?? '',
                notes: item.result?.notes ?? '',
            },
        });
    }

    function updateValue(key: string, value: Value) {
        setEditor((current) =>
            current
                ? { ...current, values: { ...current.values, [key]: value } }
                : current,
        );
    }

    async function saveEditor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editor) {
            return;
        }

        setBusy(true);
        setErrors({});
        setError('');

        try {
            const values = { ...editor.values };

            if (editor.kind === 'user') {
                const role: UserRole =
                    values.role === 'doctor' ||
                    values.role === 'patient' ||
                    values.role === 'lab_admin'
                        ? values.role
                        : 'lab_staff';
                const payload = {
                    name: getValue(values.name),
                    email: getValue(values.email),
                    role,
                    ...(getValue(values.password)
                        ? { password: getValue(values.password) }
                        : {}),
                    ...(role === 'lab_staff'
                        ? {
                              branch_ids: getValues(values.branch_ids).map(
                                  Number,
                              ),
                          }
                        : {}),
                };

                await saveWorkflowUser(token, editor.id, payload);
            } else if (editor.kind === 'order') {
                await createWorkflowOrder(token, {
                    patient_id: Number(getValue(values.patient_id)),
                    branch_id: Number(getValue(values.branch_id)),
                    test_ids: getValues(values.test_ids).map(Number),
                    notes: getValue(values.notes),
                });
            } else {
                await saveWorkflowResult(token, editor.orderItemId, {
                    value: getValue(values.value),
                    unit: getValue(values.unit),
                    reference_range: getValue(values.reference_range),
                    notes: getValue(values.notes),
                });
            }

            setEditor(null);
            onNotice('تم حفظ البيانات بنجاح.');
            await loadPage();
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setErrors(requestError.validationErrors);
                if (Object.keys(requestError.validationErrors).length === 0) {
                    setError(requestError.message);
                }
            } else {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر حفظ البيانات.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    async function collectSample(sampleId: number) {
        setBusy(true);
        setError('');

        try {
            await collectWorkflowSample(token, sampleId);
            onNotice('تم تسجيل استلام العينة.');
            await loadPage();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحديث العينة.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function approveResult(resultId: number) {
        setBusy(true);
        setError('');

        try {
            await approveWorkflowResult(token, resultId);
            onNotice('تم اعتماد النتيجة ونشرها للمريض.');
            await loadPage();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر اعتماد النتيجة.',
            );
        } finally {
            setBusy(false);
        }
    }

    function renderReport() {
        if (!report) {
            return null;
        }

        const cards = [
            ['إجمالي الطلبات', report.orders_total],
            ['طلبات مكتملة', report.completed_orders],
            ['إجمالي العينات', report.samples_total],
            ['عينات بانتظار الاستلام', report.samples_pending],
            ['نتائج بانتظار الاعتماد', report.results_pending_approval],
            ['نتائج معتمدة', report.results_approved],
        ];

        return (
            <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map(([label, amount]) => (
                        <article
                            key={label}
                            className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.5)]"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-[13px] font-medium text-slate-500">
                                    {label}
                                </h3>
                                <span className="size-2 rounded-full bg-brand-500/70" />
                            </div>
                            <p className="text-3xl leading-tight font-bold tracking-tight text-ink-950">
                                {new Intl.NumberFormat('ar-EG').format(
                                    Number(amount),
                                )}
                            </p>
                        </article>
                    ))}
                </div>
                <article className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.5)] sm:p-6">
                    <h3 className="mb-4 font-bold text-slate-900">
                        الطلبات حسب الحالة
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(report.orders_by_status).map(
                            ([status, amount]) => (
                                <span
                                    key={status}
                                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                                >
                                    {displayStatus(status)}:{' '}
                                    <strong>{amount}</strong>
                                </span>
                            ),
                        )}
                    </div>
                </article>
            </div>
        );
    }

    const canCreateUser = section === 'users' && role === 'lab_admin';
    const canCreateOrder = section === 'orders';
    const addAction =
        canCreateUser || canCreateOrder ? (
            <PrimaryButton
                disabled={busy}
                onClick={() => {
                    if (canCreateUser) {
                        void openUserEditor();
                    } else {
                        void openOrderEditor();
                    }
                }}
            >
                {canCreateUser ? 'إضافة مستخدم' : 'إنشاء طلب'}
            </PrimaryButton>
        ) : undefined;

    return (
        <PageShell
            title={titles[section]}
            description={
                section === 'results'
                    ? 'أدخل النتائج بعد استلام العينات، ثم اعتمدها لنشرها في بوابة المريض.'
                    : section === 'patient-results'
                      ? 'تظهر هنا النتائج التي اعتمدها المختبر فقط.'
                      : 'تعرض البيانات التي يسمح بها دور حسابك من خلال واجهة الـAPI.'
            }
            action={addAction}
        >
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
                >
                    {error}
                </div>
            )}

            {section !== 'reports' && (
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.5)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={`بحث في ${titles[section]}`}
                        className={`${inputClass} sm:max-w-md`}
                    />
                    {section === 'orders' && (
                        <select
                            value={priorityFilter}
                            onChange={(event) => {
                                const value = event.target.value;
                                setPriorityFilter(value);
                                void loadPage(getWorkflowOrdersUrl(value));
                            }}
                            className={`${inputClass} sm:max-w-xs`}
                            aria-label="تصفية حسب الأولوية"
                        >
                            <option value="">كل الأولويات</option>
                            <option value="urgent">الطلبات العاجلة</option>
                            <option value="normal">الطلبات العادية</option>
                        </select>
                    )}
                    <span className="px-1 text-xs font-medium text-slate-500">
                        {page ? `إجمالي ${page.meta.total} سجل` : ''}
                    </span>
                </div>
            )}

            {loading ? (
                <div
                    className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
                    aria-label="جاري التحميل"
                >
                    {[1, 2, 3].map((row) => (
                        <div
                            key={row}
                            className="h-12 animate-pulse rounded-lg bg-slate-100/80"
                        />
                    ))}
                </div>
            ) : section === 'reports' ? (
                renderReport()
            ) : (
                <WorkflowTable
                    section={section}
                    rows={filteredRows}
                    currentUserId={currentUserId}
                    query={query}
                    onEditUser={(user) => void openUserEditor(user)}
                    onCollectSample={(sampleId) => void collectSample(sampleId)}
                    onEditResult={openResultEditor}
                    onApproveResult={(resultId) => void approveResult(resultId)}
                />
            )}

            {page && page.meta.last_page > 1 && (
                <nav className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
                    <button
                        type="button"
                        disabled={!page.links.prev || loading}
                        onClick={() =>
                            page.links.prev && void loadPage(page.links.prev)
                        }
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                        السابق
                    </button>
                    <span className="text-xs text-slate-500">
                        صفحة {page.meta.current_page} من {page.meta.last_page}
                    </span>
                    <button
                        type="button"
                        disabled={!page.links.next || loading}
                        onClick={() =>
                            page.links.next && void loadPage(page.links.next)
                        }
                        className="rounded-lg px-3 py-2 text-sm text-slate-600 disabled:opacity-40"
                    >
                        التالي
                    </button>
                </nav>
            )}

            {editor && (
                <WorkflowEditor
                    editor={editor}
                    branches={branches}
                    patients={patients}
                    tests={tests}
                    errors={errors}
                    busy={busy}
                    onChange={updateValue}
                    onClose={() => setEditor(null)}
                    onSubmit={saveEditor}
                />
            )}
        </PageShell>
    );
}
