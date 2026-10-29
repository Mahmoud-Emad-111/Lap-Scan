import {
    useEffect,
    useRef,
    useState,
    type DragEvent,
    type FormEvent,
} from 'react';
import {
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
const maxPdfSize = 10 * 1024 * 1024;

export function WorkflowEditor({
    editor,
    branches,
    patients,
    tests,
    errors,
    busy,
    documentPreviewUrl,
    documentError,
    previewingDocument,
    onChange,
    onPdfChange,
    onRemovePdfChange,
    onPreviewDocument,
    onClose,
    onSubmit,
}: {
    editor: Editor;
    branches: BranchOption[];
    patients: PatientOption[];
    tests: TestOption[];
    errors: Record<string, string[]>;
    busy: boolean;
    documentPreviewUrl: string | null;
    documentError: string;
    previewingDocument: boolean;
    onChange: (key: string, value: Value) => void;
    onPdfChange: (pdf: File | null) => void;
    onRemovePdfChange: (removePdf: boolean) => void;
    onPreviewDocument: (resultId: number) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const selectedPdf = editor.kind === 'result' ? editor.pdf : null;
    const [selectedPdfPreviewUrl, setSelectedPdfPreviewUrl] = useState<
        string | null
    >(null);
    const [pdfError, setPdfError] = useState('');

    useEffect(() => {
        if (!selectedPdf) {
            setSelectedPdfPreviewUrl(null);

            return;
        }

        const url = URL.createObjectURL(selectedPdf);
        setSelectedPdfPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedPdf]);

    function choosePdf(file: File | undefined) {
        if (!file) {
            return;
        }

        if (
            !file.name.toLocaleLowerCase().endsWith('.pdf') ||
            (file.type !== '' && file.type !== 'application/pdf')
        ) {
            setPdfError('اختر ملف PDF صالحًا.');
            return;
        }

        if (file.size > maxPdfSize) {
            setPdfError('الحد الأقصى لحجم الملف هو 10 ميجابايت.');
            return;
        }

        setPdfError('');
        onPdfChange(file);
    }

    function handlePdfDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        choosePdf(event.dataTransfer.files[0]);
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
                    required
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
            !editor.removePdf &&
            !editor.pdf
                ? documentPreviewUrl
                : null;
        const previewUrl = selectedPdfPreviewUrl ?? savedPreviewUrl;
        const fileName = editor.pdf?.name ?? editor.documentName;
        const fileSize = editor.pdf?.size ?? editor.documentSize;

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
                            تقرير PDF مرفق
                        </h3>
                        <p className="text-xs leading-5 text-slate-500">
                            يُحفظ الملف بشكل خاص مع المسودة. أدخل قيمة النتيجة
                            يدويًا؛ لا يتم استخراج بيانات من الملف تلقائيًا. الحد
                            الأقصى 10 ميجابايت.
                        </p>
                    </div>

                    {fileName && !editor.removePdf ? (
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
                                {editor.pdf ? (
                                    <button
                                        type="button"
                                        onClick={() => onPdfChange(null)}
                                        className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                                    >
                                        إزالة الملف المختار
                                    </button>
                                ) : (
                                    <>
                                        {editor.hasPdf &&
                                            editor.resultId !== undefined && (
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
                                            )}
                                        {editor.hasPdf && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemovePdfChange(true)
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
                    ) : editor.removePdf ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-sm text-amber-900">
                                ستتم إزالة ملف PDF الحالي عند حفظ المسودة.
                            </p>
                            <button
                                type="button"
                                onClick={() => onRemovePdfChange(false)}
                                className="rounded-lg px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                            >
                                التراجع عن الإزالة
                            </button>
                        </div>
                    ) : (
                        <div
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={handlePdfDrop}
                            className="grid justify-items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center"
                        >
                            <input
                                ref={pdfInputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                className="sr-only"
                                aria-label="اختيار تقرير PDF"
                                onChange={(event) => {
                                    choosePdf(event.target.files?.[0]);
                                    event.currentTarget.value = '';
                                }}
                            />
                            <p className="text-sm text-slate-600">
                                اسحب ملف PDF إلى هنا أو اختره من جهازك.
                            </p>
                            <button
                                type="button"
                                onClick={() => pdfInputRef.current?.click()}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                اختيار ملف PDF
                            </button>
                        </div>
                    )}

                    {(pdfError || errors.pdf?.[0] || documentError) && (
                        <p role="alert" className="text-xs text-rose-600">
                            {pdfError || errors.pdf?.[0] || documentError}
                        </p>
                    )}
                    {errors.remove_pdf?.[0] && (
                        <p role="alert" className="text-xs text-rose-600">
                            {errors.remove_pdf[0]}
                        </p>
                    )}

                    {previewUrl && (
                        <iframe
                            title="معاينة ملف نتيجة PDF"
                            src={previewUrl}
                            className="h-72 w-full rounded-lg border border-slate-200 sm:h-[28rem]"
                        />
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

        return (
            <fieldset className="grid gap-2 sm:col-span-2">
                <legend className="text-sm font-medium text-slate-700">
                    التحاليل المطلوبة
                </legend>
                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
                    {tests.map((test) => (
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
                                    {test.price}
                                </span>
                            </span>
                        </label>
                    ))}
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
            return (
                <div className="grid gap-4 sm:grid-cols-2">
                    {select(
                        'patient_id',
                        'المريض',
                        patients.map((patient) => ({
                            value: String(patient.id),
                            label: `${patient.full_name} — ${patient.phone}`,
                        })),
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
                className={`my-auto w-full ${editor.kind === 'result' ? 'max-w-3xl' : 'max-w-2xl'} max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-white/70 bg-white shadow-[0_35px_100px_-35px_rgba(4,28,25,0.5)] sm:max-h-[calc(100dvh-2rem)]`}
            >
                <header className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
                    <h2
                        id="workflow-editor-title"
                        className="font-bold text-slate-900"
                    >
                        {title}
                    </h2>
                </header>
                <form onSubmit={onSubmit} className="grid gap-5 p-4 sm:p-6">
                    {fields()}
                    {errors.role?.[0] && (
                        <p className="text-xs text-rose-600">
                            {errors.role[0]}
                        </p>
                    )}
                    <footer className="flex justify-end gap-3">
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
