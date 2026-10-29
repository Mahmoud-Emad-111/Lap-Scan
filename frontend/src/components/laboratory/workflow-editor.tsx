import type { FormEvent } from 'react';
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

export function WorkflowEditor({
    editor,
    branches,
    patients,
    tests,
    errors,
    busy,
    onChange,
    onClose,
    onSubmit,
}: {
    editor: Editor;
    branches: BranchOption[];
    patients: PatientOption[];
    tests: TestOption[];
    errors: Record<string, string[]>;
    busy: boolean;
    onChange: (key: string, value: Value) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    function input(
        key: string,
        label: string,
        options: {
            type?: string;
            required?: boolean;
            dir?: 'ltr' | 'rtl';
            min?: string;
        } = {},
    ) {
        return (
            <label
                key={key}
                className="grid gap-2 text-sm font-medium text-slate-700"
            >
                {label}
                <input
                    type={options.type ?? 'text'}
                    required={options.required}
                    min={options.min}
                    dir={options.dir}
                    value={getValue(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.value)}
                    className={inputClass}
                />
                {errors[key]?.[0] && (
                    <span className="text-xs font-normal text-rose-600">
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
        return (
            <label
                key={key}
                className="grid gap-2 text-sm font-medium text-slate-700"
            >
                {label}
                <select
                    required
                    value={getValue(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.value)}
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
                    <span className="text-xs font-normal text-rose-600">
                        {errors[key][0]}
                    </span>
                )}
            </label>
        );
    }

    function notesField(key: string, label: string) {
        return (
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                {label}
                <textarea
                    rows={3}
                    value={getValue(editor.values[key])}
                    onChange={(event) => onChange(key, event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal transition outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                />
                {errors[key]?.[0] && (
                    <span className="text-xs font-normal text-rose-600">
                        {errors[key][0]}
                    </span>
                )}
            </label>
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

        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {input('value', 'النتيجة', { required: true })}
                {input('unit', 'الوحدة')}
                {input('reference_range', 'النطاق المرجعي')}
                {notesField('notes', 'ملاحظات داخلية')}
                <p className="text-xs leading-5 text-amber-700 sm:col-span-2">
                    النتيجة تحفظ كمسودة، ولا تظهر للمريض إلا بعد اعتمادها.
                </p>
            </div>
        );
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
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
            <section
                role="dialog"
                aria-modal="true"
                className="my-auto w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_35px_100px_-35px_rgba(4,28,25,0.5)]"
            >
                <header className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
                    <h2 className="font-bold text-slate-900">{title}</h2>
                </header>
                <form onSubmit={onSubmit} className="grid gap-5 p-6">
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
