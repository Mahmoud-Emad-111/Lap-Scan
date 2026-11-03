import type { UserRole } from '@/types/common';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: UserRole;
};

export type LoginPayload = {
    identifier: string;
    password: string;
    device_name: string;
};

export type LoginResponse = {
    data: {
        token: string;
        user: AuthUser;
    };
};

export type CurrentUserResponse = {
    data: AuthUser;
};
