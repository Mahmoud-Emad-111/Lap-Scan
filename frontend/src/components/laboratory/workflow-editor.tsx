import {
    useEffect,
    useRef,
    useState,
    type DragEvent,
    type FormEvent,
} from 'react';
import {
    formatPrice,
    getValue,
    getValues,
    roleLabels,
    type BranchOption,
    type Editor,
    type PatientOption,
    type TestOption,
    type UserRole,
    type Value,
} from '@/components/laboratory/workflow-types';
import { PrimaryButton } from '@/components/laboratory/workflow-ui';

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';
const maxDocumentSize = 10 * 1024 * 1024;
const documentMimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

export function WorkflowEditor({
    editor,
    branches,
    patients,
    onSearchPatients,
    tests,
    errors,
    busy,
    documentPreviewUrl,
    documentPreviewType,
    documentError,
    previewingDocument,
    onChange,
    onDocumentChange,
    onRemoveDocumentChange,
    onPreviewDocument,
    onClose,
    onSubmit,
}: {
    editor: Editor;
    branches: BranchOption[];
    patients: PatientOption[];
    onSearchPatients: (search: string) => Promise<PatientOption[]>;
    tests: TestOption[];
    errors: Record<string, string[]>;
    busy: boolean;
    documentPreviewUrl: string | null;
    documentPreviewType: string;
    documentError: string;
    previewingDocument: boolean;
    onChange: (key: string, value: Value) => void;
    onDocumentChange: (document: File | null) => void;
    onRemoveDocumentChange: (removeDocument: boolean) => void;
    onPreviewDocument: (resultId: number) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    const documentInputRef = useRef<HTMLInputElement>(null);
    const selectedDocument = editor.kind === 'result' ? editor.document : null;
    const [selectedDocumentPreviewUrl, setSelectedDocumentPreviewUrl] = useState<
        string | null
    >(null);
    const [documentValidationError, setDocumentValidationError] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [patientSearchResults, setPatientSearchResults] = useState<
        PatientOption[]
    >([]);
    const [patientSearchBusy, setPatientSearchBusy] = useState(false);
    const [patientSearchError, setPatientSearchError] = useState('');
    const [testSearch, setTestSearch] = useState('');

    useEffect(() => {
        if (editor.kind !== 'order' || patientSearch.trim().length < 2) {
            setPatientSearchResults([]);
            setPatientSearchError('');
            setPatientSearchBusy(false);
            return;
        }

        let cancelled = false;
        const search = patientSearch.trim();
        const timeout = window.setTimeout(() => {
            setPatientSearchBusy(true);
            setPatientSearchError('');
            void onSearchPatients(search)
                .then((results) => {
                    if (!cancelled) {
                        setPatientSearchResults(results);
                    }
                })
                .catch((requestError: unknown) => {
                    if (!cancelled) {
                        setPatientSearchError(
                            requestError instanceof Error
                                ? requestError.message
                                : 'تعذّر البحث عن المريض.',
                        );
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setPatientSearchBusy(false);
                    }
                });
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [editor.kind, onSearchPatients, patientSearch]);

    useEffect(() => {
        setPatientSearch('');
        setTestSearch('');
        setPatientSearchResults([]);
    }, [editor.kind]);

    useEffect(() => {
        if (!selectedDocument) {
            setSelectedDocumentPreviewUrl(null);

            return;
        }

        const url = URL.createObjectURL(selectedDocument);
        setSelectedDocumentPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedDocument]);

    function chooseDocument(file: File | undefined) {
        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLocaleLowerCase() ?? '';
        const expectedMimeType = documentMimeTypes[extension];
        if (
            !expectedMimeType ||
            (file.type !== '' && file.type !== expectedMimeType)
        ) {
            setDocumentValidationError(
                'اختر ملف PDF أو صورة بصيغة JPG أو PNG أو WebP.',
            );
            return;
        }

        if (file.size > maxDocumentSize) {
            setDocumentValidationError('الحد الأقصى لحجم الملف هو 10 ميجابايت.');
            return;
        }

        setDocumentValidationError('');
        onDocumentChange(file);
    }

    function handleDocumentDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        chooseDocument(event.dataTransfer.files[0]);
    }

    function formatFileSize(size: number): string {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(1)} ميجابايت`;
        }

        return `${Math.max(1, Math.round(size / 1024))} كيلوبايت`;
    }

    function input(
        key: string,
        label: string,
        options: {
            type?: string;
            required?: boolean;
            dir?: 'ltr' | 'rtl';
            min?: string;
            maxLength?: number;
        } = {},
    ) {
        const errorId = `${key}-error`;

        return (
            <label
                key={key}
                className="grid gap-2 text-sm font-medium text-slate-700"
            >
                {label}
                <input
                    id={key}
                    type={options.type ?? 'text'}
                    required={options.required}
                    min={options.min}
                    maxLength={options.maxLength}
                    dir={options.dir}
                    value={getValue(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.value)}
                    aria-invalid={Boolean(errors[key]?.[0])}
                    aria-describedby={errors[key]?.[0] ? errorId : undefined}
                    className={inputClass}
                />
                {errors[key]?.[0] && (
                    <span
                        id={errorId}
                        role="alert"
                        className="text-xs font-normal text-rose-600"
                    >
                        {errors[key][0]}
                    </span>
                )}
            </label>
        );
    }

    function select(
        key: string,
        label: string,
        options: Array<{ value: string; label: string }>,
        settings: { required?: boolean } = {},
    ) {
        const errorId = `${key}-error`;

        return (
            <label
                key={key}
                className="grid gap-2 text-sm font-medium text-slate-700"
            >
                {label}
                <select
                    id={key}
                    required={settings.required ?? true}
                    value={getValue(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.value)}
                    aria-invalid={Boolean(errors[key]?.[0])}
                    aria-describedby={errors[key]?.[0] ? errorId : undefined}
                    className={inputClass}
                >
                    <option value="">اختر</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {errors[key]?.[0] && (
                    <span
                        id={errorId}
                        role="alert"
                        className="text-xs font-normal text-rose-600"
                    >
                        {errors[key][0]}
                    </span>
                )}
            </label>
        );
    }

    function notesField(key: string, label: string, maxLength?: number) {
        const errorId = `${key}-error`;

        return (
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                {label}
                <textarea
                    id={key}
                    rows={3}
                    maxLength={maxLength}
                    value={getValue(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.value)}
                    aria-invalid={Boolean(errors[key]?.[0])}
                    aria-describedby={errors[key]?.[0] ? errorId : undefined}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal transition outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                />
                {errors[key]?.[0] && (
                    <span
                        id={errorId}
                        role="alert"
                        className="text-xs font-normal text-rose-600"
                    >
                        {errors[key][0]}
                    </span>
                )}
            </label>
        );
    }

    function resultFields() {
        if (editor.kind !== 'result') {
            return null;
        }

        const context = editor.context;
        const savedPreviewUrl =
            editor.resultId !== undefined &&
            documentPreviewUrl &&
            !editor.removeDocument &&
            !editor.document
                ? documentPreviewUrl
                : null;
        const previewUrl = selectedDocumentPreviewUrl ?? savedPreviewUrl;
        const previewType =
            selectedDocument?.type ||
            documentPreviewType ||
            (editor.documentType === 'pdf' ? 'application/pdf' : '');
        const fileName = editor.document?.name ?? editor.documentName;
        const fileSize = editor.document?.size ?? editor.documentSize;

        return (
            <div className="grid gap-5">
                <section
                    aria-label="بيانات الطلب والتحليل"
                    className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {[
                        ['المريض', context.patientName],
                        ['رقم الطلب', context.orderNumber],
                        ['التحليل', context.testName],
                        ['نوع العينة', context.specimenType],
                        ['الفرع', context.branchName],
                        ['باركود العينة', context.sampleBarcode],
                    ].map(([label, value]) => (
                        <div key={label} className="grid gap-1">
                            <span className="text-xs text-slate-500">
                                {label}
                            </span>
                            <span
                                dir={
                                    label === 'باركود العينة'
                                        ? 'ltr'
                                        : undefined
                                }
                                className="text-sm font-semibold text-slate-800"
                            >
                                {value || '—'}
                            </span>
                        </div>
                    ))}
                    {context.priority === 'urgent' && (
                        <span className="w-fit rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
                            طلب عاجل
                        </span>
                    )}
                </section>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                        قيمة النتيجة
                        <textarea
                            id="value"
                            rows={3}
                            maxLength={10000}
                            required
                            value={getValue(editor.values.value)}
                            onChange={(event) =>
                                onChange('value', event.target.value)
                            }
                            aria-invalid={Boolean(errors.value?.[0])}
                            aria-describedby={
                                errors.value?.[0] ? 'value-error' : undefined
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                        />
                        <span className="text-xs font-normal text-slate-500">
                            أدخل القيمة أو النص كما ورد في التقرير المعتمد.
                        </span>
                        {errors.value?.[0] && (
                            <span
                                id="value-error"
                                role="alert"
                                className="text-xs font-normal text-rose-600"
                            >
                                {errors.value[0]}
                            </span>
                        )}
                    </label>
                    {input('unit', 'الوحدة', { maxLength: 50 })}
                    {input('reference_range', 'النطاق المرجعي', {
                        maxLength: 255,
                    })}
                    {notesField('notes', 'ملاحظات داخلية', 2000)}
                </div>

                <section className="grid gap-3 rounded-xl border border-slate-200 p-4">
                    <div className="grid gap-1">
                        <h3 className="text-sm font-semibold text-slate-800">
                            مرفق نتيجة (PDF أو صورة)
                        </h3>
                        <p className="text-xs leading-5 text-slate-500">
                            يُحفظ الملف بشكل خاص مع المسودة. أدخل قيمة النتيجة
                            يدويًا؛ لا يتم استخراج بيانات من الملف تلقائيًا. الحد
                            الأقصى 10 ميجابايت.
                        </p>
                    </div>
                    <input
                        ref={documentInputRef}
                        type="file"
                        accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp"
                        className="sr-only"
                        aria-label="اختيار مرفق PDF أو صورة للنتيجة"
                        onChange={(event) => {
                            chooseDocument(event.target.files?.[0]);
                            event.currentTarget.value = '';
                        }}
                    />

                    {fileName && !editor.removeDocument ? (
                        <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="grid gap-1">
                                <span
                                    className="text-sm font-medium break-all text-slate-800"
                                    dir="auto"
                                >
                                    {fileName}
                                </span>
                                {fileSize !== null &&
                                    fileSize !== undefined && (
                                        <span className="text-xs text-slate-500">
                                            {formatFileSize(fileSize)}
                                        </span>
                                    )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {editor.document ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                documentInputRef.current?.click()
                                            }
                                            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                                        >
                                            اختيار ملف بديل
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDocumentChange(null)
                                            }
                                            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                                        >
                                            إزالة الملف المختار
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {editor.hasDocument &&
                                            editor.resultId !== undefined && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            busy ||
                                                            previewingDocument
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                editor.resultId !==
                                                                undefined
                                                            ) {
                                                                onPreviewDocument(
                                                                    editor.resultId,
                                                                );
                                                            }
                                                        }}
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                                    >
                                                        {previewingDocument
                                                            ? 'جارٍ تحميل المعاينة...'
                                                            : 'معاينة الملف'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            documentInputRef.current?.click()
                                                        }
                                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                                                    >
                                                        استبدال المرفق
                                                    </button>
                                                </>
                                            )}
                                        {editor.hasDocument && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemoveDocumentChange(true)
                                                }
                                                className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                            >
                                                إزالة المرفق عند الحفظ
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : editor.removeDocument ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm text-amber-900">
                                ستتم إزالة المرفق الحالي عند حفظ المسودة.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        documentInputRef.current?.click()
                                    }
                                    className="rounded-lg px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                                >
                                    اختيار مرفق بديل
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveDocumentChange(false)
                                    }
                                    className="rounded-lg px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                                >
                                    التراجع عن الإزالة
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={handleDocumentDrop}
                            className="grid justify-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center"
                        >
                            <p className="text-sm text-slate-600">
                                اسحب ملف PDF أو صورة إلى هنا، أو اختر ملفًا من جهازك.
                            </p>
                            <button
                                type="button"
                                onClick={() => documentInputRef.current?.click()}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                اختيار ملف
                            </button>
                        </div>
                    )}

                    {(documentValidationError ||
                        errors.document?.[0] ||
                        errors.pdf?.[0] ||
                        documentError) && (
                        <p role="alert" className="text-xs text-rose-600">
                            {documentValidationError ||
                                errors.document?.[0] ||
                                errors.pdf?.[0] ||
                                documentError}
                        </p>
                    )}
                    {(errors.remove_document?.[0] || errors.remove_pdf?.[0]) && (
                        <p role="alert" className="text-xs text-rose-600">
                            {(errors.remove_document ?? errors.remove_pdf)?.[0]}
                        </p>
                    )}

                    {previewUrl && (
                        previewType.startsWith('image/') ? (
                            <img
                                alt="معاينة صورة النتيجة"
                                src={previewUrl}
                                className="max-h-[28rem] w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
                            />
                        ) : (
                            <iframe
                                title="معاينة ملف نتيجة PDF"
                                src={previewUrl}
                                className="h-72 w-full rounded-lg border border-slate-200 sm:h-[28rem]"
                            />
                        )
                    )}
                </section>

                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    تحفظ النتيجة كمسودة، ولا تظهر للمريض إلا بعد اعتمادها.
                </p>
            </div>
        );
    }

    function branchAssignments() {
        const selected = getValues(editor.values.branch_ids);

        return (
            <fieldset className="grid gap-2 sm:col-span-2">
                <legend className="text-sm font-medium text-slate-700">
                    الفروع المسندة
                </legend>
                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
                    {branches.map((branch) => (
                        <label
                            key={branch.id}
                            className="flex items-center gap-2 text-sm text-slate-600"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(String(branch.id))}
                                onChange={(event) =>
                                    onChange(
                                        'branch_ids',
                                        event.target.checked
                                            ? [...selected, String(branch.id)]
                                            : selected.filter(
                                                  (id) =>
                                                      id !== String(branch.id),
                                              ),
                                    )
                                }
                                className="size-4 accent-brand-600"
                            />
                            {branch.name}
                        </label>
                    ))}
                </div>
                {errors.branch_ids?.[0] && (
                    <span className="text-xs text-rose-600">
                        {errors.branch_ids[0]}
                    </span>
                )}
            </fieldset>
        );
    }

    function testSelection() {
        const selected = getValues(editor.values.test_ids);
        const matchingTests = tests.filter((test) =>
            `${test.name} ${test.code}`
                .toLocaleLowerCase('ar')
                .includes(testSearch.trim().toLocaleLowerCase('ar')),
        );
        const subtotal = tests
            .filter((test) => selected.includes(String(test.id)))
            .reduce(
                (total, test) => total + Math.round(Number(test.price) * 100),
                0,
            );

        return (
            <fieldset className="grid gap-2 sm:col-span-2">
                <legend className="text-sm font-medium text-slate-700">
                    التحاليل المطلوبة
                </legend>
                <label className="grid gap-2">
                    <span className="sr-only">ابحث عن تحليل</span>
                    <input
                        type="search"
                        value={testSearch}
                        onChange={(event) => setTestSearch(event.target.value)}
                        placeholder="ابحث باسم التحليل أو الكود"
                        className={inputClass}
                    />
                </label>
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
                    {matchingTests.map((test) => (
                        <label
                            key={test.id}
                            className="flex items-start gap-2 text-sm text-slate-600"
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(String(test.id))}
                                onChange={(event) =>
                                    onChange(
                                        'test_ids',
                                        event.target.checked
                                            ? [...selected, String(test.id)]
                                            : selected.filter(
                                                  (id) =>
                                                      id !== String(test.id),
                                              ),
                                    )
                                }
                                className="mt-0.5 size-4 accent-brand-600"
                            />
                            <span>
                                {test.name}
                                <span className="mr-2 text-xs text-slate-400">
                                    {formatPrice(test.price)}
                                </span>
                            </span>
                        </label>
                    ))}
                    {matchingTests.length === 0 && (
                        <p className="text-sm text-slate-500 sm:col-span-2">
                            لا توجد تحاليل مطابقة للبحث.
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm">
                    <span className="text-slate-700">
                        التحاليل المختارة: <strong>{selected.length}</strong>
                    </span>
                    <span className="text-brand-800 font-bold">
                        المجموع التقديري:{' '}
                        {formatPrice((subtotal / 100).toFixed(2))}
                    </span>
                    <span className="basis-full text-xs font-normal text-slate-500">
                        السعر النهائي يُعتمد عند حفظ الطلب.
                    </span>
                </div>
                {errors.test_ids?.[0] && (
                    <span className="text-xs text-rose-600">
                        {errors.test_ids[0]}
                    </span>
                )}
            </fieldset>
        );
    }

    function fields() {
        if (editor.kind === 'user') {
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    {input('name', 'الاسم', { required: true })}
                    {input('email', 'البريد الإلكتروني', {
                        type: 'email',
                        required: true,
                        dir: 'ltr',
                    })}
                    {input(
                        'password',
                        editor.id ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور',
                        {
                            type: 'password',
                            required: !editor.id,
                        },
                    )}
                    {select(
                        'role',
                        'الدور',
                        (Object.keys(roleLabels) as UserRole[]).map(
                            (value) => ({
                                value,
                                label: roleLabels[value],
                            }),
                        ),
                    )}
                    {getValue(editor.values.role) === 'lab_staff' &&
                        branchAssignments()}
                </div>
            );
        }

        if (editor.kind === 'order') {
            const isNewPatient = getValue(editor.values.patient_mode) === 'new';
            const matchingPatients =
                patientSearch.trim().length >= 2
                    ? patientSearchResults
                    : patients;

            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    <fieldset className="grid gap-3 sm:col-span-2">
                        <legend className="text-sm font-medium text-slate-700">
                            بيانات المريض
                        </legend>
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['existing', 'اختيار مريض مسجل'],
                                ['new', 'إضافة مريض جديد'],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={
                                        getValue(editor.values.patient_mode) ===
                                        value
                                    }
                                    onClick={() =>
                                        onChange('patient_mode', value)
                                    }
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                        getValue(editor.values.patient_mode) ===
                                        value
                                            ? 'border-brand-300 text-brand-800 bg-brand-50'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    {isNewPatient ? (
                        <>
                            {input('patient_full_name', 'اسم المريض', {
                                required: true,
                            })}
                            {input('patient_phone', 'رقم الهاتف', {
                                required: true,
                                dir: 'ltr',
                            })}
                            {input(
                                'patient_email',
                                'البريد الإلكتروني (اختياري)',
                                {
                                    type: 'email',
                                    dir: 'ltr',
                                },
                            )}
                            {input(
                                'patient_date_of_birth',
                                'تاريخ الميلاد (اختياري)',
                                {
                                    type: 'date',
                                },
                            )}
                            {select(
                                'patient_gender',
                                'الجنس (اختياري)',
                                [
                                    { value: 'male', label: 'ذكر' },
                                    { value: 'female', label: 'أنثى' },
                                    { value: 'other', label: 'آخر' },
                                ],
                                { required: false },
                            )}
                        </>
                    ) : (
                        <div className="grid gap-2 sm:col-span-2">
                            <label
                                htmlFor="patient-search"
                                className="text-sm font-medium text-slate-700"
                            >
                                ابحث بالاسم أو رقم الهاتف
                            </label>
                            <input
                                id="patient-search"
                                type="search"
                                value={patientSearch}
                                onChange={(event) => {
                                    setPatientSearch(event.target.value);
                                    onChange('patient_id', '');
                                }}
                                placeholder="اكتب حرفين على الأقل"
                                className={inputClass}
                            />
                            {patientSearchBusy && (
                                <span
                                    role="status"
                                    className="text-xs text-slate-500"
                                >
                                    جارٍ البحث عن المرضى...
                                </span>
                            )}
                            {patientSearchError && (
                                <span
                                    role="alert"
                                    className="text-xs text-rose-600"
                                >
                                    {patientSearchError}
                                </span>
                            )}
                            {select(
                                'patient_id',
                                'المريض',
                                matchingPatients.map((patient) => ({
                                    value: String(patient.id),
                                    label: `${patient.full_name} — ${patient.phone}`,
                                })),
                            )}
                            {patientSearch.trim().length >= 2 &&
                                !patientSearchBusy &&
                                !patientSearchError &&
                                matchingPatients.length === 0 && (
                                    <p className="text-xs text-slate-500">
                                        لا يوجد مريض مطابق. يمكنك اختيار «إضافة
                                        مريض جديد».
                                    </p>
                                )}
                        </div>
                    )}
                    {select(
                        'branch_id',
                        'الفرع',
                        branches.map((branch) => ({
                            value: String(branch.id),
                            label: branch.name,
                        })),
                    )}
                    {testSelection()}
                    {notesField('notes', 'ملاحظات الطلب')}
                </div>
            );
        }

        return resultFields();
    }

    const title =
        editor.kind === 'user'
            ? editor.id
                ? 'تعديل مستخدم'
                : 'إضافة مستخدم'
            : editor.kind === 'order'
              ? 'إنشاء طلب تحاليل'
              : editor.resultId
                ? 'تعديل مسودة نتيجة'
                : 'إدخال نتيجة';

    return (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm sm:p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="workflow-editor-title"
                className={`my-auto w-full ${editor.kind === 'result' || editor.kind === 'order' ? 'max-w-3xl' : 'max-w-xl'} max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-white/70 bg-white shadow-[0_35px_100px_-35px_rgba(4,28,25,0.5)] sm:max-h-[calc(100dvh-2rem)]`}
            >
                <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
                    <h2
                        id="workflow-editor-title"
                        className="font-bold text-slate-900"
                    >
                        {title}
                    </h2>
                    <button
                        type="button"
                        aria-label="إغلاق"
                        disabled={busy}
                        onClick={onClose}
                        className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="size-5"
                        >
                            <path d="m18 6-12 12M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <form onSubmit={onSubmit} className="grid gap-5 p-4 sm:p-6">
                    {fields()}
                    {errors.role?.[0] && (
                        <p className="text-xs text-rose-600">
                            {errors.role[0]}
                        </p>
                    )}
                    <footer className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={onClose}
                            className="h-10 rounded-xl px-4 text-sm text-slate-600 hover:bg-slate-100"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit" disabled={busy}>
                            {busy ? 'جارٍ الحفظ...' : 'حفظ'}
                        </PrimaryButton>
                    </footer>
                </form>
            </section>
        </div>
    );
}
