import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';
import { ApiError } from '@/lib/api-client';
import { useNotifications } from '@/components/ui/notification-provider';
import {
    DataTable,
    PageShell,
    PrimaryButton,
    TableCell,
} from '@/components/laboratory/workflow-ui';
import {
    clockIn,
    clockOut,
    createShiftSchedule,
    fetchShiftOccurrences,
    fetchShiftOptions,
    fetchShiftSchedules,
    setShiftScheduleActive,
} from '@/modules/shifts/services/shiftsApi';
import type {
    ShiftOccurrence,
    ShiftOccurrencePage,
    ShiftSchedule,
    ShiftSchedulePayload,
    ShiftStaffOption,
} from '@/modules/shifts/types';

const inputClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70 disabled:bg-slate-50';
const DAY_LABELS = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

type ShiftForm = {
    userId: string;
    branchId: string;
    dayOfWeek: string;
    startsAt: string;
    endsAt: string;
    effectiveFrom: string;
    effectiveUntil: string;
};

const EMPTY_FORM: ShiftForm = {
    userId: '',
    branchId: '',
    dayOfWeek: '0',
    startsAt: '08:00',
    endsAt: '16:00',
    effectiveFrom: localDate(),
    effectiveUntil: '',
};

type ShiftsPageProps = {
    token: string;
    isAdministrator: boolean;
    currentUserId: number;
};

