import { getApps, initializeApp } from 'firebase/app';
import {
    getMessaging,
    getToken,
    isSupported,
    onMessage,
} from 'firebase/messaging';
import {
    store,
    destroy,
} from '@/actions/App/Http/Controllers/Api/V1/PushTokenController';
import { apiRequest } from '@/lib/api-client';
import firebaseMessagingWorkerUrl from './firebase-messaging-sw.js?worker&url';

const firebasePushTokenStorageKey = 'lab-firebase-push-token';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function isFirebaseConfigured(): boolean {
    return (
        Boolean(firebaseConfig.apiKey) &&
        Boolean(firebaseConfig.projectId) &&
        Boolean(firebaseConfig.messagingSenderId) &&
        Boolean(firebaseConfig.appId) &&
        Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY)
    );
}

async function getMessagingClient() {
    if (!isFirebaseConfigured()) {
        throw new Error('إعداد Firebase للمتصفح غير مكتمل.');
    }

    if (
        !('Notification' in window) ||
        !('serviceWorker' in navigator) ||
        !(await isSupported())
    ) {
        throw new Error('المتصفح لا يدعم إشعارات Firebase.');
    }

    const app =
        getApps().find((configuredApp) => configuredApp.name === 'lab-push') ??
        initializeApp(firebaseConfig, 'lab-push');
    const messaging = getMessaging(app);
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
        firebaseMessagingWorkerUrl,
        { type: 'module' },
    );

    return { messaging, serviceWorkerRegistration };
}

export function isFirebasePushConfigured(): boolean {
    return isFirebaseConfigured();
}

export function hasSavedFirebasePushToken(): boolean {
    return window.localStorage.getItem(firebasePushTokenStorageKey) !== null;
}

export async function registerFirebasePush(
    accessToken: string,
    onNotification: (data: Record<string, string> | undefined) => void,
): Promise<() => void> {
    if (!('Notification' in window)) {
        throw new Error('المتصفح لا يدعم إشعارات Firebase.');
    }

    const permission =
        Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error('اسمح بإشعارات المتصفح لتفعيل التنبيهات بالخلفية.');
    }

    const { messaging, serviceWorkerRegistration } = await getMessagingClient();
    const registrationToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration,
    });

    if (!registrationToken) {
        throw new Error('تعذّر تسجيل هذا المتصفح لاستقبال الإشعارات.');
    }

    await apiRequest(store(), accessToken, { token: registrationToken });
    window.localStorage.setItem(firebasePushTokenStorageKey, registrationToken);

    return onMessage(messaging, (payload) => {
        onNotification(payload.data);
    });
}

export async function unregisterFirebasePush(
    accessToken: string,
): Promise<void> {
    const registrationToken = window.localStorage.getItem(
        firebasePushTokenStorageKey,
    );

    if (registrationToken === null) {
        return;
    }

    await apiRequest(destroy(), accessToken, { token: registrationToken });
    window.localStorage.removeItem(firebasePushTokenStorageKey);
}
