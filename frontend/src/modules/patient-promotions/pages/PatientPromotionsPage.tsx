import {
    useCallback,
    useEffect,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';
import { ApiError } from '@/lib/api-client';
import { Icon } from '@/components/ui/icon';
import { useNotifications } from '@/components/ui/notification-provider';
import {
    DataTable,
    PageShell,
    PrimaryButton,
    TableCell,
} from '@/components/laboratory/workflow-ui';
import {
    createPatientPromotion,
    fetchPatientPromotions,
    fetchPromotionTests,
    updatePatientPromotion,
} from '@/modules/patient-promotions/services/patientPromotionsApi';
import type {
    PatientPromotion,
    PatientPromotionKind,
    PatientPromotionPage,
    PatientPromotionPayload,
} from '@/modules/patient-promotions/types';
import type { LabTest } from '@/modules/laboratory/types';

type PromotionForm = {
    id: number | null;
    kind: PatientPromotionKind;
    name: string;
    description: string;
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: string;
    minimumSubtotal: string;
    maximumDiscount: string;
    validFrom: string;
    validUntil: string;
    validityDays: string;
    usageLimit: string;
    perPatientLimit: string;
    testIds: number[];
    isActive: boolean;
};

const EMPTY_FORM: PromotionForm = {
    id: null,
    kind: 'offer',
    name: '',
    description: '',
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumSubtotal: '',
    maximumDiscount: '',
    validFrom: '',
    validUntil: '',
    validityDays: '14',
    usageLimit: '',
    perPatientLimit: '',
    testIds: [],
    isActive: false,
};

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

export function PatientPromotionsPage({ token }: { token: string }) {
    const { showSuccessNotice } = useNotifications();
    const [page, setPage] = useState<PatientPromotionPage | null>(null);
    const [tests, setTests] = useState<LabTest[]>([]);
    const [form, setForm] = useState<PromotionForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const loadPromotions = useCallback(
        async (url?: string) => {
            setLoading(true);
            setError('');

            try {
                const [promotions, activeTests] = await Promise.all([
                    fetchPatientPromotions(token, url),
                    fetchPromotionTests(token),
                ]);
                setPage(promotions);
                setTests(activeTests);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر تحميل العروض والكوبونات.',
                );
            } finally {
                setLoading(false);
            }
        },
        [token],
    );

    useEffect(() => {
        void loadPromotions();
    }, [loadPromotions]);

    function editPromotion(promotion: PatientPromotion) {
        setForm({
            id: promotion.id,
            kind: promotion.kind,
            name: promotion.name,
            description: promotion.description ?? '',
            code: promotion.code ?? '',
            discountType: promotion.discount_type,
            discountValue: promotion.discount_value,
            minimumSubtotal: promotion.minimum_subtotal ?? '',
            maximumDiscount: promotion.maximum_discount ?? '',
            validFrom: promotion.valid_from ?? '',
            validUntil: promotion.valid_until ?? '',
            validityDays: String(promotion.validity_days ?? 14),
            usageLimit:
                promotion.usage_limit === null
                    ? ''
                    : String(promotion.usage_limit),
            perPatientLimit:
                promotion.per_patient_limit === null
                    ? ''
                    : String(promotion.per_patient_limit),
            testIds: promotion.tests.map((test) => test.id),
            isActive: promotion.is_active,
        });
        setErrors({});
    }

    function resetForm() {
        setForm(EMPTY_FORM);
        setErrors({});
    }

    function updateField<Key extends keyof PromotionForm>(
        key: Key,
        value: PromotionForm[Key],
    ) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function toggleTest(testId: number) {
        setForm((current) => ({
            ...current,
            testIds: current.testIds.includes(testId)
                ? current.testIds.filter((id) => id !== testId)
                : [...current.testIds, testId],
        }));
    }

    async function submitPromotion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setError('');

        const payload: PatientPromotionPayload = {
            kind: form.kind,
            name: form.name.trim(),
            description: form.description.trim() || null,
            discount_type: form.discountType,
            discount_value: form.discountValue,
            minimum_subtotal: form.minimumSubtotal || null,
            maximum_discount: form.maximumDiscount || null,
            valid_from: form.validFrom || null,
            valid_until: form.validUntil || null,
            is_active: form.isActive,
            ...(form.kind === 'coupon'
                ? { code: form.code.trim().toUpperCase() }
                : {}),
            ...(form.kind === 'referral_template'
                ? { validity_days: Number(form.validityDays) }
                : {
                      usage_limit: form.usageLimit
                          ? Number(form.usageLimit)
                          : null,
                      per_patient_limit: form.perPatientLimit
                          ? Number(form.perPatientLimit)
                          : null,
                  }),
            ...(form.kind === 'offer' ? { test_ids: form.testIds } : {}),
        };

        try {
            const savedPromotion = form.id
                ? await updatePatientPromotion(token, form.id, payload)
                : await createPatientPromotion(token, payload);
            resetForm();
            showSuccessNotice(
                form.id
                    ? `تم تحديث «${savedPromotion.name}».`
                    : `تم إنشاء «${savedPromotion.name}».`,
            );
            await loadPromotions();
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
                        : 'تعذّر حفظ العرض.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    const promotions = page?.data ?? [];
    const testIdsError =
        errors.test_ids ??
        Object.entries(errors).find(([key]) =>
            key.startsWith('test_ids.'),
        )?.[1];

    return (
        <PageShell
            title="عروض المرضى وكوبوناتهم"
            description="جهّز باقات التحاليل وكوبونات الخصم، وحدد شروط الاستخدام ومكافأة دعوة الأصدقاء."
        >
            {error && (
                <div
                    role="alert"
                    className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => void loadPromotions()}
                        className="font-semibold"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            )}

            <form
                onSubmit={(event) => void submitPromotion(event)}
                className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:p-6"
            >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="grid gap-1">
                        <h3 className="font-bold text-slate-900">
                            {form.id ? 'تعديل عرض أو كوبون' : 'إضافة عرض جديد'}
                        </h3>
                        <p className="text-sm leading-6 text-slate-500">
                            العروض الجديدة بتبدأ غير مفعّلة لحد ما تراجع
                            إعداداتها وتفعّلها.
                        </p>
                    </div>
                    {form.id && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                        >
                            إلغاء التعديل
                        </button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="نوع العرض" error={errors.kind}>
                        <select
                            className={inputClass}
                            value={form.kind}
                            onChange={(event) =>
                                updateField(
                                    'kind',
                                    event.target.value as PatientPromotionKind,
                                )
                            }
                            disabled={busy}
                        >
                            <option value="offer">باقة تحاليل</option>
                            <option value="coupon">كوبون خصم</option>
                            <option value="referral_template">
                                قالب مكافأة دعوة
                            </option>
                        </select>
                    </Field>
                    <Field label="اسم العرض" error={errors.name}>
                        <input
                            className={inputClass}
                            value={form.name}
                            onChange={(event) =>
                                updateField('name', event.target.value)
                            }
                            maxLength={120}
                            required
                            disabled={busy}
                        />
                    </Field>
                    {form.kind === 'coupon' && (
                        <Field label="كود الكوبون" error={errors.code}>
                            <input
                                className={inputClass}
                                value={form.code}
                                onChange={(event) =>
                                    updateField(
                                        'code',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                maxLength={40}
                                required
                                disabled={busy}
                                dir="ltr"
                            />
                        </Field>
                    )}
                    <Field label="نوع الخصم" error={errors.discount_type}>
                        <select
                            className={inputClass}
                            value={form.discountType}
                            onChange={(event) =>
                                updateField(
                                    'discountType',
                                    event.target
                                        .value as PromotionForm['discountType'],
                                )
                            }
                            disabled={busy}
                        >
                            <option value="percentage">نسبة مئوية</option>
                            <option value="fixed_amount">مبلغ ثابت</option>
                        </select>
                    </Field>
                    <Field
                        label={
                            form.discountType === 'percentage'
                                ? 'نسبة الخصم (%)'
                                : 'قيمة الخصم'
                        }
                        error={errors.discount_value}
                    >
                        <input
                            className={inputClass}
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={
                                form.discountType === 'percentage'
                                    ? 100
                                    : undefined
                            }
                            value={form.discountValue}
                            onChange={(event) =>
                                updateField('discountValue', event.target.value)
                            }
                            required
                            disabled={busy}
                        />
                    </Field>
                    <Field
                        label="الحد الأدنى للطلب (اختياري)"
                        error={errors.minimum_subtotal}
                    >
                        <input
                            className={inputClass}
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.minimumSubtotal}
                            onChange={(event) =>
                                updateField(
                                    'minimumSubtotal',
                                    event.target.value,
                                )
                            }
                            disabled={busy}
                        />
                    </Field>
                    <Field
                        label="أقصى قيمة للخصم (اختياري)"
                        error={errors.maximum_discount}
                    >
                        <input
                            className={inputClass}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.maximumDiscount}
                            onChange={(event) =>
                                updateField(
                                    'maximumDiscount',
                                    event.target.value,
                                )
                            }
                            disabled={busy}
                        />
                    </Field>
                    {form.kind === 'coupon' && (
                        <>
                            <Field
                                label="عدد مرات الاستخدام (اختياري)"
                                error={errors.usage_limit}
                            >
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.usageLimit}
                                    onChange={(event) =>
                                        updateField(
                                            'usageLimit',
                                            event.target.value,
                                        )
                                    }
                                    disabled={busy}
                                />
                            </Field>
                            <Field
                                label="الحد لكل مريض (اختياري)"
                                error={errors.per_patient_limit}
                            >
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.perPatientLimit}
                                    onChange={(event) =>
                                        updateField(
                                            'perPatientLimit',
                                            event.target.value,
                                        )
                                    }
                                    disabled={busy}
                                />
                            </Field>
                        </>
                    )}
                    {form.kind === 'referral_template' && (
                        <Field
                            label="صلاحية كوبون المكافأة (بالأيام)"
                            error={errors.validity_days}
                        >
                            <input
                                className={inputClass}
                                type="number"
                                min="1"
                                max="365"
                                step="1"
                                value={form.validityDays}
                                onChange={(event) =>
                                    updateField(
                                        'validityDays',
                                        event.target.value,
                                    )
                                }
                                required
                                disabled={busy}
                            />
                        </Field>
                    )}
                    <Field
                        label="بداية الصلاحية (اختياري)"
                        error={errors.valid_from}
                    >
                        <input
                            className={inputClass}
                            type="date"
                            value={form.validFrom}
                            onChange={(event) =>
                                updateField('validFrom', event.target.value)
                            }
                            disabled={busy}
                        />
                    </Field>
                    <Field
                        label="نهاية الصلاحية (اختياري)"
                        error={errors.valid_until}
                    >
                        <input
                            className={inputClass}
                            type="date"
                            value={form.validUntil}
                            onChange={(event) =>
                                updateField('validUntil', event.target.value)
                            }
                            disabled={busy}
                        />
                    </Field>
                </div>

                <Field label="وصف مختصر (اختياري)" error={errors.description}>
                    <textarea
                        className={`${inputClass} h-auto min-h-20 py-3`}
                        value={form.description}
                        onChange={(event) =>
                            updateField('description', event.target.value)
                        }
                        maxLength={2000}
                        disabled={busy}
                    />
                </Field>

                {form.kind === 'offer' && (
                    <Field label="تحاليل الباقة" error={testIdsError}>
                        <div className="grid max-h-56 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
                            {tests.map((test) => (
                                <label
                                    key={test.id}
                                    className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.testIds.includes(test.id)}
                                        onChange={() => toggleTest(test.id)}
                                        disabled={busy}
                                        className="mt-1 accent-brand-600"
                                    />
                                    <span>
                                        <strong className="block font-semibold">
                                            {test.name}
                                        </strong>
                                        <small className="text-slate-500">
                                            {test.code}
                                        </small>
                                    </span>
                                </label>
                            ))}
                            {tests.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    مفيش تحاليل نشطة متاحة للاختيار.
                                </p>
                            )}
                        </div>
                    </Field>
                )}

                <label className="flex w-fit items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) =>
                            updateField('isActive', event.target.checked)
                        }
                        disabled={busy}
                        className="size-4 accent-brand-600"
                    />
                    تفعيل العرض للمريض
                </label>
                {errors.is_active && (
                    <p className="text-xs text-rose-700">
                        {errors.is_active[0]}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <PrimaryButton type="submit" loading={busy}>
                        {form.id ? 'حفظ التعديلات' : 'إنشاء العرض'}
                    </PrimaryButton>
                    {form.id && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            إلغاء
                        </button>
                    )}
                </div>
            </form>

            <section className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            العروض المسجلة
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {page?.meta.total ?? 0} عرض أو كوبون
                        </p>
                    </div>
                    <span className="text-brand-600" aria-hidden="true">
                        <Icon name="report" size={20} />
                    </span>
                </div>
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
                        بنحمّل العروض...
                    </div>
                ) : promotions.length === 0 ? (
                    <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                        <span className="text-slate-400" aria-hidden="true">
                            <Icon name="report" size={24} />
                        </span>
                        <strong className="text-sm text-slate-700">
                            لسه مفيش عروض
                        </strong>
                        <span className="text-xs text-slate-500">
                            أنشئ باقة أو كوبون وفعّله بعد مراجعة تفاصيله.
                        </span>
                    </div>
                ) : (
                    <DataTable
                        headings={[
                            'العرض',
                            'النوع',
                            'الخصم',
                            'الاستخدام',
                            'الحالة',
                            '',
                        ]}
                    >
                        {promotions.map((promotion) => (
                            <tr key={promotion.id}>
                                <TableCell>
                                    <strong className="block text-slate-800">
                                        {promotion.name}
                                    </strong>
                                    {promotion.code && (
                                        <small
                                            dir="ltr"
                                            className="text-slate-500"
                                        >
                                            {promotion.code}
                                        </small>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {kindLabel(promotion.kind)}
                                </TableCell>
                                <TableCell>
                                    {promotion.discount_type === 'percentage'
                                        ? `${Number(promotion.discount_value)}٪`
                                        : promotion.discount_value}
                                </TableCell>
                                <TableCell>
                                    {promotion.used_count ?? 0}
                                    {promotion.usage_limit
                                        ? ` / ${promotion.usage_limit}`
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${promotion.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {promotion.is_active
                                            ? 'مفعّل'
                                            : 'غير مفعّل'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <button
                                        type="button"
                                        onClick={() => editPromotion(promotion)}
                                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                    >
                                        <Icon name="edit" size={14} /> تعديل
                                    </button>
                                </TableCell>
                            </tr>
                        ))}
                    </DataTable>
                )}
                {page && (page.links.prev || page.links.next) && (
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            disabled={!page.links.prev || loading}
                            onClick={() =>
                                page.links.prev &&
                                void loadPromotions(page.links.prev)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40"
                        >
                            السابق
                        </button>
                        <button
                            type="button"
                            disabled={!page.links.next || loading}
                            onClick={() =>
                                page.links.next &&
                                void loadPromotions(page.links.next)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40"
                        >
                            التالي
                        </button>
                    </div>
                )}
            </section>
        </PageShell>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string[];
    children: ReactNode;
}) {
    return (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
            {label}
            {children}
            {error?.[0] && (
                <span className="text-xs font-normal text-rose-700">
                    {error[0]}
                </span>
            )}
        </label>
    );
}

function kindLabel(kind: PatientPromotionKind): string {
    if (kind === 'offer') return 'باقة تحاليل';
    if (kind === 'coupon') return 'كوبون خصم';

    return 'قالب إحالة';
}
