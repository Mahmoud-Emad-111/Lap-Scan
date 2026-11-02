import AuthController from '@/actions/App/Http/Controllers/Api/V1/AuthController';
import PatientPortalController from '@/actions/App/Http/Controllers/Api/V1/PatientPortalController';
import { apiRequest } from '@/lib/api-client';
import type {
    AuthUser,
    CurrentUserResponse,
    LoginResponse,
    PatientProfile,
} from '@/types/api';

export async function login(identifier: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>(AuthController.store(), undefined, {
        identifier,
        password,
        device_name: 'patient-mobile-web',
    });
}

export async function currentUser(token: string): Promise<AuthUser> {
    const response = await apiRequest<CurrentUserResponse>(AuthController.show(), token);
    return response.data;
}

export async function patientProfile(token: string): Promise<PatientProfile> {
    const response = await apiRequest<{ data: PatientProfile }>(
        PatientPortalController.profile(),
        token,
    );
    return response.data;
}

export async function logout(token: string): Promise<void> {
    await apiRequest(AuthController.destroy(), token);
}
