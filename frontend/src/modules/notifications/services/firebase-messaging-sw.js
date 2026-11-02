import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

const firebaseApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, (payload) => {
    const notification = payload.notification;
    const title =
        notification?.title ?? payload.data?.title ?? 'طلب سحب منزلي جديد';

    void self.registration.showNotification(title, {
        body:
            notification?.body ??
            payload.data?.body ??
            'وصل طلب جديد إلى المختبر.',
        data: {
            url: payload.data?.url ?? '/home-collections',
            order_id: payload.data?.order_id,
        },
        tag: payload.data?.order_id
            ? `home-collection-${payload.data.order_id}`
            : 'home-collection',
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = new URL(
        event.notification.data?.url ?? '/home-collections',
        self.location.origin,
    ).href;

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients) => {
                for (const client of clients) {
                    if (client.url.startsWith(self.location.origin)) {
                        void client.focus();

                        if ('navigate' in client) {
                            return client.navigate(targetUrl);
                        }

                        return;
                    }
                }

                return self.clients.openWindow(targetUrl);
            }),
    );
});
