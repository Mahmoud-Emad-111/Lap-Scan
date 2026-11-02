import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getPortalPath, type PortalSection } from '@/app/routes';
import { Icon, type IconName } from '@/components/ui/icon';
import type {
    RealtimeConnectionStatus,
    StoredDoctorReferralNotification,
} from '@/modules/laboratory/services/orderRealtime';
import type { AuthUser } from '@/modules/auth/types';

export type PortalNavigationItem = {
    id: PortalSection;
    label: string;
    icon: IconName;
};

type PortalLayoutProps = {
    children: ReactNode;
    section: PortalSection;
    title: string;
    user: AuthUser;
    roleLabel: string;
    canManagePatients: boolean;
    navigationItems: PortalNavigationItem[];
    notifications: StoredDoctorReferralNotification[];
    realtimeStatus: RealtimeConnectionStatus;
    soundNotificationsEnabled: boolean;
    onNavigate: (section: PortalSection) => void;
    onSignOut: () => void;
    onToggleSoundNotifications: () => void;
    onMarkNotificationsAsRead: () => void;
    onOpenNotification: (
        notification: StoredDoctorReferralNotification,
    ) => void;
};

export function PortalLayout({
    children,
    section,
    title,
    user,
    roleLabel,
    canManagePatients,
    navigationItems,
    notifications,
    realtimeStatus,
    soundNotificationsEnabled,
    onNavigate,
    onSignOut,
    onToggleSoundNotifications,
    onMarkNotificationsAsRead,
    onOpenNotification,
}: PortalLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const displayName = user.name.split(' ')[0] || user.name;
    const unreadCount = notifications.filter(
        (notification) => !notification.isRead,
    ).length;

    function toggleNotifications() {
        const shouldOpen = !notificationsOpen;
        setNotificationsOpen(shouldOpen);

        if (shouldOpen) {
            onMarkNotificationsAsRead();
        }
    }

    useEffect(() => {
        if (!notificationsOpen) {
            return;
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setNotificationsOpen(false);
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => {
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [notificationsOpen]);

    return (
        <div className="min-h-screen bg-transparent text-slate-800">
            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="إغلاق القائمة"
                    className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            <aside
                className={`fixed inset-y-0 right-0 z-40 flex w-[272px] flex-col border-l border-slate-200 bg-white text-slate-700 shadow-xl shadow-slate-950/5 transition-transform duration-200 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-700/15">
                        <Icon name="flask" size={21} />
                    </span>
                    <div>
                        <p className="font-bold text-slate-900">معمل</p>
                        <p className="text-[11px] text-slate-500">
                            إدارة المختبر
                        </p>
                    </div>
                </div>

                <nav
                    aria-label="القائمة الرئيسية"
                    className="grid gap-1.5 px-4 py-7"
                >
                    <p className="px-3 pb-3 text-[10px] font-bold tracking-widest text-slate-400">
                        القائمة الرئيسية
                    </p>
                    {navigationItems.map((item) => (
                        <Link
                            key={item.id}
                            to={getPortalPath(item.id)}
                            onClick={(event) => {
                                event.preventDefault();
                                onNavigate(item.id);
                                setMobileMenuOpen(false);
                            }}
                            aria-current={
                                section === item.id ? 'page' : undefined
                            }
                            className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${section === item.id ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <span
                                className={`grid size-8 place-items-center rounded-lg transition ${section === item.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-400 group-hover:text-slate-600'}`}
                            >
                                <Icon name={item.icon} size={17} />
                            </span>
                            <span>{item.label}</span>
                            {item.id === 'orders' && unreadCount > 0 && (
                                <span
                                    aria-label={`${unreadCount} طلب جديد`}
                                    className="mr-auto min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white"
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                            {section === item.id && (
                                <span className="mr-auto size-1.5 rounded-full bg-brand-500" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto grid gap-3 border-t border-slate-100 p-4">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                            {displayName.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {roleLabel}
                            </p>
                        </div>
                        <span className="size-2 rounded-full bg-emerald-500" />
                    </div>
                    <button
                        type="button"
                        onClick={onSignOut}
                        className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                        <Icon name="logout" size={17} />
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:mr-[272px]">
                <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/95 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="فتح القائمة"
                            onClick={() => setMobileMenuOpen(true)}
                            className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
                        >
                            <Icon name="menu" />
                        </button>
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                مرحباً، {displayName}
                            </p>
                            <h1 className="text-lg font-bold text-ink-950 sm:text-xl">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {canManagePatients && (
                            <>
                                <div className="relative">
                                    <button
                                        type="button"
                                        aria-label={`الإشعارات${unreadCount > 0 ? `، ${unreadCount} غير مقروء` : ''}`}
                                        aria-expanded={notificationsOpen}
                                        aria-controls="doctor-referral-notifications"
                                        onClick={toggleNotifications}
                                        className="hover:border-brand-200 relative grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                                    >
                                        <Icon name="bell" size={19} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] leading-none font-bold text-white">
                                                {unreadCount > 99
                                                    ? '99+'
                                                    : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {notificationsOpen && (
                                        <section
                                            id="doctor-referral-notifications"
                                            aria-label="إشعارات إحالات الأطباء"
                                            className="absolute left-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10"
                                        >
                                            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                                                <div>
                                                    <h2 className="text-sm font-bold text-slate-900">
                                                        إحالات جديدة
                                                    </h2>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {notifications.length}{' '}
                                                        إشعار محفوظ
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setNotificationsOpen(
                                                            false,
                                                        )
                                                    }
                                                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                                                >
                                                    إغلاق
                                                </button>
                                            </header>
                                            {notifications.length > 0 ? (
                                                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                                                    {notifications.map(
                                                        (notification) => (
                                                            <li
                                                                key={
                                                                    notification.order_id
                                                                }
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setNotificationsOpen(
                                                                            false,
                                                                        );
                                                                        onOpenNotification(
                                                                            notification,
                                                                        );
                                                                    }}
                                                                    className="flex w-full items-start gap-3 px-4 py-3 text-right transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                                                                >
                                                                    <span
                                                                        className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300' : 'bg-rose-500'}`}
                                                                    />
                                                                    <span className="min-w-0 flex-1">
                                                                        <span className="block text-sm font-semibold text-slate-800">
                                                                            إحالة
                                                                            جديدة
                                                                            من
                                                                            الطبيب
                                                                        </span>
                                                                        <span className="mt-0.5 block text-xs text-slate-600">
                                                                            رقم
                                                                            الطلب:{' '}
                                                                            <bdi dir="ltr">
                                                                                {
                                                                                    notification.order_number
                                                                                }
                                                                            </bdi>
                                                                        </span>
                                                                        <time
                                                                            dateTime={
                                                                                notification.created_at
                                                                            }
                                                                            className="mt-1 block text-[11px] text-slate-400"
                                                                        >
                                                                            {new Date(
                                                                                notification.created_at,
                                                                            ).toLocaleString(
                                                                                'ar-EG',
                                                                            )}
                                                                        </time>
                                                                    </span>
                                                                </button>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="px-4 py-8 text-center text-sm text-slate-500">
                                                    لا توجد إحالات جديدة حتى الآن.
                                                </p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNotificationsOpen(false);
                                                    onNavigate('orders');
                                                }}
                                                className="w-full border-t border-slate-100 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                                            >
                                                عرض كل الطلبات
                                            </button>
                                        </section>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    aria-pressed={soundNotificationsEnabled}
                                    aria-label={
                                        soundNotificationsEnabled
                                            ? 'إيقاف صوت التنبيه'
                                            : 'تفعيل صوت التنبيه'
                                    }
                                    onClick={onToggleSoundNotifications}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-3"
                                >
                                    <span className="sm:hidden">
                                        {soundNotificationsEnabled
                                            ? 'الصوت يعمل'
                                            : 'تفعيل الصوت'}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {soundNotificationsEnabled
                                            ? 'إيقاف صوت التنبيه'
                                            : 'تفعيل صوت التنبيه'}
                                    </span>
                                </button>
                                <span
                                    role="status"
                                    className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex ${
                                        realtimeStatus === 'connected'
                                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                                            : 'border-amber-200 bg-amber-50 text-amber-800'
                                    }`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            realtimeStatus === 'connected'
                                                ? 'bg-emerald-500'
                                                : 'bg-amber-500'
                                        }`}
                                    />
                                    {realtimeStatus === 'connected'
                                        ? 'التنبيهات المباشرة متصلة'
                                        : realtimeStatus === 'connecting' ||
                                            realtimeStatus === 'reconnecting'
                                          ? 'جاري الاتصال بالتنبيهات'
                                          : realtimeStatus === 'failed'
                                            ? 'فشل الاتصال بالتنبيهات'
                                            : 'التنبيهات غير متصلة'}
                                </span>
                            </>
                        )}
                        <span className="grid size-10 place-items-center rounded-xl bg-brand-700 font-bold text-white shadow-sm shadow-brand-700/15">
                            {displayName.slice(0, 1)}
                        </span>
                    </div>
                </header>

                <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
