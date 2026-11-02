import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api-client';
import { currentUser, login, logout, patientProfile } from '@/features/auth/auth-api';
import type { AuthUser, PatientProfile } from '@/types/api';

const TOKEN_KEY = 'lap-patient-session';

type AuthContextValue = {
    user: AuthUser | null;
    profile: PatientProfile | null;
    token: string | null;
    loading: boolean;
    signIn: (identifier: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = window.sessionStorage.getItem(TOKEN_KEY);
        if (!savedToken) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        void Promise.all([currentUser(savedToken), patientProfile(savedToken)])
            .then(([authenticatedUser, patient]) => {
                if (!cancelled && authenticatedUser.role === 'patient') {
                    setToken(savedToken);
                    setUser(authenticatedUser);
                    setProfile(patient);
                }
            })
            .catch(() => {
                window.sessionStorage.removeItem(TOKEN_KEY);
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function signIn(identifier: string, password: string) {
        const response = await login(identifier, password);
        const nextToken = response.data.token;
        if (response.data.user.role !== 'patient') {
            await logout(nextToken);
            throw new ApiError('الحساب ده مش مخصص لبوابة المرضى.', 403);
        }

        const patient = await patientProfile(nextToken);
        window.sessionStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);
        setUser(response.data.user);
        setProfile(patient);
    }

    async function signOut() {
        const currentToken = token;
        window.sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setProfile(null);
        if (currentToken) {
            await logout(currentToken);
        }
    }

    async function refreshProfile() {
        if (token) {
            setProfile(await patientProfile(token));
        }
    }

    const value = useMemo(
        () => ({ user, profile, token, loading, signIn, signOut, refreshProfile }),
        [user, profile, token, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider.');
    }
    return context;
}
