import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import {
    DataTable,
    PageShell,
    PrimaryButton,
    TableCell,
} from '@/components/laboratory/workflow-ui';
import {
    createReferralDiscountRule,
    fetchReferralDiscountOptions,
    fetchReferralDiscountRules,
    updateReferralDiscountRule,
} from '@/modules/referral-discounts/services/referralDiscountsApi';
import type {
    ReferralDiscountBranchOption,
    ReferralDiscountDoctorOption,
    ReferralDiscountRule,
    ReferralDiscountRulePage,
    ReferralDiscountRulePayload,
    ReferralDiscountScope,
    ReferralDiscountType,
} from '@/modules/referral-discounts/types';

type RuleForm = {
    id: number | null;
    name: string;
    discountType: ReferralDiscountType;
    discountValue: string;
    minimumSubtotal: string;
    maximumDiscount: string;
    validFrom: string;
    validUntil: string;
    doctorId: string;
    branchId: string;
    referralScope: ReferralDiscountScope;
    isActive: boolean;
};

const EMPTY_FORM: RuleForm = {
    id: null,
    name: '',
    discountType: 'percentage',
    discountValue: '',
    minimumSubtotal: '',
    maximumDiscount: '',
    validFrom: '',
    validUntil: '',
    doctorId: '',
    branchId: '',
    referralScope: 'all_referrals',
    isActive: true,
};

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

