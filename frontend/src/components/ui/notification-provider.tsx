import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type NoticeTone = 'error' | 'info' | 'success';

type NotificationContextValue = {
    showNotice: (message: string, tone?: NoticeTone) => void;
    showSuccessNotice: (message: string) => void;
    showErrorNotice: (message: string) => void;
    dismissNotice: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
    null,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState('');
    const [tone, setTone] = useState<NoticeTone>('info');
    const [revision, setRevision] = useState(0);

    const showNotice = useCallback(
        (nextMessage: string, nextTone: NoticeTone = 'info') => {
            setMessage(nextMessage);
            setTone(nextTone);
            setRevision((currentRevision) => currentRevision + 1);
        },
        [],
    );
    const showSuccessNotice = useCallback(
        (nextMessage: string) => showNotice(nextMessage, 'success'),
        [showNotice],
    );
    const showErrorNotice = useCallback(
        (nextMessage: string) => showNotice(nextMessage, 'error'),
        [showNotice],
    );
    const dismissNotice = useCallback(() => setMessage(''), []);
    const value = useMemo(
        () => ({
            showNotice,
            showSuccessNotice,
            showErrorNotice,
            dismissNotice,
        }),
        [dismissNotice, showErrorNotice, showNotice, showSuccessNotice],
    );

    useEffect(() => {
        if (!message) {
            return;
        }

        const timeout = window.setTimeout(dismissNotice, 4500);

        return () => window.clearTimeout(timeout);
    }, [dismissNotice, message, revision]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {message && (
                <div
                    className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] flex justify-center px-4"
                    dir="rtl"
                >
                    <div
                        key={revision}
                        role={tone === 'error' ? 'alert' : 'status'}
                        aria-live={tone === 'error' ? 'assertive' : 'polite'}
                        aria-atomic="true"
                        className={`notification-island pointer-events-auto flex w-full max-w-[26rem] items-center gap-3 rounded-2xl border bg-brand-600 px-4 py-3.5 text-white shadow-[0_16px_44px_-18px_rgba(20,54,49,0.38)] backdrop-blur-xl ${getNoticeToneClass(tone)}`}
                    >
                        <span
                            className={`grid size-10 shrink-0 place-items-center rounded-full ${getIconTone(tone)}`}
                        >
                            <NoticeIcon tone={tone} />
                        </span>
                        <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="text-xs font-bold text-white/75">
                                {getTitle(tone)}
                            </span>
                            <span className="text-sm leading-5 font-medium text-white">
                                {message}
                            </span>
                        </span>
                        <button
                            type="button"
                            aria-label="إغلاق الإشعار"
                            onClick={dismissNotice}
                            className="grid size-8 shrink-0 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            <svg
                                aria-hidden="true"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <path d="m18 6-12 12M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            'useNotifications must be used within a NotificationProvider.',
        );
    }

    return context;
}

function getTitle(tone: NoticeTone): string {
    if (tone === 'success') {
        return 'تم بنجاح';
    }

    if (tone === 'error') {
        return 'تعذّر إتمام الإجراء';
    }

    return 'إشعار جديد';
}

function getIconTone(tone: NoticeTone): string {
    if (tone === 'success') {
        return 'bg-white/15 text-white';
    }

    if (tone === 'error') {
        return 'bg-rose-500/25 text-white';
    }

    return 'bg-white/15 text-white';
}

function getNoticeToneClass(tone: NoticeTone): string {
    if (tone === 'success') {
        return 'border-emerald-200';
    }

    if (tone === 'error') {
        return 'border-rose-300/70';
    }

    return 'border-emerald-500';
}

function NoticeIcon({ tone }: { tone: NoticeTone }) {
    if (tone === 'success') {
        return (
            <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m5 12 4 4L19 6" />
            </svg>
        );
    }

    if (tone === 'error') {
        return (
            <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            >
                <path d="m18 6-12 12M6 6l12 12" />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
        </svg>
    );
}
