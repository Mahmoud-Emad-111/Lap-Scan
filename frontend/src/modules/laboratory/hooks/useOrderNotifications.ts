import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/components/ui/notification-provider';
import { fetchRealtimeBranchIds } from '@/modules/laboratory/services/laboratoryApi';
import {
    claimOrderNotification,
    createOrderEcho,
    getHomeCollectionRequestedPayload,
    getOrderNotificationStorageKey,
    getOrderNotifications,
    isDoctorReferralCreatedPayload,
    markOrderNotificationsAsRead,
    rememberOrderNotification,
    type RealtimeConnectionStatus,
    type StoredOrderNotification,
} from '@/modules/laboratory/services/orderRealtime';
import {
    hasSavedFirebasePushToken,
    isFirebasePushConfigured,
    registerFirebasePush,
    unregisterFirebasePush,
} from '@/modules/notifications/services/firebasePush';
import type { NotificationSound } from '@/modules/notifications/notification-sounds';
import type { AuthUser } from '@/modules/auth/types';

type UseOrderNotificationsOptions = {
    token: string | null;
    user: AuthUser | null;
};

const SOUND_PREFERENCE_KEY = 'lab-order-sound-enabled';
const SOUND_STYLE_KEY = 'lab-order-sound-style';

function isNotificationSound(value: string | null): value is NotificationSound {
    return value === 'single' || value === 'double' || value === 'triple';
}

function playNotificationSound(
    audioContext: AudioContext,
    sound: NotificationSound,
) {
    const frequencies: Record<NotificationSound, number[]> = {
        single: [880],
        double: [740, 980],
        triple: [660, 830, 990],
    };
    const soundStart = audioContext.currentTime;

    frequencies[sound].forEach((frequency, index) => {
        const start = soundStart + index * 0.2;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.2);
    });
}

