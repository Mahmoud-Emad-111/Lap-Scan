import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Activity,
    ArrowLeft,
    Bell,
    BellOff,
    ClipboardList,
    FileHeart,
    FlaskConical,
    House,
    LogOut,
    type LucideIcon,
    UserRound,
    X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { ApiError } from '@/lib/api-client';
import {
    disablePatientPush,
    enablePatientPush,
    isPatientPushConfigured,
    isPatientPushEnabled,
    restorePatientPush,
} from '@/lib/patient-push';
import {
    createPatientEcho,
    isPatientPortalUpdate,
    PATIENT_PORTAL_UPDATE_EVENT,
    type PatientPortalUpdate,
} from '@/lib/patient-realtime';
import { useCallback, useEffect, useRef, useState } from 'react';

const navigation = [
    { to: '/home', label: 'الرئيسية', icon: House },
    { to: '/tests', label: 'التحاليل', icon: FlaskConical },
    { to: '/bookings', label: 'طلباتي', icon: ClipboardList },
    { to: '/results', label: 'نتايجي', icon: FileHeart },
    { to: '/profile', label: 'حسابي', icon: UserRound },
];

const pageTitles: Record<string, string> = {
    '/home': 'الرئيسية',
    '/tests': 'التحاليل',
    '/booking': 'طلب سحب منزلي',
    '/bookings': 'طلباتي',
    '/results': 'نتايجي',
    '/profile': 'حسابي',
};

function getUpdateNotification(update: PatientPortalUpdate): {
    title: string;
    description: string;
    action: string;
    destination: string;
    Icon: LucideIcon;
} {
    switch (update.update_type) {
        case 'result_available':
            return {
                title: 'نتيجة تحليل جديدة جاهزة',
                description: 'المعمل اعتمد نتيجة جديدة، تقدر تشوفها بأمان دلوقتي.',
                action: 'عرض النتيجة',
                destination: '/results',
                Icon: FileHeart,
            };
        case 'sample_collected':
            return {
                title: 'تم استلام العينة',
                description: 'اتحدّثت حالة عينتك، تقدر تتابع تفاصيل الطلب.',
                action: 'متابعة الطلب',
                destination: '/bookings',
                Icon: FlaskConical,
            };
        case 'home_collection_created':
            return {
                title: 'طلب السحب المنزلي اتسجل',
                description: 'المعمل استلم طلبك، وتقدر تتابع حالته من طلباتي.',
                action: 'متابعة الطلب',
                destination: '/bookings',
                Icon: House,
            };
        case 'order_created':
            return {
                title: 'طلب جديد اتسجل',
                description: 'تقدر تتابع حالة التحاليل من صفحة طلباتي.',
                action: 'متابعة الطلب',
                destination: '/bookings',
                Icon: ClipboardList,
            };
    }
}

