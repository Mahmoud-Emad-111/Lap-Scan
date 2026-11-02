import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/components/ui/notification-provider';
import { fetchRealtimeBranchIds } from '@/modules/laboratory/services/laboratoryApi';
import {
    claimOrderNotification,
    createOrderEcho,
    getOrderNotifications,
    isDoctorReferralCreatedPayload,
    markOrderNotificationsAsRead,
    rememberDoctorReferralNotification,
    type RealtimeConnectionStatus,
    type StoredDoctorReferralNotification,
} from '@/modules/laboratory/services/orderRealtime';
import type { AuthUser } from '@/modules/auth/types';

type UseOrderNotificationsOptions = {
    token: string | null;
    user: AuthUser | null;
};

const SOUND_PREFERENCE_KEY = 'lab-order-sound-enabled';

export function useOrderNotifications({
    token,
    user,
}: UseOrderNotificationsOptions) {
    const { showNotice, showSuccessNotice } = useNotifications();
    const [notifications, setNotifications] = useState<
        StoredDoctorReferralNotification[]
    >([]);
    const [realtimeRevision, setRealtimeRevision] = useState(0);
    const [realtimeStatus, setRealtimeStatus] =
        useState<RealtimeConnectionStatus>('disconnected');
    const [soundEnabled, setSoundEnabled] = useState(false);
    const soundEnabledRef = useRef(false);
    const seenOrderIdsRef = useRef(new Set<number>());
    const audioContextRef = useRef<AudioContext | null>(null);

    soundEnabledRef.current = soundEnabled;

    const handleDoctorReferralCreated = useCallback(
        async (payload: unknown, subscribedBranchId: number) => {
            if (
                !isDoctorReferralCreatedPayload(payload) ||
                payload.branch_id !== subscribedBranchId ||
                seenOrderIdsRef.current.has(payload.order_id)
            ) {
                return;
            }

            seenOrderIdsRef.current.add(payload.order_id);
            setRealtimeRevision((revision) => revision + 1);

            if (user?.id) {
                try {
                    setNotifications(
                        await rememberDoctorReferralNotification(
                            user.id,
                            payload,
                        ),
                    );
                } catch (storageError) {
                    console.error(
                        'Unable to save the doctor referral notification.',
                        storageError,
                    );
                    showNotice(
                        'وصلت إحالة جديدة، لكن تعذّر حفظها في قائمة الإشعارات.',
                    );
                }
            }

            try {
                if (!(await claimOrderNotification(payload.order_id))) {
                    return;
                }
            } catch (notificationError) {
                console.error(
                    'Unable to deduplicate a doctor referral notification across tabs.',
                    notificationError,
                );
            }

            const message = `إحالة جديدة للمعمل برقم ${payload.order_number}.`;
            const audioContext = audioContextRef.current;

            if (soundEnabledRef.current && audioContext?.state === 'running') {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                const soundStart = audioContext.currentTime;

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, soundStart);
                gain.gain.setValueAtTime(0.08, soundStart);
                gain.gain.exponentialRampToValueAtTime(0.001, soundStart + 0.2);
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                oscillator.start(soundStart);
                oscillator.stop(soundStart + 0.9);
                showNotice(message);
            } else if (soundEnabledRef.current) {
                showNotice(
                    `${message} اضغط «تفعيل الصوت» للسماح بالتنبيه الصوتي.`,
                );
            } else {
                showNotice(message);
            }
        },
        [showNotice, user?.id],
    );

    useEffect(() => {
        if (!user || (user.role !== 'lab_admin' && user.role !== 'lab_staff')) {
            setNotifications([]);

            return;
        }

        const userId = user.id;
        const storageKey = `lab-doctor-referral-notifications:${userId}`;

        try {
            setNotifications(getOrderNotifications(userId));
        } catch (storageError) {
            console.error(
                'Unable to read doctor referral notifications.',
                storageError,
            );
            showNotice('تعذّر تحميل قائمة الإشعارات المحفوظة.', 'error');
        }

        function synchronizeNotifications(event: StorageEvent) {
            if (event.key !== storageKey) {
                return;
            }

            try {
                setNotifications(getOrderNotifications(userId));
            } catch (storageError) {
                console.error(
                    'Unable to synchronize doctor referral notifications.',
                    storageError,
                );
                showNotice(
                    'تعذّر تحديث قائمة الإشعارات بين نوافذ المتصفح.',
                    'error',
                );
            }
        }

        window.addEventListener('storage', synchronizeNotifications);

        return () => {
            window.removeEventListener('storage', synchronizeNotifications);
        };
    }, [showNotice, user]);

    useEffect(() => {
        try {
            const enabled =
                window.localStorage.getItem(SOUND_PREFERENCE_KEY) === 'true';
            soundEnabledRef.current = enabled;
            setSoundEnabled(enabled);
        } catch (storageError) {
            console.error(
                'Unable to read the sound notification preference.',
                storageError,
            );
        }

        function synchronizeSoundPreference(event: StorageEvent) {
            if (event.key !== SOUND_PREFERENCE_KEY) {
                return;
            }

            const enabled = event.newValue === 'true';
            soundEnabledRef.current = enabled;
            setSoundEnabled(enabled);
        }

        window.addEventListener('storage', synchronizeSoundPreference);

        return () => {
            window.removeEventListener('storage', synchronizeSoundPreference);
        };
    }, []);

    useEffect(() => {
        if (
            !token ||
            (user?.role !== 'lab_admin' && user?.role !== 'lab_staff')
        ) {
            setRealtimeStatus('disconnected');

            return;
        }

        const authenticatedToken = token;
        let cancelled = false;
        let hasConnected = false;
        let echo: ReturnType<typeof createOrderEcho> | null = null;
        let unsubscribeFromConnection: (() => void) | undefined;

        async function connectToOrderNotifications() {
            const branchIds = await fetchRealtimeBranchIds(authenticatedToken);

            if (cancelled) {
                return;
            }

            echo = createOrderEcho(authenticatedToken);
            unsubscribeFromConnection = echo.connector.onConnectionChange(
                (status) => {
                    setRealtimeStatus(status);

                    if (status !== 'connected') {
                        return;
                    }

                    if (hasConnected) {
                        setRealtimeRevision((revision) => revision + 1);
                    } else {
                        hasConnected = true;
                    }
                },
            );

            for (const branchId of new Set(branchIds)) {
                echo.private(`branches.${branchId}.orders`).listen(
                    '.doctor.referral.created',
                    (payload: unknown) => {
                        void handleDoctorReferralCreated(payload, branchId);
                    },
                );
            }

            setRealtimeRevision((revision) => revision + 1);
        }

        void connectToOrderNotifications().catch((connectionError) => {
            if (cancelled) {
                return;
            }

            console.error(
                'Unable to initialize laboratory order notifications.',
                connectionError,
            );
            setRealtimeStatus('failed');
            showNotice(
                'تعذّر تهيئة التنبيهات المباشرة. ستظل الطلبات محفوظة ويمكن مراجعتها من شاشة الطلبات.',
                'error',
            );
        });

        return () => {
            cancelled = true;
            unsubscribeFromConnection?.();
            echo?.leaveAllChannels();
            echo?.disconnect();
        };
    }, [handleDoctorReferralCreated, showNotice, token, user?.role]);

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                void audioContextRef.current.close().catch((audioError) => {
                    console.error(
                        'Unable to close the notification audio context.',
                        audioError,
                    );
                });
            }
        };
    }, []);

    const markNotificationsAsRead = useCallback(() => {
        if (!user || (user.role !== 'lab_admin' && user.role !== 'lab_staff')) {
            return;
        }

        void markOrderNotificationsAsRead(user.id).then(
            setNotifications,
            (storageError: unknown) => {
                console.error(
                    'Unable to mark doctor referral notifications as read.',
                    storageError,
                );
                showNotice('تعذّر تحديث حالة قراءة الإشعارات.', 'error');
            },
        );
    }, [showNotice, user]);

    const toggleSoundNotifications = useCallback(() => {
        const enabled = !soundEnabledRef.current;
        soundEnabledRef.current = enabled;
        setSoundEnabled(enabled);

        try {
            window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
        } catch (storageError) {
            console.error(
                'Unable to save the sound notification preference.',
                storageError,
            );
            showNotice(
                'تعذّر حفظ إعداد صوت التنبيهات على هذا المتصفح.',
                'error',
            );
        }

        if (!enabled) {
            if (audioContextRef.current?.state === 'running') {
                void audioContextRef.current.suspend().catch((audioError) => {
                    console.error(
                        'Unable to suspend the notification sound.',
                        audioError,
                    );
                });
            }
            showNotice('تم إيقاف صوت التنبيهات.');

            return;
        }

        try {
            audioContextRef.current ??= new window.AudioContext();
            void audioContextRef.current.resume().then(
                () => showSuccessNotice('تم تفعيل صوت التنبيهات.'),
                (audioError: unknown) => {
                    console.error(
                        'The browser blocked notification audio.',
                        audioError,
                    );
                    showNotice(
                        'المتصفح لم يسمح بالصوت بعد. اضغط تفعيل الصوت مرة أخرى.',
                        'error',
                    );
                },
            );
        } catch (audioError) {
            console.error(
                'Unable to initialize notification audio.',
                audioError,
            );
            showNotice('هذا المتصفح لا يدعم صوت التنبيهات.', 'error');
        }
    }, [showNotice, showSuccessNotice]);

    return {
        notifications,
        realtimeRevision,
        realtimeStatus,
        soundEnabled,
        markNotificationsAsRead,
        toggleSoundNotifications,
    };
}
