import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '@/components/ui/notification-provider';
import { PageShell } from '@/components/laboratory/workflow-ui';
import {
    notificationSoundOptions,
    type NotificationSound,
} from '@/modules/notifications/notification-sounds';
import {
    fetchAppSettings,
    updateAppSettings,
} from '@/modules/settings/services/appSettingsApi';

type AppSettingsPageProps = {
    token: string;
    canManageSystemSettings: boolean;
    soundNotificationsEnabled: boolean;
    notificationSound: NotificationSound;
    firebasePushAvailable: boolean;
    firebasePushEnabled: boolean;
    firebasePushBusy: boolean;
    onToggleSoundNotifications: () => void;
    onNotificationSoundChange: (sound: NotificationSound) => void;
    onPreviewNotificationSound: () => void;
    onToggleFirebasePushNotifications: () => void;
};

export function AppSettingsPage({
    token,
    canManageSystemSettings,
    soundNotificationsEnabled,
    notificationSound,
    firebasePushAvailable,
    firebasePushEnabled,
    firebasePushBusy,
    onToggleSoundNotifications,
    onNotificationSoundChange,
    onPreviewNotificationSound,
    onToggleFirebasePushNotifications,
}: AppSettingsPageProps) {
    const { showSuccessNotice } = useNotifications();
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadSettings = useCallback(async () => {
        if (!canManageSystemSettings) {
            setLoading(false);

            return;
        }

        setLoading(true);
        setError('');

        try {
            const settings = await fetchAppSettings(token);
            setEnabled(settings.home_collection_enabled);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر تحميل إعدادات النظام.',
            );
        } finally {
            setLoading(false);
        }
    }, [canManageSystemSettings, token]);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    async function toggleHomeCollection() {
        if (enabled === null || saving) {
            return;
        }

        setSaving(true);
        setError('');

        try {
            const settings = await updateAppSettings(token, {
                home_collection_enabled: !enabled,
            });
            setEnabled(settings.home_collection_enabled);
            showSuccessNotice(
                settings.home_collection_enabled
                    ? 'تم تفعيل خدمة السحب المنزلي.'
                    : 'تم إيقاف خدمة السحب المنزلي.',
            );
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'تعذّر حفظ إعداد الخدمة.',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <PageShell
            title="الإعدادات"
            description="إدارة تفضيلات التنبيهات وخدمات المختبر حسب صلاحيتك."
        >
            <section className="grid gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,55,48,0.1)] sm:p-7">
                <header className="grid gap-1">
                    <h3 className="text-base font-bold text-slate-900">
                        تفضيلات التنبيهات
                    </h3>
                    <p className="text-sm leading-6 text-slate-500">
                        خصّص طريقة استقبال تنبيهات الطلبات على هذا المتصفح.
                    </p>
                </header>

                <div className="grid divide-y divide-slate-100 border-t border-slate-100">
                    <PreferenceSwitch
                        title="صوت التنبيه"
                        description="تشغيل النغمة المختارة عند وصول طلب أو إحالة جديدة."
                        enabled={soundNotificationsEnabled}
                        onChange={onToggleSoundNotifications}
                    />
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end sm:justify-between">
                        <label className="grid flex-1 gap-1.5 text-sm font-semibold text-slate-800 sm:max-w-sm">
                            نغمة التنبيه
                            <select
                                value={notificationSound}
                                onChange={(event) => {
                                    const selectedSound =
                                        notificationSoundOptions.find(
                                            (option) =>
                                                option.value ===
                                                event.currentTarget.value,
                                        );

                                    if (selectedSound) {
                                        onNotificationSoundChange(
                                            selectedSound.value,
                                        );
                                    }
                                }}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 transition outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100/70"
                            >
                                {notificationSoundOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span className="text-xs font-normal text-slate-500">
                                يتم حفظ النغمة لهذا المتصفح.
                            </span>
                        </label>
                        <button
                            type="button"
                            onClick={onPreviewNotificationSound}
                            className="border-brand-200 h-11 rounded-xl border px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                        >
                            تجربة الصوت
                        </button>
                    </div>
                    <PreferenceSwitch
                        title="إشعارات المتصفح بالخلفية"
                        description={
                            firebasePushAvailable
                                ? 'استقبال إشعارات عند عدم فتح لوحة المختبر، حسب إذن المتصفح.'
                                : 'الميزة غير متاحة حاليًا؛ يلزم إعداد خدمة الإشعارات للمتصفح.'
                        }
                        enabled={firebasePushEnabled}
                        disabled={!firebasePushAvailable || firebasePushBusy}
                        busy={firebasePushBusy}
                        onChange={onToggleFirebasePushNotifications}
                        status={firebasePushAvailable ? undefined : 'غير متاحة'}
                    />
                </div>
            </section>

            {canManageSystemSettings && (
                <section className="mt-5 grid gap-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_-4px_rgba(15,55,48,0.1)] sm:p-7">
                    <div className="grid gap-1">
                        <h3 className="text-base font-bold text-slate-900">
                            إعدادات النظام
                        </h3>
                        <p className="text-sm leading-6 text-slate-500">
                            تحكم في الخدمات المتاحة للمريض على مستوى المختبر.
                        </p>
                    </div>
                    <div className="grid gap-1">
                        <h4 className="text-sm font-bold text-slate-900">
                            خدمة السحب المنزلي
                        </h4>
                        <p className="text-sm leading-6 text-slate-500">
                            عند إيقاف الخدمة، لن يتمكن المرضى من بدء طلب سحب
                            جديد، مع بقاء الطلبات المسجلة متاحة للفريق.
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                        >
                            <p>{error}</p>
                            <button
                                type="button"
                                onClick={() => void loadSettings()}
                                className="mt-2 font-semibold underline underline-offset-2"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className={`size-2.5 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {loading
                                        ? 'جارٍ تحميل حالة الخدمة...'
                                        : enabled
                                          ? 'الخدمة متاحة للمرضى'
                                          : 'الخدمة متوقفة'}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {enabled === true
                                        ? 'يمكن للمرضى إرسال طلبات سحب منزلي جديدة.'
                                        : enabled === false
                                          ? 'سيظهر للمرضى أن الخدمة غير متاحة حالياً.'
                                          : 'حالة الخدمة غير معروفة حالياً.'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={enabled ?? false}
                            aria-label="تفعيل خدمة السحب المنزلي"
                            disabled={loading || saving || enabled === null}
                            onClick={() => void toggleHomeCollection()}
                            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-50 ${enabled ? 'bg-brand-700' : 'bg-slate-300'}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`size-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-0' : '-translate-x-6'}`}
                            />
                        </button>
                    </div>

                    {saving && (
                        <p className="text-xs text-slate-500" role="status">
                            جارٍ حفظ الإعداد...
                        </p>
                    )}
                </section>
            )}
        </PageShell>
    );
}

function PreferenceSwitch({
    title,
    description,
    enabled,
    disabled = false,
    busy = false,
    status,
    onChange,
}: {
    title: string;
    description?: string;
    enabled: boolean;
    disabled?: boolean;
    busy?: boolean;
    status?: string;
    onChange: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                {description && (
                    <p className="text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            {status ? (
                <span
                    role="status"
                    className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 sm:self-center"
                >
                    {status}
                </span>
            ) : (
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={title}
                    aria-busy={busy}
                    disabled={disabled}
                    onClick={onChange}
                    className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-wait disabled:opacity-50 ${enabled ? 'bg-brand-700' : 'bg-slate-300'}`}
                >
                    <span
                        aria-hidden="true"
                        className={`size-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-0' : '-translate-x-6'}`}
                    />
                </button>
            )}
        </div>
    );
}
