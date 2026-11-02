import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { apiUrl } from '@/lib/api-client';

export const PATIENT_PORTAL_UPDATE_EVENT = 'patient-portal-update';

export type PatientPortalUpdate = {
    order_id: number;
    order_number: string;
    order_status: 'registered' | 'processing' | 'completed' | 'cancelled';
    update_type: 'home_collection_created' | 'order_created' | 'sample_collected' | 'result_available';
    occurred_at: string;
};

export function createPatientEcho(token: string): Echo<'reverb'> | null {
    const key = import.meta.env.VITE_REVERB_APP_KEY?.trim();

    if (!key) {
        return null;
    }

    const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
    const defaultPort = scheme === 'https' ? 443 : 8080;
    const port = Number(import.meta.env.VITE_REVERB_PORT ?? defaultPort);

    if (scheme !== 'http' && scheme !== 'https') {
        throw new Error('The configured Reverb scheme is invalid.');
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('The configured Reverb port is invalid.');
    }

    return new Echo({
        broadcaster: 'reverb',
        key,
        Pusher,
        wsHost: import.meta.env.VITE_REVERB_HOST?.trim() || window.location.hostname,
        wsPort: port,
        wssPort: port,
        forceTLS: scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: apiUrl('/api/broadcasting/auth'),
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
}

export function isPatientPortalUpdate(payload: unknown): payload is PatientPortalUpdate {
    if (typeof payload !== 'object' || payload === null) {
        return false;
    }

    const update = payload as Record<string, unknown>;

    return (
        typeof update.order_id === 'number' &&
        Number.isSafeInteger(update.order_id) &&
        typeof update.order_number === 'string' &&
        ['registered', 'processing', 'completed', 'cancelled'].includes(String(update.order_status)) &&
        ['home_collection_created', 'order_created', 'sample_collected', 'result_available'].includes(String(update.update_type)) &&
        typeof update.occurred_at === 'string'
    );
}
