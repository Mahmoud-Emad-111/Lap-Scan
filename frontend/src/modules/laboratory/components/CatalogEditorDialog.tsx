import type { FormEvent, InputHTMLAttributes } from 'react';
import { Icon } from '@/components/ui/icon';

export type CatalogEditor = {
    kind: 'patient' | 'test' | 'branch';
    id?: number;
    values: Record<string, string | boolean>;
};

type CatalogEditorDialogProps = {
    editor: CatalogEditor;
    errors: Record<string, string[]>;
    busy: boolean;
    onClose: () => void;
    onChange: (key: string, value: string | boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CatalogEditorDialog({
    editor,
    errors,
    busy,
    onClose,
    onChange,
    onSubmit,
}: CatalogEditorDialogProps) {
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
                className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_35px_100px_-35px_rgba(4,28,25,0.5)]"
            >
                <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
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
                        className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                        <Icon name="close" />
                    </button>
                </header>
                <form onSubmit={onSubmit} className="grid gap-5 p-4 sm:p-6">
                    {editor.kind === 'patient' ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {input('full_name', 'الاسم بالكامل', {
                                required: true,
                            })}
                            {input('phone', 'رقم الهاتف', {
                                required: true,
                                dir: 'ltr',
                            })}
                            {input('email', 'البريد الإلكتروني', {
                                type: 'email',
                                dir: 'ltr',
                            })}
                            {input('date_of_birth', 'تاريخ الميلاد', {
                                type: 'date',
                            })}
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                النوع
                                <select
                                    value={String(editor.values.gender ?? '')}
                                    onChange={(event) =>
                                        onChange('gender', event.target.value)
                                    }
                                    className={inputClass}
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
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                <span className="flex items-center justify-between gap-2">
                                    <span id="test-code-label">
                                        كود التحليل
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange('code', generateTestCode())
                                        }
                                        className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                    >
                                        إنشاء كود تلقائي
                                    </button>
                                </span>
                                <input
                                    aria-labelledby="test-code-label"
                                    dir="ltr"
                                    required
                                    value={String(editor.values.code ?? '')}
                                    onChange={(event) =>
                                        onChange('code', event.target.value)
                                    }
                                    className={inputClass}
                                />
                                {errors.code?.[0] && (
                                    <span className="text-xs font-normal text-rose-600">
                                        {errors.code[0]}
                                    </span>
                                )}
                            </label>
                            {input('name', 'اسم التحليل', { required: true })}
                            {input('specimen_type', 'نوع العينة', {
                                required: true,
                            })}
                            {input('price', 'السعر بالجنيه', {
                                type: 'number',
                                min: '0',
                                step: '0.01',
                                required: true,
                                dir: 'ltr',
                            })}
                            {input(
                                'turnaround_time_minutes',
                                'مدة الإنجاز بالدقائق',
                                {
                                    type: 'number',
                                    min: '1',
                                    required: true,
                                    dir: 'ltr',
                                },
                            )}
                            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                                وصف التحليل
                                <textarea
                                    value={String(
                                        editor.values.description ?? '',
                                    )}
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
                            {input('name', 'اسم الفرع', { required: true })}
                            {input('code', 'كود الفرع', {
                                required: true,
                                dir: 'ltr',
                            })}
                            {input('phone', 'رقم الهاتف', { dir: 'ltr' })}
                            {input('address', 'العنوان')}
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
                            aria-busy={busy}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busy && (
                                <span
                                    aria-hidden="true"
                                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                />
                            )}
                            {busy ? 'جارٍ الحفظ...' : 'حفظ البيانات'}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
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
            <input {...props} className={inputClass} />
            {error && (
                <span className="text-xs font-normal text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function generateTestCode(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const suffix = Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
    )
        .join('')
        .toUpperCase();

    return `LAB-${suffix}`;
}

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50';
