import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortalPath } from '@/app/routes';
import { useNotifications } from '@/components/ui/notification-provider';
import {
    fetchCurrentUser,
    login,
    logout,
} from '@/modules/auth/services/authApi';
import { unregisterFirebasePush } from '@/modules/notifications/services/firebasePush';
import type { AuthUser } from '@/modules/auth/types';

const TOKEN_KEY = 'lab-portal-token';

export function usePortalAuth() {
    const navigate = useNavigate();
    const { showErrorNotice, showSuccessNotice } = useNotifications();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [booting, setBooting] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showDemoCredentials, setShowDemoCredentials] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setShowDemoCredentials(
            ['localhost', '127.0.0.1'].includes(window.location.hostname),
        );

        const savedToken = window.sessionStorage.getItem(TOKEN_KEY);

        if (!savedToken) {
            setBooting(false);

            return;
        }

        let cancelled = false;

        void fetchCurrentUser(savedToken)
            .then((authenticatedUser) => {
                if (cancelled) {
                    return;
                }

                setToken(savedToken);
                setUser(authenticatedUser);
                setBooting(false);
            })
            .catch(() => {
                window.sessionStorage.removeItem(TOKEN_KEY);

                if (!cancelled) {
                    setBooting(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setLoginError('');

        try {
            const response = await login({
                email,
                password,
                device_name: 'laboratory-web',
            });

            window.sessionStorage.setItem(TOKEN_KEY, response.data.token);
            setToken(response.data.token);
            setUser(response.data.user);
            setPassword('');
            showSuccessNotice('تم تسجيل الدخول بنجاح.');
            void navigate(getPortalPath('overview'));
        } catch (error) {
            setLoginError(
                error instanceof Error ? error.message : 'تعذّر تسجيل الدخول.',
            );
        } finally {
            setBusy(false);
        }
    }

    async function handleLogout() {
        if (token) {
            try {
                await unregisterFirebasePush(token);
            } catch {
                showErrorNotice('تعذّر إزالة إشعارات هذا المتصفح من الخادم.');
            }

            try {
                await logout(token);
            } catch {
                showErrorNotice(
                    'تعذّر تأكيد تسجيل الخروج من الخادم، وتم إنهاء الجلسة على هذا الجهاز.',
                );
            }
        }

        window.sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        void navigate('/');
    }

    return {
        token,
        user,
        booting,
        email,
        setEmail,
        password,
        setPassword,
        loginError,
        showDemoCredentials,
        busy,
        handleLogin,
        handleLogout,
    };
}
