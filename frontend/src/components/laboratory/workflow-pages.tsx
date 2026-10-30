import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { WorkflowEditor } from '@/components/laboratory/workflow-editor';
import { OrderDetailsDialog } from '@/components/laboratory/order-details-dialog';
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
    downloadWorkflowResultDocument,
    fetchBranchOptions,
    fetchOperationsReport,
    fetchPatientOptions,
    fetchTestOptions,
    fetchWorkflowResultDocument,
    fetchWorkflowRows,
    getWorkflowOrdersUrl,
    type WorkflowOrderPayload,
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
    orderRealtimeRevision,
    initialOrderSearch,
}: {
    section: WorkflowSection;
    token: string;
    role: UserRole;
    currentUserId: number;
    onNotice: (message: string) => void;
    orderRealtimeRevision: number;
    initialOrderSearch?: string;
}) {
    const [page, setPage] = useState<ApiPage<WorkflowRow> | null>(null);
    const [report, setReport] = useState<ReportData | null>(null);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [tests, setTests] = useState<TestOption[]>([]);
    const [query, setQuery] = useState(initialOrderSearch ?? '');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [sampleStatusFilter, setSampleStatusFilter] = useState('');
    const [editor, setEditor] = useState<Editor | null>(null);
    const [orderToView, setOrderToView] = useState<WorkflowRow | null>(null);
    const [documentPreview, setDocumentPreview] = useState<{
        resultId: number;
        url: string;
        type: string;
    } | null>(null);
    const [previewingDocumentId, setPreviewingDocumentId] = useState<
        number | null
    >(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [documentError, setDocumentError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const lastRequestedUrl = useRef<string | undefined>(undefined);
    const lastHandledRealtimeRevision = useRef(orderRealtimeRevision);

    useEffect(() => {
        return () => {
            if (documentPreview) {
                URL.revokeObjectURL(documentPreview.url);
            }
        };
    }, [documentPreview]);

    useEffect(() => {
        if (section !== 'orders') {
            return;
        }

        let cancelled = false;

        async function loadBranches() {
            try {
                const branchOptions = await fetchBranchOptions(token);

                if (!cancelled) {
                    setBranches(branchOptions);
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'تعذّر تحميل قائمة الفروع.',
                    );
                }
            }
        }

        void loadBranches();

        return () => {
            cancelled = true;
        };
    }, [section, token]);

    const loadPage = useCallback(
        async (url?: string) => {
            lastRequestedUrl.current = url;
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
        setQuery(initialOrderSearch ?? '');

        if (section === 'orders' && initialOrderSearch) {
            setPriorityFilter('');
            setOrderStatusFilter('');
            setBranchFilter('');
            setDateFromFilter('');
            setDateToFilter('');
        }

        void loadPage(
            section === 'orders' && initialOrderSearch
                ? getWorkflowOrdersUrl({ search: initialOrderSearch })
                : undefined,
        );
    }, [initialOrderSearch, loadPage, section]);

    useEffect(() => {
        if (
            section === 'orders' &&
            lastHandledRealtimeRevision.current !== orderRealtimeRevision
        ) {
            lastHandledRealtimeRevision.current = orderRealtimeRevision;
            void loadPage(lastRequestedUrl.current);
        } else if (section !== 'orders') {
            lastHandledRealtimeRevision.current = orderRealtimeRevision;
        }
    }, [loadPage, orderRealtimeRevision, section]);

    const filteredRows = useMemo(() => {
        let rows = page?.data ?? [];

        if (query && section === 'results') {
            rows = rows.filter((order) =>
                order.items?.some((item) =>
                    `${order.order_number} ${order.patient?.full_name} ${item.test_name}`
                        .toLocaleLowerCase('ar')
                        .includes(query.toLocaleLowerCase('ar')),
                ),
            );
        } else if (query && section !== 'orders') {
            rows = rows.filter((row) =>
                JSON.stringify(row)
                    .toLocaleLowerCase('ar')
                    .includes(query.toLocaleLowerCase('ar')),
            );
        }

        if (section === 'samples' && sampleStatusFilter) {
            rows = rows.filter((row) => row.status === sampleStatusFilter);
        }

        return rows;
    }, [page, query, sampleStatusFilter, section]);

    const searchPatients = useCallback(
        (search: string) => fetchPatientOptions(token, search),
        [token],
    );

    function orderFilters() {
        return {
            ...(query.trim() ? { search: query.trim() } : {}),
            ...(orderStatusFilter ? { status: orderStatusFilter } : {}),
            ...(priorityFilter ? { priority: priorityFilter } : {}),
            ...(branchFilter ? { branch_id: branchFilter } : {}),
            ...(dateFromFilter ? { from: dateFromFilter } : {}),
            ...(dateToFilter ? { to: dateToFilter } : {}),
        };
    }

    function applyOrderFilters() {
        void loadPage(getWorkflowOrdersUrl(orderFilters()));
    }

    function clearOrderFilters() {
        setQuery('');
        setOrderStatusFilter('');
        setBranchFilter('');
        setPriorityFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        void loadPage(getWorkflowOrdersUrl());
    }

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
                    patient_mode: 'existing',
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

    function openResultEditor(item: OrderItem, order: WorkflowRow) {
        setErrors({});
        setDocumentError('');
        setDocumentPreview(null);
        setEditor({
            kind: 'result',
            orderItemId: item.id,
            resultId: item.result?.id,
            context: {
                orderNumber: order.order_number,
                patientName: order.patient?.full_name,
                branchName: order.branch?.name,
                testName: item.test_name,
                specimenType: item.specimen_type,
                sampleBarcode: item.sample?.barcode,
                priority: order.priority,
            },
            hasDocument: item.result?.has_document ?? false,
            documentType: item.result?.document_type ?? null,
            documentName: item.result?.document_name ?? null,
            documentSize: item.result?.document_size ?? null,
            document: null,
            removeDocument: false,
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

    function updateResultDocument(document: File | null) {
        setEditor((current) =>
            current?.kind === 'result'
                ? { ...current, document, removeDocument: false }
                : current,
        );
    }

    function toggleResultDocumentRemoval(removeDocument: boolean) {
        setEditor((current) =>
            current?.kind === 'result'
                ? { ...current, removeDocument, document: null }
                : current,
        );
    }

    async function previewResultDocument(resultId: number) {
        setPreviewingDocumentId(resultId);
        setDocumentError('');
        setError('');

        try {
            const document = await fetchWorkflowResultDocument(token, resultId);
            const url = URL.createObjectURL(document);
            setDocumentPreview({ resultId, url, type: document.type });
        } catch (requestError) {
            setDocumentError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّرت معاينة المرفق.',
            );
        } finally {
            setPreviewingDocumentId(null);
        }
    }

    async function downloadResultDocument(resultId: number) {
        setError('');

        try {
            await downloadWorkflowResultDocument(token, resultId);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تنزيل ملف PDF.',
            );
        }
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
                const isNewPatient = getValue(values.patient_mode) === 'new';
                const patientDetails: Pick<
                    WorkflowOrderPayload,
                    | 'patient_id'
                    | 'patient_full_name'
                    | 'patient_phone'
                    | 'patient_email'
                    | 'patient_date_of_birth'
                    | 'patient_gender'
                > = isNewPatient
                    ? {
                          patient_full_name: getValue(values.patient_full_name),
                          patient_phone: getValue(values.patient_phone),
                          patient_email:
                              getValue(values.patient_email) || undefined,
                          patient_date_of_birth:
                              getValue(values.patient_date_of_birth) ||
                              undefined,
                          patient_gender:
                              getValue(values.patient_gender) || undefined,
                      }
                    : {
                          patient_id: Number(getValue(values.patient_id)),
                      };

                await createWorkflowOrder(token, {
                    ...patientDetails,
                    branch_id: Number(getValue(values.branch_id)),
                    test_ids: getValues(values.test_ids).map(Number),
                    notes: getValue(values.notes),
                });
            } else {
                await saveWorkflowResult(
                    token,
                    editor.orderItemId,
                    {
                        value: getValue(values.value),
                        unit: getValue(values.unit),
                        reference_range: getValue(values.reference_range),
                        notes: getValue(values.notes),
                    },
                    editor.document,
                    editor.removeDocument,
                );
            }

            setEditor(null);
            setDocumentPreview(null);
            setDocumentError('');
            onNotice(
                editor.kind === 'result' &&
                    (editor.document || editor.removeDocument)
                    ? 'تم حفظ المسودة وتحديث مرفق النتيجة.'
                    : 'تم حفظ البيانات بنجاح.',
            );
            await loadPage(
                section === 'orders'
                    ? getWorkflowOrdersUrl(orderFilters())
                    : undefined,
            );
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
    const canCreateOrder = section === 'orders' || section === 'results';
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
                {canCreateUser
                    ? 'إضافة مستخدم'
                    : section === 'results'
                      ? 'إنشاء طلب تحليل'
                      : 'إنشاء طلب'}
            </PrimaryButton>
        ) : undefined;

    return (
        <PageShell
            title={titles[section]}
            description={
                section === 'results'
                    ? 'لإضافة نتيجة جديدة، أنشئ طلب تحليل ثم سجّل استلام عينته. بعدها يمكنك إدخال القيمة يدويًا وإرفاق تقرير PDF أو صورة للمراجعة.'
                    : section === 'samples'
                      ? 'راجع العينات المسجلة، وتابع حالتها، وسجّل استلامها عند وصولها إلى المختبر.'
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

            {section === 'results' && (
                <aside
                    aria-label="خطوات إدخال نتيجة جديدة"
                    className="grid gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900 sm:grid-cols-[auto_1fr]"
                >
                    <span className="font-semibold">طريقة العمل</span>
                    <p>
                        أنشئ طلب تحليل جديدًا، ثم سجّل استلام العينة من الجدول.
                        سيظهر بعدها زر <strong>إدخال نتيجة</strong> لكتابة
                        النتيجة يدويًا أو إرفاق PDF أو صورة. النتائج المعتمدة
                        للعرض فقط ولا يمكن تعديلها.
                    </p>
                </aside>
            )}

            {section !== 'reports' && (
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div
                        className={`flex min-w-0 flex-1 flex-col gap-3 ${
                            section === 'orders'
                                ? 'sm:grid sm:grid-cols-2 lg:grid-cols-3'
                                : 'sm:flex-row sm:items-center'
                        }`}
                    >
                        <div className="relative min-w-0 flex-1">
                            <label
                                htmlFor="workflow-search"
                                className="sr-only"
                            >
                                {section === 'samples'
                                    ? 'البحث في العينات'
                                    : `بحث في ${titles[section]}`}
                            </label>
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                            <input
                                id="workflow-search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        section === 'orders' &&
                                        event.key === 'Enter'
                                    ) {
                                        event.preventDefault();
                                        applyOrderFilters();
                                    }
                                }}
                                placeholder={
                                    section === 'samples'
                                        ? 'ابحث بالباركود أو المريض أو التحليل'
                                        : `بحث في ${titles[section]}`
                                }
                                className={`${inputClass} pr-10 ${section === 'orders' ? '' : 'sm:max-w-md'}`}
                            />
                        </div>
                        {section === 'samples' && (
                            <select
                                value={sampleStatusFilter}
                                onChange={(event) =>
                                    setSampleStatusFilter(event.target.value)
                                }
                                className={`${inputClass} sm:w-52`}
                                aria-label="تصفية العينات حسب الحالة"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="pending_collection">
                                    بانتظار الاستلام
                                </option>
                                <option value="collected">تم الاستلام</option>
                            </select>
                        )}
                        {section === 'orders' && (
                            <select
                                value={priorityFilter}
                                onChange={(event) =>
                                    setPriorityFilter(event.target.value)
                                }
                                className={`${inputClass} sm:max-w-xs`}
                                aria-label="تصفية حسب الأولوية"
                            >
                                <option value="">كل الأولويات</option>
                                <option value="urgent">الطلبات العاجلة</option>
                                <option value="normal">الطلبات العادية</option>
                            </select>
                        )}
                        {section === 'orders' && (
                            <>
                                <select
                                    value={branchFilter}
                                    onChange={(event) =>
                                        setBranchFilter(event.target.value)
                                    }
                                    className={inputClass}
                                    aria-label="تصفية حسب الفرع"
                                >
                                    <option value="">كل الفروع</option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={orderStatusFilter}
                                    onChange={(event) =>
                                        setOrderStatusFilter(event.target.value)
                                    }
                                    className={`${inputClass} sm:w-48`}
                                    aria-label="تصفية حسب حالة الطلب"
                                >
                                    <option value="">كل الحالات</option>
                                    <option value="registered">مسجل</option>
                                    <option value="processing">
                                        قيد التنفيذ
                                    </option>
                                    <option value="completed">مكتمل</option>
                                    <option value="cancelled">ملغي</option>
                                </select>
                                <label className="grid gap-1 text-xs text-slate-500">
                                    من تاريخ
                                    <input
                                        type="date"
                                        value={dateFromFilter}
                                        onChange={(event) =>
                                            setDateFromFilter(
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </label>
                                <label className="grid gap-1 text-xs text-slate-500">
                                    إلى تاريخ
                                    <input
                                        type="date"
                                        value={dateToFilter}
                                        min={dateFromFilter || undefined}
                                        onChange={(event) =>
                                            setDateToFilter(event.target.value)
                                        }
                                        className={inputClass}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={applyOrderFilters}
                                    className="hover:bg-brand-800 h-11 shrink-0 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                                >
                                    تطبيق الفلاتر
                                </button>
                                {(query ||
                                    orderStatusFilter ||
                                    priorityFilter ||
                                    branchFilter ||
                                    dateFromFilter ||
                                    dateToFilter) && (
                                    <button
                                        type="button"
                                        onClick={clearOrderFilters}
                                        className="h-11 shrink-0 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                                    >
                                        مسح الفلاتر
                                    </button>
                                )}
                            </>
                        )}
                        {section === 'samples' &&
                            (query || sampleStatusFilter) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setSampleStatusFilter('');
                                    }}
                                    className="h-11 shrink-0 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                                >
                                    مسح التصفية
                                </button>
                            )}
                    </div>
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
                    onViewOrder={setOrderToView}
                    onEditUser={(user) => void openUserEditor(user)}
                    onCollectSample={(sampleId) => void collectSample(sampleId)}
                    onEditResult={openResultEditor}
                    onApproveResult={(resultId) => void approveResult(resultId)}
                    onDownloadResultDocument={(resultId) =>
                        void downloadResultDocument(resultId)
                    }
                />
            )}

            {orderToView && (
                <OrderDetailsDialog
                    order={orderToView}
                    onClose={() => setOrderToView(null)}
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
                    onSearchPatients={searchPatients}
                    tests={tests}
                    errors={errors}
                    busy={busy}
                    documentPreviewUrl={
                        editor.kind === 'result' &&
                        documentPreview?.resultId === editor.resultId
                            ? (documentPreview?.url ?? null)
                            : null
                    }
                    documentPreviewType={
                        editor.kind === 'result' &&
                        documentPreview?.resultId === editor.resultId
                            ? (documentPreview?.type ?? '')
                            : ''
                    }
                    documentError={documentError}
                    previewingDocument={
                        editor.kind === 'result' &&
                        previewingDocumentId === editor.resultId
                    }
                    onChange={updateValue}
                    onDocumentChange={updateResultDocument}
                    onRemoveDocumentChange={toggleResultDocumentRemoval}
                    onPreviewDocument={previewResultDocument}
                    onClose={() => {
                        setEditor(null);
                        setDocumentPreview(null);
                        setDocumentError('');
                    }}
                    onSubmit={saveEditor}
                />
            )}
        </PageShell>
    );
}