export function useOrderNotifications({
    token,
    user,
}: UseOrderNotificationsOptions) {
    const { showNotice, showSuccessNotice } = useNotifications();
    const [notifications, setNotifications] = useState<
        StoredOrderNotification[]
    >([]);
    const [realtimeRevision, setRealtimeRevision] = useState(0);
    const [realtimeStatus, setRealtimeStatus] =
        useState<RealtimeConnectionStatus>('disconnected');
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [notificationSound, setNotificationSound] =
        useState<NotificationSound>('single');
    const [firebasePushEnabled, setFirebasePushEnabled] = useState(false);
    const [firebasePushBusy, setFirebasePushBusy] = useState(false);
    const soundEnabledRef = useRef(false);
    const notificationSoundRef = useRef<NotificationSound>('single');
    const seenOrderIdsRef = useRef(new Set<number>());
    const audioContextRef = useRef<AudioContext | null>(null);
    const firebaseMessageUnsubscribeRef = useRef<(() => void) | null>(null);

    soundEnabledRef.current = soundEnabled;

    const showIncomingOrderNotice = useCallback(
        (message: string) => {
            const audioContext = audioContextRef.current;

            if (soundEnabledRef.current && audioContext?.state === 'running') {
                playNotificationSound(
                    audioContext,
                    notificationSoundRef.current,
                );
            }

            showNotice(message);
        },
        [showNotice],
    );

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
                        await rememberOrderNotification(
                            user.id,
                            payload,
                            'doctor_referral',
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

            showIncomingOrderNotice(
                `إحالة جديدة للمعمل برقم ${payload.order_number}.`,
            );
        },
        [showIncomingOrderNotice, showNotice, user?.id],
    );

    const handleHomeCollectionRequested = useCallback(
        async (payload: unknown, subscribedBranchId?: number) => {
            const request = getHomeCollectionRequestedPayload(payload);

            if (
                !request ||
                (subscribedBranchId !== undefined &&
                    request.branch_id !== subscribedBranchId) ||
                seenOrderIdsRef.current.has(request.order_id)
            ) {
                return;
            }

            seenOrderIdsRef.current.add(request.order_id);
            setRealtimeRevision((revision) => revision + 1);

            if (user?.id) {
                try {
                    setNotifications(
                        await rememberOrderNotification(
                            user.id,
                            request,
                            'home_collection',
                        ),
                    );
                } catch (storageError) {
                    console.error(
                        'Unable to save the home collection notification.',
                        storageError,
                    );
                    showNotice(
                        'وصل طلب سحب منزلي جديد، لكن تعذّر حفظه في قائمة الإشعارات.',
                    );
                }
            }

            try {
                if (!(await claimOrderNotification(request.order_id))) {
                    return;
                }
            } catch (notificationError) {
                console.error(
                    'Unable to deduplicate a home collection notification across tabs.',
                    notificationError,
                );
            }

            showIncomingOrderNotice(
                `طلب سحب منزلي جديد للمعمل برقم ${request.order_number}.`,
            );
        },
        [showIncomingOrderNotice, showNotice, user?.id],
    );

    useEffect(() => {
        if (!user || (user.role !== 'lab_admin' && user.role !== 'lab_staff')) {
            setNotifications([]);

            return;
        }

        const userId = user.id;
        const storageKey = getOrderNotificationStorageKey(userId);

        try {
            setNotifications(getOrderNotifications(userId));
        } catch (storageError) {
            console.error(
                'Unable to read laboratory notifications.',
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
                    'Unable to synchronize laboratory notifications.',
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
        try {
            const savedSound = window.localStorage.getItem(SOUND_STYLE_KEY);

            if (isNotificationSound(savedSound)) {
                notificationSoundRef.current = savedSound;
                setNotificationSound(savedSound);
            }
        } catch (storageError) {
            console.error(
                'Unable to read the notification sound preference.',
                storageError,
            );
            showNotice('تعذّر تحميل نغمة التنبيه المحفوظة.', 'error');
        }

        function synchronizeNotificationSound(event: StorageEvent) {
            if (event.key !== SOUND_STYLE_KEY) {
                return;
            }

            const sound = isNotificationSound(event.newValue)
                ? event.newValue
                : 'single';
            notificationSoundRef.current = sound;
            setNotificationSound(sound);
        }

        window.addEventListener('storage', synchronizeNotificationSound);

        return () => {
            window.removeEventListener('storage', synchronizeNotificationSound);
        };
    }, [showNotice]);

    useEffect(() => {
        if (
            !token ||
            (user?.role !== 'lab_admin' && user?.role !== 'lab_staff') ||
            !isFirebasePushConfigured() ||
            typeof Notification === 'undefined' ||
            Notification.permission !== 'granted'
        ) {
            setFirebasePushEnabled(false);

            return;
        }

        try {
            if (!hasSavedFirebasePushToken()) {
                setFirebasePushEnabled(false);

                return;
            }
        } catch (storageError) {
            console.error(
                'Unable to read the Firebase push registration.',
                storageError,
            );
            showNotice('تعذّر قراءة إعداد إشعارات المتصفح.', 'error');

            return;
        }

        let cancelled = false;
        let unsubscribe: (() => void) | undefined;

        void registerFirebasePush(token, (data) => {
            if (data?.type === 'home_collection_requested') {
                void handleHomeCollectionRequested(data);
            }
        })
            .then((stopListening) => {
                if (cancelled) {
                    stopListening();

                    return;
                }

                unsubscribe = stopListening;
                firebaseMessageUnsubscribeRef.current?.();
                firebaseMessageUnsubscribeRef.current = stopListening;
                setFirebasePushEnabled(true);
            })
            .catch((registrationError: unknown) => {
                if (!cancelled) {
                    console.error(
                        'Unable to restore Firebase push notifications.',
                        registrationError,
                    );
                    setFirebasePushEnabled(false);
                    showNotice(
                        registrationError instanceof Error
                            ? registrationError.message
                            : 'تعذّر استعادة إشعارات Firebase.',
                        'error',
                    );
                }
            });

        return () => {
            cancelled = true;
            unsubscribe?.();
            if (firebaseMessageUnsubscribeRef.current === unsubscribe) {
                firebaseMessageUnsubscribeRef.current = null;
            }
        };
    }, [handleHomeCollectionRequested, showNotice, token, user?.role]);

    const toggleFirebasePushNotifications = useCallback(async () => {
        if (!token || firebasePushBusy) {
            return;
        }

        setFirebasePushBusy(true);

        try {
            if (firebasePushEnabled) {
                await unregisterFirebasePush(token);
                firebaseMessageUnsubscribeRef.current?.();
                firebaseMessageUnsubscribeRef.current = null;
                setFirebasePushEnabled(false);
                showNotice('تم إيقاف إشعارات المتصفح.');
            } else {
                const stopListening = await registerFirebasePush(
                    token,
                    (data) => {
                        if (data?.type === 'home_collection_requested') {
                            void handleHomeCollectionRequested(data);
                        }
                    },
                );
                firebaseMessageUnsubscribeRef.current?.();
                firebaseMessageUnsubscribeRef.current = stopListening;
                setFirebasePushEnabled(true);
                showSuccessNotice('تم تفعيل إشعارات المتصفح بالخلفية.');
            }
        } catch (pushError: unknown) {
            console.error(
                'Unable to update Firebase push notifications.',
                pushError,
            );
            showNotice(
                pushError instanceof Error
                    ? pushError.message
                    : 'تعذّر تحديث إشعارات المتصفح.',
                'error',
            );
        } finally {
            setFirebasePushBusy(false);
        }
    }, [
        firebasePushBusy,
        firebasePushEnabled,
        handleHomeCollectionRequested,
        showNotice,
        showSuccessNotice,
        token,
    ]);

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
                echo.private(`branches.${branchId}.orders`).listen(
                    '.home.collection.requested',
                    (payload: unknown) => {
                        void handleHomeCollectionRequested(payload, branchId);
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
    }, [
        handleDoctorReferralCreated,
        handleHomeCollectionRequested,
        showNotice,
        token,
        user?.role,
    ]);

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

    const changeNotificationSound = useCallback(
        (sound: NotificationSound) => {
            try {
                window.localStorage.setItem(SOUND_STYLE_KEY, sound);
                notificationSoundRef.current = sound;
                setNotificationSound(sound);
            } catch (storageError) {
                console.error(
                    'Unable to save the notification sound preference.',
                    storageError,
                );
                showNotice('تعذّر حفظ نغمة التنبيه على هذا المتصفح.', 'error');
            }
        },
        [showNotice],
    );

    const previewNotificationSound = useCallback(async () => {
        try {
            audioContextRef.current ??= new window.AudioContext();
            await audioContextRef.current.resume();
            playNotificationSound(
                audioContextRef.current,
                notificationSoundRef.current,
            );
        } catch (audioError) {
            console.error(
                'Unable to preview the notification sound.',
                audioError,
            );
            showNotice(
                'تعذّر تشغيل معاينة الصوت. تحقق من إعدادات المتصفح.',
                'error',
            );
        }
    }, [showNotice]);

    return {
        notifications,
        realtimeRevision,
        realtimeStatus,
        soundEnabled,
        notificationSound,
        firebasePushEnabled,
        firebasePushBusy,
        firebasePushAvailable: isFirebasePushConfigured(),
        markNotificationsAsRead,
        toggleSoundNotifications,
        changeNotificationSound,
        previewNotificationSound,
        toggleFirebasePushNotifications,
    };
}
