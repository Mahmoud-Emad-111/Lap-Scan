import type { RouteDefinition } from '@/wayfinder';

type ApiRoute = Pick<
    RouteDefinition<'get' | 'post' | 'put' | 'patch' | 'delete'>,
    'url' | 'method'
>;

export type ApiValidationErrors = Record<string, string[]>;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '';

function resolveApiUrl(route: ApiRoute | string): string {
    const url = typeof route === 'string' ? route : route.url;

    return apiBaseUrl ? new URL(url, `${apiBaseUrl}/`).toString() : url;
}

export class ApiError extends Error {
    status: number;
    validationErrors: ApiValidationErrors;

    constructor(
        message: string,
        status: number,
        validationErrors: ApiValidationErrors = {},
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.validationErrors = validationErrors;
    }
}

export async function apiRequest<T>(
    route: ApiRoute | string,
    token?: string,
    body?: Record<string, unknown>,
): Promise<T> {
    const url = resolveApiUrl(route);
    const method =
        typeof route === 'string' ? (body ? 'POST' : 'GET') : route.method;
    const headers = new Headers({
        Accept: 'application/json',
    });

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (body) {
        headers.set('Content-Type', 'application/json');
    }

    let response: Response;

    try {
        response = await fetch(resolveApiUrl(url), {
            method: method.toUpperCase(),
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'same-origin',
        });
    } catch {
        throw new ApiError(
            'تعذّر الاتصال بالخادم. تحقّق من الاتصال ثم أعد المحاولة.',
            0,
        );
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const errorPayload =
            typeof payload === 'object' && payload !== null
                ? (payload as {
                      message?: string;
                      errors?: ApiValidationErrors;
                  })
                : {};

        throw new ApiError(
            errorPayload.message ?? 'حدث خطأ أثناء تنفيذ الطلب.',
            response.status,
            errorPayload.errors ?? {},
        );
    }

    return payload as T;
}

export async function downloadAuthorizedFile(
    url: string,
    token: string,
    filename: string,
): Promise<void> {
    let response: Response;

    try {
        response = await fetch(url, {
            headers: {
                Accept: 'application/pdf',
                Authorization: `******`,
            },
            credentials: 'same-origin',
        });
    } catch {
        throw new ApiError(
            'تعذّر الاتصال بالخادم. تحقّق من الاتصال ثم أعد المحاولة.',
            0,
        );
    }

    if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const errorPayload =
            typeof payload === 'object' && payload !== null
                ? (payload as {
                      message?: string;
                      errors?: ApiValidationErrors;
                  })
                : {};

        throw new ApiError(
            errorPayload.message ?? 'تعذّر تنزيل الملف.',
            response.status,
            errorPayload.errors ?? {},
        );
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
}
