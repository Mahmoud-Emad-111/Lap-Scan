import type { RouteDefinition } from '@/wayfinder';
import type { ApiData } from '@/types/api';

type ApiRoute = Pick<RouteDefinition<'get' | 'post' | 'put' | 'patch' | 'delete'>, 'url' | 'method'>;
type ValidationErrors = Record<string, string[]>;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '';

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly validationErrors: ValidationErrors = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function apiUrl(route: ApiRoute | string): string {
    const path = typeof route === 'string' ? route : route.url;
    return apiBaseUrl ? new URL(path, `${apiBaseUrl}/`).toString() : path;
}

export async function apiRequest<T>(
    route: ApiRoute,
    token?: string,
    body?: Record<string, unknown>,
): Promise<T> {
    const headers = new Headers({ Accept: 'application/json' });
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (body) {
        headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
        response = await fetch(apiUrl(route), {
            method: route.method.toUpperCase(),
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'same-origin',
        });
    } catch {
        throw new ApiError('مش قادرين نتصل بالخادم دلوقتي. جرّب تاني.', 0);
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const error = typeof payload === 'object' && payload !== null
            ? payload as { message?: string; errors?: ValidationErrors }
            : {};
        throw new ApiError(
            error.message ?? 'حصلت مشكلة أثناء تنفيذ الطلب.',
            response.status,
            error.errors ?? {},
        );
    }

    return payload as T;
}

export async function downloadPatientResult(
    route: ApiRoute,
    token: string,
    filename: string,
): Promise<void> {
    let response: Response;
    try {
        response = await fetch(apiUrl(route), {
            headers: {
                Accept: 'application/pdf',
                Authorization: `Bearer ${token}`,
            },
        });
    } catch {
        throw new ApiError('مش قادرين نتصل بالخادم دلوقتي. جرّب تاني.', 0);
    }

    if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message = typeof payload === 'object' && payload !== null && 'message' in payload
            ? String(payload.message)
            : 'تعذّر تحميل التقرير.';
        throw new ApiError(message, response.status);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function unwrapData<T>(response: ApiData<T>): T {
    return response.data;
}
