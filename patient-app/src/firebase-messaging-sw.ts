import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

interface NotificationClickEvent extends Event {
    notification: Notification;
    waitUntil(promise: Promise<unknown>): void;
}

interface WorkerLifecycleEvent extends Event {
    waitUntil(promise: Promise<unknown>): void;
}

interface PatientWindowClient {
    url: string;
    focus(): Promise<PatientWindowClient>;
    navigate(url: string): Promise<PatientWindowClient>;
}

const serviceWorker = self as unknown as {
    addEventListener(
        type: 'install' | 'activate',
        listener: (event: WorkerLifecycleEvent) => void,
    ): void;
    addEventListener(
        type: 'notificationclick',
        listener: (event: NotificationClickEvent) => void,
    ): void;
    skipWaiting(): Promise<void>;
    clients: {
        matchAll(options: { type: 'window'; includeUncontrolled: true }): Promise<PatientWindowClient[]>;
        openWindow(url: string): Promise<PatientWindowClient | null>;
        claim(): Promise<void>;
    };
    location: Location;
    registration: ServiceWorkerRegistration;
};

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (Object.values(firebaseConfig).every(Boolean)) {
    onBackgroundMessage(getMessaging(initializeApp(firebaseConfig)), (payload) => {
        const data = payload.data;

        if (!data?.title || !data.body || !data.url) {
            return;
        }

        return serviceWorker.registration.showNotification(data.title, {
            body: data.body,
            data: { url: data.url },
            dir: 'rtl',
            lang: 'ar',
            badge: '/favicon.ico',
            icon: '/favicon.ico',
        });
    });
}

serviceWorker.addEventListener('install', (event) => {
    event.waitUntil(serviceWorker.skipWaiting());
});

serviceWorker.addEventListener('activate', (event) => {
    event.waitUntil(serviceWorker.clients.claim());
});

serviceWorker.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const path = event.notification.data?.url;
    const target = typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
        ? new URL(path, serviceWorker.location.origin)
        : new URL('/home', serviceWorker.location.origin);

    event.waitUntil((async () => {
        const windows = await serviceWorker.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        });
        const existingWindow = windows[0];

        if (existingWindow) {
            await existingWindow.navigate(target.href);
            await existingWindow.focus();
            return;
        }

        await serviceWorker.clients.openWindow(target.href);
    })());
});
