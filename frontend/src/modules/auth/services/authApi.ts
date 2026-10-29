import AuthController from '@/actions/App/Http/Controllers/Api/V1/AuthController';
import { apiRequest } from '@/lib/api-client';
import type {
    AuthUser,
    CurrentUserResponse,
    LoginPayload,
    LoginResponse,
} from '@/modules/auth/types';

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
    const response = await apiRequest<CurrentUserResponse>(
        AuthController.show(),
        token,
    );

    return response.data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    return apiRequest<LoginResponse>(
        AuthController.store(),
        undefined,
        payload,
    );
}

export async function logout(token: string): Promise<void> {
    await apiRequest<unknown>(AuthController.destroy(), token);
}
