import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import { PageShell, PrimaryButton } from '@/components/laboratory/workflow-ui';
import {
    fetchDoctorProfile,
    updateDoctorProfile,
} from '@/modules/doctors/services/doctorApi';
import type { DoctorProfile } from '@/modules/doctors/types';

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';

const statusLabels: Record<DoctorProfile['verification_status'], string> = {
    pending: 'بانتظار مراجعة بيانات الترخيص',
    verified: 'الحساب معتمد',
    rejected: 'تعذّر اعتماد الحساب',
    suspended: 'الحساب موقوف مؤقتاً',
};

export function DoctorProfilePage({
    token,
    onNotice,
}: {
    token: string;
    onNotice: (message: string) => void;
}) {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void fetchDoctorProfile(token)
            .then((doctorProfile) => {
                if (!cancelled) setProfile(doctorProfile);
            })
            .catch((requestError: unknown) => {
                if (!cancelled) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'تعذّر تحميل ملف الطبيب.',
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [token]);

    async function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!profile) return;

        setBusy(true);
        setErrors({});
        setError('');

        try {
            setProfile(
                await updateDoctorProfile(token, {
                    name: profile.name,
                    phone: profile.phone ?? '',
                    specialty: profile.specialty ?? '',
                    license_number: profile.license_number ?? '',
                }),
            );
            onNotice('تم حفظ بيانات الطبيب وإرسالها للتحقق.');
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setErrors(requestError.validationErrors);
                if (Object.keys(requestError.validationErrors).length === 0) {
                    setError(requestError.message);
                }
            } else {
                setError('تعذّر حفظ بيانات الطبيب.');
            }
        } finally {
            setBusy(false);
        }
    }

    const statusTone =
        profile?.verification_status === 'verified'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : profile?.verification_status === 'rejected' ||
                profile?.verification_status === 'suspended'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-amber-200 bg-amber-50 text-amber-800';

    return (
        <PageShell
            title="ملفي الطبي والتحقق"
            description="أدر بيانات حساب الطبيب وتابع قرار مراجعة الترخيص."
        >
            {error && <ErrorBanner message={error} />}
            {loading ? (
                <LoadingState />
            ) : profile ? (
                <div className="grid gap-5">
                    <article
                        className={`grid gap-2 rounded-2xl border p-5 ${statusTone}`}
                    >
                        <strong>
                            {statusLabels[profile.verification_status]}
                        </strong>
                        <p className="text-sm leading-6">
                            {profile.verification_note ??
                                (profile.verification_status === 'verified'
                                    ? 'يمكنك إنشاء الإحالات ومتابعة النتائج المعتمدة.'
                                    : 'أكمل بيانات الترخيص، ثم انتظر مراجعة إدارة المختبر.')}
                        </p>
                    </article>
                    <form
                        onSubmit={saveProfile}
                        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:grid-cols-2"
                    >
                        {(
                            [
                                ['name', 'اسم الطبيب', profile.name],
                                ['phone', 'رقم التواصل', profile.phone ?? ''],
                                [
                                    'specialty',
                                    'التخصص الطبي',
                                    profile.specialty ?? '',
                                ],
                                [
                                    'license_number',
                                    'رقم الترخيص الطبي',
                                    profile.license_number ?? '',
                                ],
                            ] as const
                        ).map(([key, label, value]) => (
                            <label
                                key={key}
                                className="grid gap-2 text-sm font-medium text-slate-700"
                            >
                                {label}
                                <input
                                    required
                                    value={value}
                                    onChange={(event) =>
                                        setProfile((current) =>
                                            current
                                                ? {
                                                      ...current,
                                                      [key]: event.target.value,
                                                  }
                                                : current,
                                        )
                                    }
                                    className={inputClass}
                                />
                                {errors[key]?.[0] && (
                                    <FieldError message={errors[key][0]} />
                                )}
                            </label>
                        ))}
                        <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                            البريد الإلكتروني للحساب
                            <input
                                disabled
                                value={profile.email}
                                className={inputClass}
                                dir="ltr"
                            />
                        </label>
                        <div className="sm:col-span-2">
                            <PrimaryButton type="submit" disabled={busy}>
                                {busy ? 'جارٍ الحفظ…' : 'حفظ وإرسال للمراجعة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            ) : (
                <ErrorBanner message="ملف الطبيب غير متاح لهذا الحساب." />
            )}
        </PageShell>
    );
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

function FieldError({ message }: { message: string }) {
    return <span className="text-xs font-normal text-rose-600">{message}</span>;
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
