import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    deleteToken,
    getMessaging,
    getToken,
    isSupported,
    onMessage,
    type MessagePayload,
    type Messaging,
} from 'firebase/messaging';
import PushTokenController from '@/actions/App/Http/Controllers/Api/V1/PushTokenController';
import { apiRequest } from '@/lib/api-client';

const PATIENT_PUSH_ENABLED_KEY = 'lap-patient-push-enabled';
const PATIENT_PUSH_TOKEN_KEY = 'lap-patient-push-token';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

function isConfigured(): boolean {
    return Object.values(firebaseConfig).every((value) => Boolean(value));
}

function getFirebaseApp() {
    if (!isConfigured()) {
        throw new Error('إعدادات إشعارات Firebase غير مكتملة.');
    }

    return getApps().some((app) => app.name === '[DEFAULT]')
        ? getApp()
        : initializeApp(firebaseConfig);
}

async function getMessagingContext(): Promise<{
    messaging: Messaging;
    serviceWorker: ServiceWorkerRegistration;
}> {
    if (!('serviceWorker' in navigator) || !await isSupported()) {
        throw new Error('المتصفح ده مش بيدعم إشعارات التطبيق.');
    }

    const serviceWorkerPath = import.meta.env.DEV
        ? '/firebase-messaging-sw.dev.js'
        : '/firebase-messaging-sw.js';
    const serviceWorker = await navigator.serviceWorker.register(serviceWorkerPath, {
        type: 'module',
        scope: '/',
    });

    return {
        messaging: getMessaging(getFirebaseApp()),
        serviceWorker,
    };
}

async function getRegistrationToken(messaging: Messaging, serviceWorker: ServiceWorkerRegistration): Promise<string> {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim();

    if (!vapidKey) {
        throw new Error('مفتاح Firebase VAPID غير مضبوط.');
    }

    const registrationToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: serviceWorker,
    });

    if (!registrationToken) {
        throw new Error('ماقدرناش نسجل الجهاز للإشعارات. جرّب تاني.');
    }

    return registrationToken;
}

function toPushMessage(payload: MessagePayload): MessagePayload['data'] | null {
    const data = payload.data;

    if (
        data?.type !== 'patient_portal_updated'
        || !data.title
        || !data.body
        || !data.url
    ) {
        return null;
    }

    return data;
}

async function synchronizeRegistrationToken(token: string): Promise<{ messaging: Messaging }> {
    const { messaging, serviceWorker } = await getMessagingContext();
    const registrationToken = await getRegistrationToken(messaging, serviceWorker);
    const previousToken = window.localStorage.getItem(PATIENT_PUSH_TOKEN_KEY);

    if (previousToken && previousToken !== registrationToken) {
        await apiRequest(PushTokenController.destroy(), token, { token: previousToken });
    }

    await apiRequest(PushTokenController.store(), token, { token: registrationToken });
    window.localStorage.setItem(PATIENT_PUSH_TOKEN_KEY, registrationToken);

    return { messaging };
}

export function isPatientPushConfigured(): boolean {
    return isConfigured() && Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim());
}

export function isPatientPushEnabled(): boolean {
    return window.localStorage.getItem(PATIENT_PUSH_ENABLED_KEY) === 'true';
}

export async function enablePatientPush(
    token: string,
    onNotification: (data: NonNullable<ReturnType<typeof toPushMessage>>) => void,
): Promise<() => void> {
    if (!isPatientPushConfigured()) {
        throw new Error('إعدادات إشعارات Firebase غير مكتملة.');
    }

    if (!('Notification' in window)) {
        throw new Error('المتصفح ده مش بيدعم إشعارات التطبيق.');
    }

    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error(permission === 'denied'
            ? 'إشعارات التطبيق مقفولة من إعدادات المتصفح.'
            : 'لازم تسمح بالإشعارات علشان توصلك تحديثات الطلب.');
    }

    const { messaging } = await synchronizeRegistrationToken(token);
    window.localStorage.setItem(PATIENT_PUSH_ENABLED_KEY, 'true');

    return onMessage(messaging, (payload) => {
        const data = toPushMessage(payload);
        if (data) {
            onNotification(data);
        }
    });
}

export async function restorePatientPush(
    token: string,
    onNotification: (data: NonNullable<ReturnType<typeof toPushMessage>>) => void,
): Promise<() => void> {
    if (
        !isPatientPushEnabled()
        || !('Notification' in window)
        || Notification.permission !== 'granted'
    ) {
        return () => undefined;
    }

    const { messaging } = await synchronizeRegistrationToken(token);

    return onMessage(messaging, (payload) => {
        const data = toPushMessage(payload);
        if (data) {
            onNotification(data);
        }
    });
}

export async function disablePatientPush(token: string): Promise<void> {
    const storedToken = window.localStorage.getItem(PATIENT_PUSH_TOKEN_KEY);
    let messaging: Messaging | null = null;
    let currentToken: string | null = null;

    if (
        'Notification' in window
        && Notification.permission === 'granted'
        && 'serviceWorker' in navigator
        && await isSupported()
    ) {
        const context = await getMessagingContext();
        messaging = context.messaging;
        currentToken = await getRegistrationToken(context.messaging, context.serviceWorker);
    }

    for (const registrationToken of new Set([storedToken, currentToken].filter(
        (value): value is string => Boolean(value),
    ))) {
        await apiRequest(PushTokenController.destroy(), token, { token: registrationToken });
    }

    if (messaging) {
        await deleteToken(messaging);
    }

    window.localStorage.removeItem(PATIENT_PUSH_ENABLED_KEY);
    window.localStorage.removeItem(PATIENT_PUSH_TOKEN_KEY);
}