export function ReferralDiscountRulesPage({
    token,
    onNotice,
}: {
    token: string;
    onNotice: (message: string) => void;
}) {
    const [page, setPage] = useState<ReferralDiscountRulePage | null>(null);
    const [doctors, setDoctors] = useState<ReferralDiscountDoctorOption[]>([]);
    const [branches, setBranches] = useState<ReferralDiscountBranchOption[]>(
        [],
    );
    const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const loadRules = useCallback(
        async (url?: string) => {
            setLoading(true);
            setError('');

            try {
                const [rulePage, options] = await Promise.all([
                    fetchReferralDiscountRules(token, url),
                    fetchReferralDiscountOptions(token),
                ]);
                setPage(rulePage);
                setDoctors(options.doctors);
                setBranches(options.branches);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر تحميل قواعد الخصم.',
                );
            } finally {
                setLoading(false);
            }
        },
        [token],
    );

    useEffect(() => {
        void loadRules();
    }, [loadRules]);

    function editRule(rule: ReferralDiscountRule) {
        setForm({
            id: rule.id,
            name: rule.name,
            discountType: rule.discount_type,
            discountValue: rule.discount_value,
            minimumSubtotal: rule.minimum_subtotal ?? '',
            maximumDiscount: rule.maximum_discount ?? '',
            validFrom: rule.valid_from ?? '',
            validUntil: rule.valid_until ?? '',
            doctorId: rule.doctor ? String(rule.doctor.id) : '',
            branchId: rule.branch ? String(rule.branch.id) : '',
            referralScope: rule.referral_scope,
            isActive: rule.is_active,
        });
        setErrors({});
    }

    function resetForm() {
        setForm(EMPTY_FORM);
        setErrors({});
    }

    async function submitRule(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setError('');

        const payload: ReferralDiscountRulePayload = {
            name: form.name.trim(),
            discount_type: form.discountType,
            discount_value: form.discountValue,
            minimum_subtotal: form.minimumSubtotal || null,
            maximum_discount: form.maximumDiscount || null,
            valid_from: form.validFrom || null,
            valid_until: form.validUntil || null,
            doctor_id: form.doctorId ? Number(form.doctorId) : null,
            branch_id: form.branchId ? Number(form.branchId) : null,
            referral_scope: form.referralScope,
            is_active: form.isActive,
        };

        try {
            const savedRule = form.id
                ? await updateReferralDiscountRule(token, form.id, payload)
                : await createReferralDiscountRule(token, payload);
            resetForm();
            onNotice(
                form.id
                    ? `تم تحديث قاعدة «${savedRule.name}».`
                    : `تم إنشاء قاعدة «${savedRule.name}».`,
            );
            await loadRules();
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
                        : 'تعذّر حفظ قاعدة الخصم.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    const rules = page?.data ?? [];

    return (
        <PageShell
            title="خصومات إحالات المرضى"
            description="أنشئ قواعد واضحة حسب الطبيب والفرع وفترة الصلاحية، مع لقطة ثابتة للخصم المحسوب على كل طلب."
        >
            {error && (
                <div
                    role="alert"
                    className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="font-semibold"
                    >
                        إغلاق
                    </button>
                </div>
            )}

            <form
                onSubmit={submitRule}
                className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:p-6"
            >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="grid gap-1">
                        <h3 className="font-bold text-slate-900">
                            {form.id ? 'تعديل قاعدة الخصم' : 'قاعدة خصم جديدة'}
                        </h3>
                        <p className="text-sm leading-6 text-slate-500">
                            عند تطابق أكثر من قاعدة، تُطبق القاعدة الأكثر تخصيصاً.
                            القواعد المتساوية الأولوية لا يمكن أن تتعارض في المدة.
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

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Field label="اسم القاعدة" error={errors.name?.[0]}>
                        <input
                            required
                            maxLength={120}
                            value={form.name}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field label="نوع الخصم" error={errors.discount_type?.[0]}>
                        <select
                            value={form.discountType}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    discountType:
                                        event.target.value === 'fixed_amount'
                                            ? 'fixed_amount'
                                            : 'percentage',
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="percentage">نسبة مئوية</option>
                            <option value="fixed_amount">مبلغ ثابت</option>
                        </select>
                    </Field>
                    <Field
                        label={
                            form.discountType === 'percentage'
                                ? 'نسبة الخصم (%)'
                                : 'قيمة الخصم (جنيه)'
                        }
                        error={errors.discount_value?.[0]}
                    >
                        <input
                            required
                            type="number"
                            min="0.01"
                            max={
                                form.discountType === 'percentage'
                                    ? '100'
                                    : undefined
                            }
                            step="0.01"
                            value={form.discountValue}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    discountValue: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field
                        label="الحد الأدنى للطلب (جنيه)"
                        error={errors.minimum_subtotal?.[0]}
                    >
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.minimumSubtotal}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    minimumSubtotal: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field
                        label="الحد الأقصى للخصم (جنيه)"
                        error={errors.maximum_discount?.[0]}
                    >
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={form.maximumDiscount}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    maximumDiscount: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field label="يبدأ في" error={errors.valid_from?.[0]}>
                        <input
                            type="date"
                            value={form.validFrom}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    validFrom: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field label="ينتهي في" error={errors.valid_until?.[0]}>
                        <input
                            type="date"
                            value={form.validUntil}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    validUntil: event.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field
                        label="نطاق الإحالات"
                        error={errors.referral_scope?.[0]}
                    >
                        <select
                            value={form.referralScope}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    referralScope:
                                        event.target.value === 'first_referral'
                                            ? 'first_referral'
                                            : 'all_referrals',
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="all_referrals">كل الإحالات</option>
                            <option value="first_referral">
                                أول إحالة للمريض من أي طبيب
                            </option>
                        </select>
                    </Field>
                    <Field label="الطبيب" error={errors.doctor_id?.[0]}>
                        <select
                            value={form.doctorId}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    doctorId: event.target.value,
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="">كل الأطباء</option>
                            {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="الفرع" error={errors.branch_id?.[0]}>
                        <select
                            value={form.branchId}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    branchId: event.target.value,
                                }))
                            }
                            className={inputClass}
                        >
                            <option value="">كل الفروع النشطة</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <label className="flex h-11 items-center gap-3 self-end rounded-xl border border-slate-200 px-3 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    isActive: event.target.checked,
                                }))
                            }
                            className="size-4 accent-brand-700"
                        />
                        القاعدة مفعّلة
                    </label>
                </div>

                {errors.discount?.[0] && (
                    <p className="text-sm text-rose-700" role="alert">
                        {errors.discount[0]}
                    </p>
                )}
                <div className="flex justify-start">
                    <PrimaryButton type="submit" disabled={busy}>
                        {busy
                            ? 'جارٍ الحفظ...'
                            : form.id
                              ? 'حفظ التعديلات'
                              : 'إنشاء القاعدة'}
                    </PrimaryButton>
                </div>
            </form>

            {loading ? (
                <div
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5"
                    aria-label="جاري تحميل قواعد الخصم"
                >
                    {[1, 2, 3].map((row) => (
                        <div
                            key={row}
                            className="h-12 animate-pulse rounded-lg bg-slate-100"
                        />
                    ))}
                </div>
            ) : rules.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                    لا توجد قواعد خصم حتى الآن. لا يمكن إنشاء إحالات جديدة قبل إضافة
                    قاعدة سارية.
                </div>
            ) : (
                <DataTable
                    headings={[
                        'القاعدة',
                        'الخصم',
                        'النطاق',
                        'الطبيب',
                        'الفرع',
                        'الحدود',
                        'الصلاحية',
                        'الحالة',
                        '',
                    ]}
                >
                    {rules.map((rule) => (
                        <tr key={rule.id}>
                            <TableCell className="font-semibold text-slate-800">
                                {rule.name}
                            </TableCell>
                            <TableCell>
                                {rule.discount_type === 'percentage'
                                    ? `${rule.discount_value}%`
                                    : `${rule.discount_value} ج.م`}
                            </TableCell>
                            <TableCell>
                                {rule.referral_scope === 'first_referral'
                                    ? 'أول إحالة للمريض'
                                    : 'كل الإحالات'}
                            </TableCell>
                            <TableCell>
                                {rule.doctor?.name ?? 'كل الأطباء'}
                            </TableCell>
                            <TableCell>
                                {rule.branch?.name ?? 'كل الفروع'}
                            </TableCell>
                            <TableCell>
                                <span className="block">
                                    أدنى طلب:{' '}
                                    {rule.minimum_subtotal ?? 'بدون حد'}
                                </span>
                                <span className="block">
                                    أقصى خصم:{' '}
                                    {rule.maximum_discount ?? 'بدون حد'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {rule.valid_from ?? 'دون بداية'}
                                <span className="block">
                                    {rule.valid_until ?? 'دون نهاية'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    {rule.is_active ? 'مفعّلة' : 'متوقفة'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <button
                                    type="button"
                                    onClick={() => editRule(rule)}
                                    className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                                >
                                    تعديل
                                </button>
                            </TableCell>
                        </tr>
                    ))}
                </DataTable>
            )}

            {page && page.meta.last_page > 1 && (
                <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>
                        الصفحة {page.meta.current_page} من {page.meta.last_page}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!page.links.prev || loading}
                            onClick={() =>
                                void loadRules(page.links.prev ?? undefined)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
                        >
                            السابق
                        </button>
                        <button
                            type="button"
                            disabled={!page.links.next || loading}
                            onClick={() =>
                                void loadRules(page.links.next ?? undefined)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}
        </PageShell>
    );
}

function Field({
    children,
    error,
    label,
}: {
    children: ReactNode;
    error?: string;
    label: string;
}) {
    return (
        <label className="grid content-start gap-2 text-sm font-medium text-slate-700">
            {label}
            {children}
            {error && (
                <span
                    className="text-xs font-normal text-rose-700"
                    role="alert"
                >
                    {error}
                </span>
            )}
        </label>
    );
}
