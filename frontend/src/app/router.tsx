import type { ReactNode } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { PORTAL_SECTIONS, getPortalPath } from '@/app/routes';

export function PortalRouter({ page }: { page: ReactNode }) {
    return (
        <Routes>
            <Route path="/" element={page} />
            {PORTAL_SECTIONS.filter((section) => section !== 'overview').map(
                (section) => (
                    <Route
                        key={section}
                        path={getPortalPath(section)}
                        element={page}
                    />
                ),
            )}
            <Route
                path="*"
                element={
                    <main
                        className="grid min-h-screen place-items-center bg-[#f3f6f5] p-6 text-center"
                        dir="rtl"
                    >
                        <div className="grid justify-items-center gap-4">
                            <h1 className="text-2xl font-bold text-slate-900">
                                الصفحة غير موجودة
                            </h1>
                            <Link
                                to="/"
                                className="font-semibold text-brand-700 underline"
                            >
                                العودة إلى لوحة التحكم
                            </Link>
                        </div>
                    </main>
                }
            />
        </Routes>
    );
}