export function ShiftsPage({
    token,
    isAdministrator,
    currentUserId,
}: ShiftsPageProps) {
    const { showSuccessNotice } = useNotifications();
    const [week, setWeek] = useState(startOfWeek(localDate()));
    const [occurrences, setOccurrences] = useState<ShiftOccurrencePage | null>(
        null,
    );
    const [occurrencesNextUrl, setOccurrencesNextUrl] = useState<string | null>(
        null,
    );
    const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
    const [staff, setStaff] = useState<ShiftStaffOption[]>([]);
    const [branches, setBranches] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const [form, setForm] = useState<ShiftForm>(() => ({
        ...EMPTY_FORM,
        effectiveFrom: localDate(),
    }));
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {},
    );
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [busyScheduleId, setBusyScheduleId] = useState<number | null>(null);
    const [loadingMoreOccurrences, setLoadingMoreOccurrences] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const [occurrencePage, scheduleRows, options] = await Promise.all([
                fetchShiftOccurrences(token, week),
                isAdministrator
                    ? fetchShiftSchedules(token)
                    : Promise.resolve([]),
                isAdministrator
                    ? fetchShiftOptions(token)
                    : Promise.resolve(null),
            ]);
            setOccurrences(occurrencePage);
            setOccurrencesNextUrl(occurrencePage.links.next);
            setSchedules(scheduleRows);
            setStaff(options?.staff ?? []);
            setBranches(options?.branches ?? []);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل جدول المناوبات.',
            );
        } finally {
            setLoading(false);
        }
    }, [isAdministrator, token, week]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const selectedStaff = staff.find(
        (member) => String(member.id) === form.userId,
    );
    const availableBranches = useMemo(
        () =>
            branches.filter((branch) =>
                selectedStaff?.branches.some(
                    (assignedBranch) => assignedBranch.id === branch.id,
                ),
            ),
        [branches, selectedStaff],
    );

    function updateForm(field: keyof ShiftForm, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value,
            ...(field === 'userId' ? { branchId: '' } : {}),
        }));
    }

    async function loadMoreOccurrences() {
        if (!occurrencesNextUrl || loadingMoreOccurrences) {
            return;
        }

        setLoadingMoreOccurrences(true);
        setError('');

        try {
            const page = await fetchShiftOccurrences(
                token,
                week,
                occurrencesNextUrl,
            );
            setOccurrences((current) =>
                current
                    ? { ...page, data: [...current.data, ...page.data] }
                    : page,
            );
            setOccurrencesNextUrl(page.links.next);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل بقية المناوبات.',
            );
        } finally {
            setLoadingMoreOccurrences(false);
        }
    }

    function EmptyTableRow({
        colSpan,
        message,
    }: {
        colSpan: number;
        message: string;
    }) {
        return (
            <tr>
                <td
                    colSpan={colSpan}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                >
                    {message}
                </td>
            </tr>
        );
    }

    async function submitSchedule(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setError('');
        setFieldErrors({});

        const payload: ShiftSchedulePayload = {
            branch_id: Number(form.branchId),
            user_id: Number(form.userId),
            day_of_week: Number(form.dayOfWeek),
            starts_at: form.startsAt,
            ends_at: form.endsAt,
            effective_from: form.effectiveFrom,
            effective_until: form.effectiveUntil || null,
        };

        try {
            await createShiftSchedule(token, payload);
            setForm({ ...EMPTY_FORM, effectiveFrom: localDate() });
            showSuccessNotice('تم إنشاء المناوبة الأسبوعية.');
            await loadData();
        } catch (requestError) {
            if (requestError instanceof ApiError) {
                setFieldErrors(requestError.validationErrors);
                if (Object.keys(requestError.validationErrors).length === 0) {
                    setError(requestError.message);
                }
            } else {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'تعذّر إنشاء المناوبة.',
                );
            }
        } finally {
            setBusy(false);
        }
    }

    async function toggleSchedule(schedule: ShiftSchedule) {
        setBusyScheduleId(schedule.id);
        setError('');

        try {
            await setShiftScheduleActive(
                token,
                schedule.id,
                !schedule.is_active,
            );
            showSuccessNotice(
                schedule.is_active
                    ? 'تم إيقاف تكرار المناوبة.'
                    : 'تم تفعيل تكرار المناوبة.',
            );
            await loadData();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحديث المناوبة.',
            );
        } finally {
            setBusyScheduleId(null);
        }
    }

    async function recordAttendance(
        shift: ShiftOccurrence,
        action: 'clock-in' | 'clock-out',
    ) {
        setBusyScheduleId(shift.shift_schedule_id);
        setError('');

        try {
            if (action === 'clock-in') {
                await clockIn(token, shift.shift_schedule_id, shift.shift_date);
                showSuccessNotice('تم تسجيل الحضور للمناوبة.');
            } else {
                await clockOut(
                    token,
                    shift.shift_schedule_id,
                    shift.shift_date,
                );
                showSuccessNotice('تم تسجيل الانصراف للمناوبة.');
            }
            await loadData();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تسجيل الحضور أو الانصراف.',
            );
        } finally {
            setBusyScheduleId(null);
        }
    }

    const weekLabel = `${formatDate(week)} - ${formatDate(addDays(week, 6))}`;

    return (
        <PageShell
            title="الشيفتات والحضور"
            description={
                isAdministrator
                    ? 'أنشئ مناوبات أسبوعية متكررة للفروع، وتابع حضور الموظفين وانصرافهم.'
                    : 'راجع جدول مناوباتك الأسبوعي وسجّل الحضور والانصراف لكل مناوبة.'
            }
        >
            {error && (
                <ErrorMessage message={error} onDismiss={() => setError('')} />
            )}

            {isAdministrator && (
                <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-22px_rgba(20,54,49,0.35)] sm:p-6">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            إضافة مناوبة متكررة
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            تتكرر المناوبة كل أسبوع في اليوم والوقت المحددين،
                            حتى تاريخ الانتهاء الاختياري أو إيقافها.
                        </p>
                    </div>
                    <form
                        onSubmit={submitSchedule}
                        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        <FormField
                            label="الموظف"
                            error={fieldErrors.user_id?.[0]}
                        >
                            <select
                                required
                                value={form.userId}
                                onChange={(event) =>
                                    updateForm('userId', event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">اختر الموظف</option>
                                {staff.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField
                            label="الفرع"
                            error={fieldErrors.branch_id?.[0]}
                        >
                            <select
                                required
                                disabled={!selectedStaff}
                                value={form.branchId}
                                onChange={(event) =>
                                    updateForm('branchId', event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">اختر الفرع</option>
                                {availableBranches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField
                            label="اليوم"
                            error={fieldErrors.day_of_week?.[0]}
                        >
                            <select
                                value={form.dayOfWeek}
                                onChange={(event) =>
                                    updateForm('dayOfWeek', event.target.value)
                                }
                                className={inputClass}
                            >
                                {DAY_LABELS.map((label, index) => (
                                    <option key={label} value={index}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField
                            label="يبدأ"
                            error={fieldErrors.starts_at?.[0]}
                        >
                            <input
                                required
                                type="time"
                                value={form.startsAt}
                                onChange={(event) =>
                                    updateForm('startsAt', event.target.value)
                                }
                                className={inputClass}
                            />
                        </FormField>
                        <FormField
                            label="ينتهي"
                            error={fieldErrors.ends_at?.[0]}
                        >
                            <input
                                required
                                type="time"
                                value={form.endsAt}
                                onChange={(event) =>
                                    updateForm('endsAt', event.target.value)
                                }
                                className={inputClass}
                            />
                        </FormField>
                        <FormField
                            label="ساري من"
                            error={fieldErrors.effective_from?.[0]}
                        >
                            <input
                                required
                                type="date"
                                value={form.effectiveFrom}
                                onChange={(event) =>
                                    updateForm(
                                        'effectiveFrom',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </FormField>
                        <FormField
                            label="حتى (اختياري)"
                            error={fieldErrors.effective_until?.[0]}
                        >
                            <input
                                type="date"
                                min={form.effectiveFrom}
                                value={form.effectiveUntil}
                                onChange={(event) =>
                                    updateForm(
                                        'effectiveUntil',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </FormField>
                        <div className="flex items-end">
                            <PrimaryButton type="submit" loading={busy}>
                                حفظ المناوبة
                            </PrimaryButton>
                        </div>
                    </form>
                    {staff.length === 0 && !loading && (
                        <p className="text-sm text-amber-700">
                            لا يوجد موظفون مرتبطون بفروع. أضف الموظفين واربطهم
                            بفروعهم أولًا.
                        </p>
                    )}
                </section>
            )}

            <section className="grid gap-4">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            جدول الأسبوع
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {weekLabel}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setWeek(addDays(week, -7))}
                            aria-label="الأسبوع السابق"
                            className="hover:border-brand-200 grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:text-brand-700"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={() => setWeek(startOfWeek(localDate()))}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            هذا الأسبوع
                        </button>
                        <button
                            type="button"
                            onClick={() => setWeek(addDays(week, 7))}
                            aria-label="الأسبوع التالي"
                            className="hover:border-brand-200 grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:text-brand-700"
                        >
                            ›
                        </button>
                    </div>
                </header>
                <DataTable
                    headings={[
                        'اليوم',
                        'الموظف',
                        'الفرع',
                        'المناوبة',
                        'الحضور',
                        'الحالة',
                        ...(isAdministrator ? [] : ['إجراء']),
                    ]}
                >
                    {loading ? (
                        <EmptyTableRow
                            colSpan={isAdministrator ? 6 : 7}
                            message="جارٍ تحميل جدول المناوبات..."
                        />
                    ) : (occurrences?.data.length ?? 0) === 0 ? (
                        <EmptyTableRow
                            colSpan={isAdministrator ? 6 : 7}
                            message="لا توجد مناوبات في هذا الأسبوع."
                        />
                    ) : (
                        occurrences?.data.map((shift) => (
                            <ShiftRow
                                key={`${shift.shift_schedule_id}-${shift.shift_date}`}
                                shift={shift}
                                isAdministrator={isAdministrator}
                                currentUserId={currentUserId}
                                busy={
                                    busyScheduleId === shift.shift_schedule_id
                                }
                                onAttendance={recordAttendance}
                            />
                        ))
                    )}
                </DataTable>
                {occurrencesNextUrl && !loading && (
                    <div className="flex justify-center">
                        <PrimaryButton
                            type="button"
                            loading={loadingMoreOccurrences}
                            onClick={() => void loadMoreOccurrences()}
                        >
                            تحميل باقي المناوبات
                        </PrimaryButton>
                    </div>
                )}
            </section>

            {isAdministrator && (
                <section className="grid gap-4">
                    <div>
                        <h3 className="font-bold text-slate-900">
                            قواعد التكرار الأسبوعي
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            إيقاف القاعدة يمنع إنشاء مناوبات مستقبلية ولا يحذف
                            سجلات الحضور السابقة.
                        </p>
                    </div>
                    <DataTable
                        headings={[
                            'الموظف',
                            'الفرع',
                            'اليوم',
                            'الوقت',
                            'ساري من',
                            'حتى',
                            'الحالة',
                            'إجراء',
                        ]}
                    >
                        {loading ? (
                            <EmptyTableRow
                                colSpan={8}
                                message="جارٍ تحميل القواعد..."
                            />
                        ) : schedules.length === 0 ? (
                            <EmptyTableRow
                                colSpan={8}
                                message="لم يتم إنشاء قواعد مناوبات بعد."
                            />
                        ) : (
                            schedules.map((schedule) => (
                                <tr key={schedule.id}>
                                    <TableCell>{schedule.user.name}</TableCell>
                                    <TableCell>
                                        {schedule.branch.name}
                                    </TableCell>
                                    <TableCell>
                                        {DAY_LABELS[schedule.day_of_week] ??
                                            '—'}
                                    </TableCell>
                                    <TableCell>
                                        <bdi dir="ltr">
                                            {schedule.starts_at} –{' '}
                                            {schedule.ends_at}
                                        </bdi>
                                    </TableCell>
                                    <TableCell>
                                        {schedule.effective_from}
                                    </TableCell>
                                    <TableCell>
                                        {schedule.effective_until ?? 'مستمر'}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${schedule.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}
                                        >
                                            {schedule.is_active
                                                ? 'نشطة'
                                                : 'متوقفة'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            type="button"
                                            disabled={
                                                busyScheduleId === schedule.id
                                            }
                                            onClick={() =>
                                                void toggleSchedule(schedule)
                                            }
                                            className="rounded-lg px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                                        >
                                            {schedule.is_active
                                                ? 'إيقاف التكرار'
                                                : 'تفعيل التكرار'}
                                        </button>
                                    </TableCell>
                                </tr>
                            ))
                        )}
                    </DataTable>
                </section>
            )}
        </PageShell>
    );
}

function ShiftRow({
    shift,
    isAdministrator,
    currentUserId,
    busy,
    onAttendance,
}: {
    shift: ShiftOccurrence;
    isAdministrator: boolean;
    currentUserId: number;
    busy: boolean;
    onAttendance: (
        shift: ShiftOccurrence,
        action: 'clock-in' | 'clock-out',
    ) => Promise<void>;
}) {
    const attendance = shift.attendance;
    const today = localDate();
    const isShiftDay = today === shift.shift_date;
    const isOvernightEndDay =
        datePart(shift.ends_at) === today &&
        datePart(shift.starts_at) !== today;
    const mayClockIn = !isAdministrator && isShiftDay && attendance === null;
    const mayClockOut =
        !isAdministrator &&
        (isShiftDay || isOvernightEndDay) &&
        attendance?.clocked_in_at !== null &&
        attendance?.clocked_in_at !== undefined &&
        attendance.clocked_out_at === null;
    const status = !attendance
        ? 'لم يسجل الحضور'
        : attendance.clocked_out_at
          ? 'انصراف مسجل'
          : 'حضر ولم يسجل الانصراف';

    return (
        <tr>
            <TableCell>
                <div className="font-semibold text-slate-800">
                    {
                        DAY_LABELS[
                            new Date(`${shift.shift_date}T12:00:00`).getDay()
                        ]
                    }
                </div>
                <time className="text-xs text-slate-500">
                    {shift.shift_date}
                </time>
            </TableCell>
            <TableCell>
                {shift.user.id === currentUserId ? 'أنت' : shift.user.name}
            </TableCell>
            <TableCell>{shift.branch.name}</TableCell>
            <TableCell>
                <bdi dir="ltr">
                    {formatTime(shift.starts_at)} – {formatTime(shift.ends_at)}
                </bdi>
            </TableCell>
            <TableCell>
                {attendance?.clocked_in_at
                    ? formatTime(attendance.clocked_in_at)
                    : '—'}
            </TableCell>
            <TableCell>
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        !attendance
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : attendance.clocked_out_at
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-sky-200 bg-sky-50 text-sky-800'
                    }`}
                >
                    {attendance?.clocked_out_at
                        ? `انصرف ${formatTime(attendance.clocked_out_at)}`
                        : status}
                </span>
            </TableCell>
            {!isAdministrator && (
                <TableCell>
                    {mayClockIn ? (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onAttendance(shift, 'clock-in')}
                            className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
                        >
                            تسجيل حضور
                        </button>
                    ) : mayClockOut ? (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                                void onAttendance(shift, 'clock-out')
                            }
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                            تسجيل انصراف
                        </button>
                    ) : (
                        '—'
                    )}
                </TableCell>
            )}
        </tr>
    );
}

function FormField({
    children,
    error,
    label,
}: {
    children: ReactNode;
    error?: string;
    label: string;
}) {
    return (
        <label className="grid content-start gap-1.5 text-xs font-semibold text-slate-700">
            {label}
            {children}
            {error && (
                <span
                    role="alert"
                    className="text-xs font-medium text-rose-700"
                >
                    {error}
                </span>
            )}
        </label>
    );
}

function ErrorMessage({
    message,
    onDismiss,
}: {
    message: string;
    onDismiss: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
            <span>{message}</span>
            <button type="button" onClick={onDismiss} className="font-semibold">
                إغلاق
            </button>
        </div>
    );
}

function localDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function startOfWeek(dateString: string): string {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() - date.getDay());

    return date.toISOString().slice(0, 10);
}

function addDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + days);

    return date.toISOString().slice(0, 10);
}

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'medium',
    }).format(new Date(`${dateString}T12:00:00`));
}

function formatTime(value: string): string {
    return new Intl.DateTimeFormat('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function datePart(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
