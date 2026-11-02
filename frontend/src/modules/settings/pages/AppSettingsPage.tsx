import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '@/components/ui/notification-provider';
import { PageShell } from '@/components/laboratory/workflow-ui';
import {
    fetchAppSettings,
    updateAppSettings,
} from '@/modules/settings/services/appSettingsApi';

export function AppSettingsPage({ token }: { token: string }) {
    const { showSuccessNotice } = useNotifications();
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadSettings = useCallback(async () => {
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
    }, [token]);

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
            title="إعدادات النظام"
            description="تحكم في الخدمات المتاحة للمرضى من التطبيق."
        >
            <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="grid gap-1">
                    <h3 className="text-base font-bold text-slate-900">
                        خدمة السحب المنزلي
                    </h3>
                    <p className="text-sm leading-6 text-slate-500">
                        أول إعداد للخدمات. عند إيقافها، لن يتمكن المرضى من بدء
                        طلب سحب جديد، مع بقاء الطلبات المسجلة متاحة للفريق.
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
                            className={`size-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-0' : 'translate-x-6'}`}
                        />
                    </button>
                </div>

                {saving && (
                    <p className="text-xs text-slate-500" role="status">
                        بنحفظ الإعداد...
                    </p>
                )}
            </section>
        </PageShell>
    );
}