export function AppShell() {
    const { user, profile, signOut, token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [signOutError, setSignOutError] = useState('');
    const [realtimeStatus, setRealtimeStatus] = useState<'disabled' | 'connecting' | 'connected' | 'disconnected' | 'error'>('disabled');
    const [latestUpdate, setLatestUpdate] = useState<PatientPortalUpdate | null>(null);
    const [pushEnabled, setPushEnabled] = useState(isPatientPushEnabled);
    const [pushBusy, setPushBusy] = useState(false);
    const [pushError, setPushError] = useState('');
    const pushUnsubscribe = useRef<(() => void) | null>(null);
    const pushConfigured = isPatientPushConfigured();

    const handlePushMessage = useCallback(() => {
        window.dispatchEvent(new CustomEvent(PATIENT_PORTAL_UPDATE_EVENT));
    }, []);

    useEffect(() => {
        if (!token || !pushEnabled || pushUnsubscribe.current) {
            return;
        }

        let active = true;
        let unsubscribe: () => void = () => {};

        void restorePatientPush(token, handlePushMessage)
            .then((stopListening) => {
                if (active) {
                    unsubscribe = stopListening;
                    pushUnsubscribe.current = stopListening;
                } else {
                    stopListening();
                }
            })
            .catch((error: unknown) => {
                console.error('Unable to restore patient push notifications.', error);
                setPushError(error instanceof Error ? error.message : 'تعذّر تفعيل الإشعارات.');
            });

        return () => {
            active = false;
            unsubscribe();
            if (pushUnsubscribe.current === unsubscribe) {
                pushUnsubscribe.current = null;
            }
        };
    }, [handlePushMessage, pushEnabled, token]);

    useEffect(() => {
        if (!token || !profile) {
            setRealtimeStatus('disabled');
            setLatestUpdate(null);
            return;
        }

        let echo: ReturnType<typeof createPatientEcho>;
        let toastTimer = 0;

        try {
            echo = createPatientEcho(token);
        } catch (error) {
            console.error('Unable to configure patient realtime updates.', error);
            setRealtimeStatus('error');
            return;
        }

        if (!echo) {
            setRealtimeStatus('disabled');
            return;
        }

        setRealtimeStatus('connecting');
        const channelName = `patients.${profile.id}`;
        const connection = echo.connector.pusher.connection;
        const channel = echo.private(channelName);
        const onConnectionChange = ({ current }: { current: string }) => {
            setRealtimeStatus(current === 'connected' ? 'connected'
                : current === 'connecting' || current === 'initialized' ? 'connecting'
                    : 'disconnected');
        };

        connection.bind('state_change', onConnectionChange);
        channel
            .subscribed(() => setRealtimeStatus('connected'))
            .error((error: unknown) => {
                console.error('Unable to subscribe to patient realtime updates.', error);
                setRealtimeStatus('error');
            })
            .listen('.patient.portal.updated', (payload: unknown) => {
            if (!isPatientPortalUpdate(payload)) {
                console.error('Received an invalid patient realtime update.');
                setRealtimeStatus('error');
                return;
            }

            setLatestUpdate(payload);
            window.dispatchEvent(new CustomEvent(PATIENT_PORTAL_UPDATE_EVENT));
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => setLatestUpdate(null), 8000);
        });

        return () => {
            window.clearTimeout(toastTimer);
            connection.unbind('state_change', onConnectionChange);
            echo.leave(channelName);
            echo.disconnect();
        };
    }, [profile?.id, token]);

    const updateNotification = latestUpdate
        ? getUpdateNotification(latestUpdate)
        : null;

    async function handleSignOut() {
        setSignOutError('');
        try {
            if (token && pushEnabled) {
                pushUnsubscribe.current?.();
                pushUnsubscribe.current = null;
                await disablePatientPush(token);
                setPushEnabled(false);
            }

            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            setSignOutError(error instanceof ApiError ? error.message : 'حصلت مشكلة أثناء تسجيل الخروج.');
        }
    }

    async function handlePushToggle() {
        if (!token || pushBusy || !pushConfigured) {
            return;
        }

        setPushBusy(true);
        setPushError('');

        try {
            if (pushEnabled) {
                pushUnsubscribe.current?.();
                pushUnsubscribe.current = null;
                await disablePatientPush(token);
                setPushEnabled(false);
            } else {
                const stopListening = await enablePatientPush(token, handlePushMessage);
                pushUnsubscribe.current = stopListening;
                setPushEnabled(true);
            }
        } catch (error) {
            console.error('Unable to update patient push notification settings.', error);
            setPushError(error instanceof Error ? error.message : 'تعذّر تحديث إعدادات الإشعارات.');
        } finally {
            setPushBusy(false);
        }
    }

    return (
        <div className="app-frame">
            <header className="topbar">
                <NavLink to="/home" className="brand-lockup">
                    <span className="brand-mark"><FlaskConical size={20} /></span>
                    <span><strong>معمل</strong><small>رعاية أقرب ليك</small></span>
                </NavLink>
                <div className="topbar-right">
                    <span className="online-indicator"><i /> حسابك آمن</span>
                    <span className={`realtime-indicator realtime-${realtimeStatus}`} role="status">
                        <i />
                        {realtimeStatus === 'connected' ? 'تحديث لحظي متصل'
                            : realtimeStatus === 'connecting' ? 'جاري الاتصال'
                                : realtimeStatus === 'disabled' ? 'التحديث اللحظي غير مفعّل'
                                    : realtimeStatus === 'error' ? 'تعذّر الاتصال اللحظي'
                                        : 'الاتصال اللحظي متوقف'}
                    </span>
                    <button
                        type="button"
                        className={`push-toggle ${pushEnabled ? 'push-toggle-enabled' : ''}`}
                        aria-label={pushEnabled ? 'إيقاف إشعارات الطلبات' : 'تفعيل إشعارات الطلبات'}
                        aria-pressed={pushEnabled}
                        disabled={!pushConfigured || pushBusy}
                        title={!pushConfigured ? 'إعدادات Firebase غير مكتملة' : undefined}
                        onClick={() => void handlePushToggle()}
                    >
                        {pushEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                        <span className="push-toggle-label">
                            {pushBusy ? 'جاري التحديث' : pushEnabled ? 'الإشعارات مفعلة' : 'تفعيل الإشعارات'}
                        </span>
                    </button>
                    <span className="avatar">{(profile?.full_name ?? user?.name ?? 'م').slice(0, 1)}</span>
                </div>
            </header>
            {pushError && <p className="push-error" role="alert">{pushError}</p>}
            {latestUpdate && updateNotification && (
                <section className="patient-update-toast" role="status" aria-live="polite" aria-atomic="true">
                    <span className="patient-update-icon" aria-hidden="true">
                        <updateNotification.Icon size={21} strokeWidth={1.8} />
                    </span>
                    <div className="patient-update-copy">
                        <span className="patient-update-eyebrow"><i /> تحديث جديد من المعمل</span>
                        <strong>{updateNotification.title}</strong>
                        <p>{updateNotification.description}</p>
                        <small>طلب <bdi dir="ltr">{latestUpdate.order_number}</bdi></small>
                    </div>
                    <div className="patient-update-actions">
                        <button
                            type="button"
                            className="patient-update-open"
                            onClick={() => {
                                setLatestUpdate(null);
                                navigate(updateNotification.destination);
                            }}
                        >
                            {updateNotification.action}
                            <ArrowLeft size={15} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="patient-update-dismiss"
                            aria-label="إغلاق الإشعار"
                            onClick={() => setLatestUpdate(null)}
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </div>
                </section>
            )}
            <div className="app-content">
                <aside className="desktop-nav">
                    <div className="nav-welcome">
                        <span className="welcome-icon"><Activity size={19} /></span>
                        <span><small>أهلاً بيك</small><strong>{profile?.full_name ?? user?.name}</strong></span>
                    </div>
                    <nav aria-label="القائمة الرئيسية">
                        {navigation.map(({ to, label, icon: Icon }) => (
                            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}>
                                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <button className="nav-signout" onClick={() => void handleSignOut()}>
                        <LogOut size={17} /> تسجيل الخروج
                    </button>
                </aside>
                <main className="main-panel">
                    <div className="mobile-page-title">{pageTitles[location.pathname] ?? 'بوابة المريض'}</div>
                    {signOutError && <p className="form-error" role="alert">{signOutError}</p>}
                    <Outlet />
                </main>
            </div>
            <nav className="bottom-nav" aria-label="التنقل">
                {navigation.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `bottom-link ${isActive ? 'bottom-active' : ''}`}>
                        <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
