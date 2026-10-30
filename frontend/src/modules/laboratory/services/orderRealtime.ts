import Echo, { type ConnectionStatus } from 'laravel-echo';
import Pusher from 'pusher-js';
import { resolveApiUrl } from '@/lib/api-client';

export type DoctorReferralCreatedPayload = {
    order_id: number;
    branch_id: number;
    order_number: string;
    created_at: string;
};

export type StoredDoctorReferralNotification = DoctorReferralCreatedPayload & {
    isRead: boolean;
};

const ORDER_NOTIFICATION_HISTORY_LIMIT = 30;

function isStoredDoctorReferralNotification(
    notification: unknown,
): notification is StoredDoctorReferralNotification {
    return (
        isDoctorReferralCreatedPayload(notification) &&
        'isRead' in notification &&
        typeof notification.isRead === 'boolean'
    );
}

function notificationStorageKey(userId: number): string {
    return `lab-doctor-referral-notifications:${userId}`;
}

function readOrderNotifications(
    userId: number,
): StoredDoctorReferralNotification[] {
    const stored = window.localStorage.getItem(notificationStorageKey(userId));

    if (stored === null) {
        return [];
    }

    const notifications: unknown = JSON.parse(stored);

    if (
        !Array.isArray(notifications) ||
        !notifications.every(isStoredDoctorReferralNotification)
    ) {
        throw new Error('Stored doctor referral notifications are invalid.');
    }

    return notifications.slice(0, ORDER_NOTIFICATION_HISTORY_LIMIT);
}

export function getOrderNotifications(
    userId: number,
): StoredDoctorReferralNotification[] {
    return readOrderNotifications(userId);
}

export async function rememberDoctorReferralNotification(
    userId: number,
    payload: DoctorReferralCreatedPayload,
): Promise<StoredDoctorReferralNotification[]> {
    const remember = (): StoredDoctorReferralNotification[] => {
        const notifications = readOrderNotifications(userId);

        if (
            notifications.some(({ order_id }) => order_id === payload.order_id)
        ) {
            return notifications;
        }

        const updatedNotifications = [
            { ...payload, isRead: false },
            ...notifications,
        ].slice(0, ORDER_NOTIFICATION_HISTORY_LIMIT);

        window.localStorage.setItem(
            notificationStorageKey(userId),
            JSON.stringify(updatedNotifications),
        );

        return updatedNotifications;
    };

    if ('locks' in navigator) {
        return navigator.locks.request(
            `lap-order-notification-history-${userId}`,
            remember,
        );
    }

    return remember();
}

export async function markOrderNotificationsAsRead(
    userId: number,
): Promise<StoredDoctorReferralNotification[]> {
    const markAsRead = (): StoredDoctorReferralNotification[] => {
        const notifications = readOrderNotifications(userId).map(
            (notification) => ({ ...notification, isRead: true }),
        );

        window.localStorage.setItem(
            notificationStorageKey(userId),
            JSON.stringify(notifications),
        );

        return notifications;
    };

    if ('locks' in navigator) {
        return navigator.locks.request(
            `lap-order-notification-history-${userId}`,
            markAsRead,
        );
    }

    return markAsRead();
}

export function createOrderEcho(token: string): Echo<'reverb'> {
    const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
    const defaultPort = scheme === 'https' ? 443 : 8082;

    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY ?? '',
        Pusher,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? defaultPort),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? defaultPort),
        forceTLS: scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: resolveApiUrl('/api/broadcasting/auth'),
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}

export function isDoctorReferralCreatedPayload(
    payload: unknown,
): payload is DoctorReferralCreatedPayload {
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }

    const event = payload as Record<string, unknown>;

    return (
        typeof event.order_id === 'number' &&
        Number.isSafeInteger(event.order_id) &&
        typeof event.branch_id === 'number' &&
        Number.isSafeInteger(event.branch_id) &&
        typeof event.order_number === 'string' &&
        typeof event.created_at === 'string'
    );
}

export async function claimOrderNotification(
    orderId: number,
): Promise<boolean> {
    const claim = (): boolean => {
        const key = 'lap-notified-doctor-order-ids';
        const stored = window.localStorage.getItem(key);
        const seenIds: unknown = stored ? JSON.parse(stored) : [];

        if (
            !Array.isArray(seenIds) ||
            !seenIds.every((seenId) => Number.isSafeInteger(seenId))
        ) {
            throw new Error('Stored realtime notification IDs are invalid.');
        }

        if (seenIds.includes(orderId)) {
            return false;
        }

        window.localStorage.setItem(
            key,
            JSON.stringify([...seenIds, orderId].slice(-500)),
        );

        return true;
    };

    if ('locks' in navigator) {
        return navigator.locks.request('lap-order-notification', claim);
    }

    return claim();
}

export type RealtimeConnectionStatus = ConnectionStatus;
