import type { UserRole } from '@/types/common';

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
};

export type LoginPayload = {
    email: string;
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
