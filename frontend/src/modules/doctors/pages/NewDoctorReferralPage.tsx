import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { formatPrice } from '@/components/laboratory/workflow-types';
import { PageShell, PrimaryButton } from '@/components/laboratory/workflow-ui';
import {
    createDoctorReferral,
    fetchDoctorBranches,
    fetchDoctorProfile,
    fetchDoctorTests,
    findDoctorPatients,
} from '@/modules/doctors/services/doctorApi';
import type {
    DoctorOrder,
    DoctorPatientMatch,
    DoctorProfile,
    DoctorReferralPayload,
} from '@/modules/doctors/types';
import type {
    BranchOption,
    TestOption,
} from '@/components/laboratory/workflow-types';

type PatientForm = {
    id: number | null;
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: string;
};

const EMPTY_PATIENT: PatientForm = {
    id: null,
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
};

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

export function NewDoctorReferralPage({
    token,
    onNotice,
}: {
    token: string;
    onNotice: (message: string) => void;
}) {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [tests, setTests] = useState<TestOption[]>([]);
    const [patientMatches, setPatientMatches] = useState<DoctorPatientMatch[]>(
        [],
    );
    const [patient, setPatient] = useState<PatientForm>(EMPTY_PATIENT);
    const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
    const [urgentReason, setUrgentReason] = useState('');
    const [branchId, setBranchId] = useState('');
    const [testIds, setTestIds] = useState<number[]>([]);
    const [testSearch, setTestSearch] = useState('');
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [confirmation, setConfirmation] = useState<DoctorOrder | null>(null);
    const requestKey = useRef(crypto.randomUUID());

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoading(true);
            setError('');

            try {
                const doctorProfile = await fetchDoctorProfile(token);
                if (cancelled) return;
                setProfile(doctorProfile);

                if (doctorProfile.verification_status === 'verified') {
                    const [branchOptions, testOptions] = await Promise.all([
                        fetchDoctorBranches(token),
                        fetchDoctorTests(token),
                    ]);
                    if (cancelled) return;
                    setBranches(branchOptions);
                    setTests(testOptions);
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'تعذّر تحميل خيارات الإحالة.',
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadOptions();

        return () => {
            cancelled = true;
        };
    }, [token]);

    async function searchPatient() {
        setBusy(true);
        setErrors({});
        setError('');

        try {
            const matches = await findDoctorPatients(token, patient.phone);
            setPatientMatches(matches);
            if (matches.length === 0) {
                setPatient((current) => ({ ...current, id: null }));
            }
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر البحث عن المريض.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function submitReferral(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setErrors({});
        setError('');
        setConfirmation(null);

        try {
            const payload: DoctorReferralPayload = {
                request_key: requestKey.current,
                ...(patient.id ? { patient_id: patient.id } : {}),
                patient_full_name: patient.fullName,
                patient_phone: patient.phone,
                patient_email: patient.email || null,
                patient_date_of_birth: patient.dateOfBirth || null,
                patient_gender: patient.gender || null,
                branch_id: Number(branchId),
                test_ids: testIds,
                apply_discount: applyDiscount,
                priority,
                urgent_reason: priority === 'urgent' ? urgentReason : null,
                notes: notes || null,
            };
            const order = await createDoctorReferral(token, payload);
            setConfirmation(order);
            requestKey.current = crypto.randomUUID();
            onNotice(`تم إرسال الإحالة رقم ${order.order_number}.`);
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setErrors(requestError.validationErrors);
                if (Object.keys(requestError.validationErrors).length === 0) {
                    setError(requestError.message);
                }
            } else {
                setError('تعذّر إرسال الإحالة.');
            }
        } finally {
            setBusy(false);
        }
    }

    const matchingTests = tests.filter((test) =>
        `${test.name} ${test.code}`
            .toLocaleLowerCase('ar')
            .includes(testSearch.trim().toLocaleLowerCase('ar')),
    );
    const selectedSubtotalInCents = tests
        .filter((test) => testIds.includes(test.id))
        .reduce(
            (total, test) => total + Math.round(Number(test.price) * 100),
            0,
        );

    return (
        <PageShell
            title="إحالة جديدة"
            description="أنشئ طلب مختبر باسم المريض مع أولوية وملاحظات سريرية عند الحاجة."
        >
            {error && <ErrorBanner message={error} />}
            {errors.discount?.[0] && (
                <ErrorBanner message={errors.discount[0]} />
            )}
            {loading ? (
                <LoadingState />
            ) : profile?.verification_status !== 'verified' ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
                    لا يمكن إنشاء إحالات قبل اعتماد حساب الطبيب. يمكنك متابعة حالة
                    التحقق من صفحة الملف الطبي.
                </div>
            ) : (
                <div className="grid gap-5">
                    {confirmation && (
                        <div className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 sm:grid-cols-2">
                            <p className="font-semibold sm:col-span-2">
                                تم تسجيل الإحالة بنجاح. رقم الطلب:{' '}
                                <strong dir="ltr">
                                    {confirmation.order_number}
                                </strong>
                            </p>
                            <p>
                                قيمة التحاليل:{' '}
                                {formatPrice(confirmation.subtotal)}
                            </p>
                            <p>
                                خصم الإحالة:{' '}
                                {formatPrice(confirmation.discount_amount)}
                                {confirmation.discount && (
                                    <span className="block text-xs">
                                        {confirmation.discount.name}
                                    </span>
                                )}
                            </p>
                            <p className="font-bold sm:col-span-2">
                                الإجمالي بعد الخصم:{' '}
                                {formatPrice(confirmation.total)}
                            </p>
                        </div>
                    )}
                    <form
                        onSubmit={submitReferral}
                        className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:p-6"
                    >
                        <section className="grid gap-4 sm:grid-cols-2">
                            <h3 className="font-bold text-slate-900 sm:col-span-2">
                                بيانات المريض
                            </h3>
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                رقم هاتف المريض
                                <div className="flex gap-2">
                                    <input
                                        required
                                        value={patient.phone}
                                        onChange={(event) =>
                                            setPatient((current) => ({
                                                ...current,
                                                phone: event.target.value,
                                                id: null,
                                            }))
                                        }
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        disabled={
                                            busy || patient.phone.trim() === ''
                                        }
                                        onClick={() => void searchPatient()}
                                        className="shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"
                                    >
                                        بحث
                                    </button>
                                </div>
                                <FieldError
                                    message={errors.patient_phone?.[0]}
                                />
                            </label>
                            <p className="self-end pb-2 text-xs leading-5 text-slate-500">
                                البحث برقم الهاتف فقط؛ لا تظهر بيانات المرضى
                                الآخرين.
                            </p>
                            {patientMatches.length > 0 && (
                                <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                                    اختر سجل المريض
                                    <select
                                        value={patient.id ?? ''}
                                        onChange={(event) => {
                                            const match = patientMatches.find(
                                                (item) =>
                                                    item.id ===
                                                    Number(event.target.value),
                                            );
                                            setPatient((current) => ({
                                                ...current,
                                                id: match?.id ?? null,
                                                fullName:
                                                    match?.full_name ??
                                                    current.fullName,
                                                phone:
                                                    match?.phone ??
                                                    current.phone,
                                            }));
                                        }}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            مريض جديد / لم يتم الاختيار
                                        </option>
                                        {patientMatches.map((match) => (
                                            <option
                                                key={match.id}
                                                value={match.id}
                                            >
                                                {match.full_name} —{' '}
                                                {match.phone}
                                            </option>
                                        ))}
                                    </select>
                                    <FieldError
                                        message={errors.patient_id?.[0]}
                                    />
                                </label>
                            )}
                            {!patient.id && (
                                <>
                                    <ReferralInput
                                        label="اسم المريض"
                                        value={patient.fullName}
                                        onChange={(fullName) =>
                                            setPatient((current) => ({
                                                ...current,
                                                fullName,
                                            }))
                                        }
                                        error={errors.patient_full_name?.[0]}
                                        required
                                    />
                                    <ReferralInput
                                        label="البريد الإلكتروني (اختياري)"
                                        value={patient.email}
                                        onChange={(email) =>
                                            setPatient((current) => ({
                                                ...current,
                                                email,
                                            }))
                                        }
                                        error={errors.patient_email?.[0]}
                                        type="email"
                                    />
                                    <ReferralInput
                                        label="تاريخ الميلاد (اختياري)"
                                        value={patient.dateOfBirth}
                                        onChange={(dateOfBirth) =>
                                            setPatient((current) => ({
                                                ...current,
                                                dateOfBirth,
                                            }))
                                        }
                                        error={
                                            errors.patient_date_of_birth?.[0]
                                        }
                                        type="date"
                                    />
                                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                                        الجنس (اختياري)
                                        <select
                                            value={patient.gender}
                                            onChange={(event) =>
                                                setPatient((current) => ({
                                                    ...current,
                                                    gender: event.target.value,
                                                }))
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">غير محدد</option>
                                            <option value="male">ذكر</option>
                                            <option value="female">أنثى</option>
                                            <option value="other">أخرى</option>
                                        </select>
                                    </label>
                                </>
                            )}
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2">
                            <h3 className="font-bold text-slate-900 sm:col-span-2">
                                تفاصيل الإحالة
                            </h3>
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                الفرع
                                <select
                                    required
                                    value={branchId}
                                    onChange={(event) =>
                                        setBranchId(event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    <option value="">اختر الفرع</option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <FieldError message={errors.branch_id?.[0]} />
                            </label>
                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                الأولوية
                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            event.target.value as
                                                | 'normal'
                                                | 'urgent',
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="normal">عادية</option>
                                    <option value="urgent">عاجلة</option>
                                </select>
                            </label>
                            <label className="border-brand-200 flex cursor-pointer items-start justify-between gap-4 rounded-xl border bg-brand-50/70 p-4 text-sm sm:col-span-2">
                                <span className="grid gap-1">
                                    <span className="font-semibold text-slate-900">
                                        تطبيق خصم الإحالة على المريض
                                    </span>
                                    <span className="text-xs leading-5 text-slate-600">
                                        اختياري وغير مفعّل تلقائيًا. عند تفعيله،
                                        يطبّق النظام الخصم إذا وُجدت قاعدة سارية
                                        تنطبق على الإحالة؛ وإلا يُحسب الطلب بالسعر
                                        الكامل.
                                    </span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={applyDiscount}
                                    onChange={(event) =>
                                        setApplyDiscount(event.target.checked)
                                    }
                                    className="mt-0.5 size-5 shrink-0 accent-brand-600"
                                />
                            </label>
                            <fieldset className="grid gap-2 sm:col-span-2">
                                <legend className="text-sm font-medium text-slate-700">
                                    التحاليل المطلوبة
                                </legend>
                                <label className="grid gap-2">
                                    <span className="sr-only">
                                        ابحث عن تحليل
                                    </span>
                                    <input
                                        type="search"
                                        value={testSearch}
                                        onChange={(event) =>
                                            setTestSearch(event.target.value)
                                        }
                                        placeholder="ابحث باسم التحليل أو الكود"
                                        className={inputClass}
                                    />
                                </label>
                                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
                                    {matchingTests.map((test) => (
                                        <label
                                            key={test.id}
                                            className="flex items-start gap-2 text-sm text-slate-700"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={testIds.includes(
                                                    test.id,
                                                )}
                                                onChange={(event) =>
                                                    setTestIds((current) =>
                                                        event.target.checked
                                                            ? [
                                                                  ...current,
                                                                  test.id,
                                                              ]
                                                            : current.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      test.id,
                                                              ),
                                                    )
                                                }
                                                className="mt-1 size-4 accent-brand-600"
                                            />
                                            <span className="flex-1">
                                                {test.name}
                                                <span className="mr-2 text-xs text-slate-500">
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
                                        التحاليل المختارة:{' '}
                                        <strong>{testIds.length}</strong>
                                    </span>
                                    <span className="text-brand-800 font-bold">
                                        المجموع التقديري قبل الخصم:{' '}
                                        {formatPrice(
                                            (
                                                selectedSubtotalInCents / 100
                                            ).toFixed(2),
                                        )}
                                    </span>
                                    <span className="basis-full text-xs font-normal text-slate-500">
                                        قد يختلف الإجمالي النهائي بعد تطبيق خصم
                                        الإحالة؛ يعرضه النظام بعد إرسال الإحالة.
                                    </span>
                                </div>
                                <FieldError message={errors.test_ids?.[0]} />
                            </fieldset>
                            {priority === 'urgent' && (
                                <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                                    سبب الاستعجال
                                    <textarea
                                        required
                                        minLength={10}
                                        maxLength={2000}
                                        value={urgentReason}
                                        onChange={(event) =>
                                            setUrgentReason(event.target.value)
                                        }
                                        rows={3}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                                    />
                                    <FieldError
                                        message={errors.urgent_reason?.[0]}
                                    />
                                </label>
                            )}
                            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                                ملاحظات سريرية أو تعليمات للمختبر (اختياري)
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                                />
                            </label>
                        </section>

                        <div>
                            <PrimaryButton type="submit" disabled={busy}>
                                {busy ? 'جارٍ إرسال الإحالة…' : 'إرسال الإحالة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            )}
        </PageShell>
    );
}

function ReferralInput({
    label,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
            {label}
            <input
                type={type}
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            />
            <FieldError message={error} />
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? (
        <span className="text-xs font-normal text-rose-600">{message}</span>
    ) : null;
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
            {message}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            {[1, 2, 3].map((line) => (
                <div
                    key={line}
                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
            ))}
        </div>
    );
}
