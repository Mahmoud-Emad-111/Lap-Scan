import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { AppShell } from '@/layouts/AppShell';
import { HomePage } from '@/pages/HomePage';
import { TestsPage } from '@/pages/TestsPage';
import { BookingPage } from '@/pages/BookingPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { ResultsPage } from '@/pages/ResultsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { FullPageLoader } from '@/components/Feedback';

export function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <FullPageLoader label="بنجهّز حسابك..." />;
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to="/home" replace /> : <LoginPage />}
            />
            <Route
                element={user ? <AppShell /> : <Navigate to="/login" replace />}
            >
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/tests" element={<TestsPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
        </Routes>
    );
}
