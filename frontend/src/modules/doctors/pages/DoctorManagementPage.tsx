import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import {
    DataTable,
    PageShell,
    PrimaryButton,
    TableCell,
} from '@/components/laboratory/workflow-ui';
import {
    fetchDoctors,
    updateDoctorVerification,
} from '@/modules/doctors/services/doctorApi';
import type { DoctorProfile } from '@/modules/doctors/types';

type ReviewStatus = 'verified' | 'rejected' | 'suspended';

const statusLabels: Record<DoctorProfile['verification_status'], string> = {
    pending: 'بانتظار المراجعة',
    verified: 'معتمد',
    rejected: 'مرفوض',
    suspended: 'موقوف',
};

export function DoctorManagementPage({
    token,
    onNotice,
}: {
    token: string;
    onNotice: (message: string) => void;
}) {
    const [page, setPage] = useState<Awaited<
        ReturnType<typeof fetchDoctors>
    > | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(
        null,
    );
    const [status, setStatus] = useState<ReviewStatus>('verified');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const loadDoctors = useCallback(
        async (url?: string) => {
            setLoading(true);
            setError('');

            try {
                setPage(await fetchDoctors(token, url));
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر تحميل حسابات الأطباء.',
                );
            } finally {
                setLoading(false);
            }
        },
        [token],
    );

    useEffect(() => {
        void loadDoctors();
    }, [loadDoctors]);

    async function submitReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedDoctor) return;
        setBusy(true);
        setValidationError('');
        setError('');

        try {
            await updateDoctorVerification(token, selectedDoctor.id, {
                verification_status: status,
                verification_note: note || null,
            });
            setSelectedDoctor(null);
            setNote('');
            onNotice(`تم تحديث حالة الطبيب ${selectedDoctor.name}.`);
            await loadDoctors();
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setValidationError(
                    requestError.validationErrors.verification_note?.[0] ??
                        requestError.validationErrors.doctor_profile?.[0] ??
                        '',
                );
                if (Object.keys(requestError.validationErrors).length === 0) {
                    setError(requestError.message);
                }
            } else {
                setError('تعذّر تحديث حالة الطبيب.');
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <PageShell
            title="مراجعة حسابات الأطباء"
            description="راجع رقم الترخيص والتخصص قبل الاعتماد. الإيقاف يمنع إنشاء إحالات جديدة والوصول إلى النتائج المحمية."
        >
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                    {error}
                </div>
            )}
            {loading ? (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                    {[1, 2, 3].map((line) => (
                        <div
                            key={line}
                            className="h-12 animate-pulse rounded-lg bg-slate-100"
                        />
                    ))}
                </div>
            ) : !page?.data.length ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
                    لا توجد حسابات أطباء لعرضها.
                </div>
            ) : (
                <DataTable
                    headings={[
                        'الطبيب',
                        'التخصص',
                        'رقم الترخيص',
                        'الحالة',
                        'ملاحظات المراجعة',
                        '',
                    ]}
                >
                    {page.data.map((doctor) => (
                        <tr key={doctor.id}>
                            <TableCell>
                                <strong className="block text-slate-800">
                                    {doctor.name}
                                </strong>
                                <span
                                    className="text-xs text-slate-500"
                                    dir="ltr"
                                >
                                    {doctor.email}
                                </span>
                                <span
                                    className="block text-xs text-slate-500"
                                    dir="ltr"
                                >
                                    {doctor.phone ?? '—'}
                                </span>
                            </TableCell>
                            <TableCell>
                                {doctor.specialty ?? 'لم يستكمل الملف'}
                            </TableCell>
                            <TableCell>
                                <span dir="ltr">
                                    {doctor.license_number ?? '—'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {statusLabels[doctor.verification_status]}
                                </span>
                            </TableCell>
                            <TableCell>
                                {doctor.verification_note ?? '—'}
                            </TableCell>
                            <TableCell>
                                {doctor.license_number ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDoctor(doctor);
                                            setStatus(
                                                doctor.verification_status ===
                                                    'verified'
                                                    ? 'suspended'
                                                    : 'verified',
                                            );
                                            setNote('');
                                            setValidationError('');
                                        }}
                                        className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
                                    >
                                        مراجعة
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-400">
                                        بانتظار استكمال البيانات
                                    </span>
                                )}
                            </TableCell>
                        </tr>
                    ))}
                </DataTable>
            )}

            {page && page.meta.last_page > 1 && (
                <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                    <button
                        type="button"
                        disabled={!page.links.prev || loading}
                        onClick={() =>
                            page.links.prev && void loadDoctors(page.links.prev)
                        }
                        className="rounded-lg px-3 py-2 text-sm disabled:opacity-40"
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
                            page.links.next && void loadDoctors(page.links.next)
                        }
                        className="rounded-lg px-3 py-2 text-sm disabled:opacity-40"
                    >
                        التالي
                    </button>
                </nav>
            )}

            {selectedDoctor && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
                    <form
                        onSubmit={submitReview}
                        className="grid w-full max-w-xl gap-4 rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                مراجعة {selectedDoctor.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                الترخيص: {selectedDoctor.license_number} ·
                                التخصص: {selectedDoctor.specialty}
                            </p>
                        </div>
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                            القرار
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as ReviewStatus,
                                    )
                                }
                                className="h-11 rounded-xl border border-slate-200 px-3"
                            >
                                <option value="verified">اعتماد</option>
                                <option value="rejected">رفض</option>
                                <option value="suspended">إيقاف</option>
                            </select>
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                            ملاحظة القرار{' '}
                            {status !== 'verified' && (
                                <span className="text-rose-600">(إلزامية)</span>
                            )}
                            <textarea
                                value={note}
                                onChange={(event) =>
                                    setNote(event.target.value)
                                }
                                minLength={
                                    status === 'verified' ? undefined : 10
                                }
                                maxLength={2000}
                                rows={4}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                            />
                            {validationError && (
                                <span className="text-xs font-normal text-rose-600">
                                    {validationError}
                                </span>
                            )}
                        </label>
                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setSelectedDoctor(null)}
                                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
                            >
                                إلغاء
                            </button>
                            <PrimaryButton type="submit" disabled={busy}>
                                {busy ? 'جارٍ الحفظ…' : 'حفظ القرار'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            )}
        </PageShell>
    );
}
