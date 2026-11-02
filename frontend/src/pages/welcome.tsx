import { useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PortalRouter } from '@/app/router';
import { Icon } from '@/components/ui/icon';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalPageContent } from '@/components/portal/PortalPageContent';
import {
    canAccessPortalSection,
    doctorSectionTitle,
    getPortalPath,
    getPortalSection,
    isDoctorPortalSection,
    type PortalSection,
} from '@/app/routes';
import type { UserRole } from '@/types/common';
import {
    isWorkflowSection,
    workflowSectionTitle,
} from '@/components/laboratory/workflow-types';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { CatalogEditorDialog } from '@/modules/laboratory/components/CatalogEditorDialog';
import { useLaboratoryCatalog } from '@/modules/laboratory/hooks/useLaboratoryCatalog';
import { usePortalAuth } from '@/modules/auth/hooks/usePortalAuth';
import { type StoredDoctorReferralNotification } from '@/modules/laboratory/services/orderRealtime';
import { useOrderNotifications } from '@/modules/laboratory/hooks/useOrderNotifications';

type Section = PortalSection;
const roleLabels: Record<UserRole, string> = {
    patient: 'مريض',
    doctor: 'طبيب',
    lab_staff: 'فريق المختبر',
    lab_admin: 'مدير المختبر',
};

export default function Welcome() {
    return <PortalRouter page={<WelcomePage />} />;
}

function WelcomePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = usePortalAuth();
    const {
        token,
        user,
        booting,
        email: loginEmail,
        setEmail: setLoginEmail,
        password: loginPassword,
        setPassword: setLoginPassword,
        loginError,
        showDemoCredentials,
        busy: loginBusy,
        handleLogin,
        handleLogout,
    } = auth;
    const section = getPortalSection(location.pathname) ?? 'overview';
    const initialOrderSearch =
        section === 'orders'
            ? (new URLSearchParams(location.search).get('order') ?? undefined)
            : undefined;
    const catalog = useLaboratoryCatalog({
        token,
        section,
        canAccessSection:
            user !== null && canAccessPortalSection(user.role, section),
        canManagePatients:
            user?.role === 'lab_staff' || user?.role === 'lab_admin',
    });
    const {
        patients,
        tests,
        branches,
        summary: dashboardSummary,
        loading: loadingSection,
        error: loadError,
        setError: setLoadError,
        query,
        setQuery,
        editor,
        setEditor,
        editorErrors,
        setEditorErrors,
        busy: editorBusy,
        activePage,
        loadSection,
        openEditor,
        saveEditor,
        editCatalogRecord,
    } = catalog;
    const canManagePatients =
        user?.role === 'lab_staff' || user?.role === 'lab_admin';
    const canManageBranches = user?.role === 'lab_admin';
    const canManageUsers = user?.role === 'lab_admin';

    const {
        notifications: orderNotifications,
        realtimeRevision: orderRealtimeRevision,
        realtimeStatus,
        soundEnabled: soundNotificationsEnabled,
        markNotificationsAsRead: synchronizeReadNotifications,
        toggleSoundNotifications,
    } = useOrderNotifications({ token, user });

    function openOrderNotification(
        notification: StoredDoctorReferralNotification,
    ) {
        void navigate(
            `${getPortalPath('orders')}?order=${encodeURIComponent(notification.order_number)}`,
        );
    }

    const navItems = useMemo(
        () => [
            {
                id: 'overview' as const,
                label: 'نظرة عامة',
                icon: 'dashboard' as const,
            },
            ...(canManagePatients
                ? [
                      {
                          id: 'patients' as const,
                          label: 'المرضى',
                          icon: 'users' as const,
                      },
                  ]
                : []),
            {
                id: 'tests' as const,
                label: 'كتالوج التحاليل',
                icon: 'beaker' as const,
            },
            ...(canManagePatients
                ? [
                      {
                          id: 'branches' as const,
                          label: 'الفروع',
                          icon: 'branch' as const,
                      },
                      {
                          id: 'orders' as const,
                          label: 'الطلبات',
                          icon: 'clipboard' as const,
                      },
                      {
                          id: 'samples' as const,
                          label: 'العينات',
                          icon: 'flask' as const,
                      },
                      {
                          id: 'results' as const,
                          label: 'النتائج',
                          icon: 'file' as const,
                      },
                      {
                          id: 'reports' as const,
                          label: 'التقارير',
                          icon: 'report' as const,
                      },
                  ]
                : []),
            ...(canManageUsers
                ? [
                      {
                          id: 'users' as const,
                          label: 'المستخدمون',
                          icon: 'shield' as const,
                      },
                      {
                          id: 'doctor-review' as const,
                          label: 'اعتماد الأطباء',
                          icon: 'check' as const,
                      },
                      {
                          id: 'referral-discounts' as const,
                          label: 'خصومات الإحالات',
                          icon: 'report' as const,
                      },
                  ]
                : []),
            ...(user?.role === 'doctor'
                ? [
                      {
                          id: 'doctor-profile' as const,
                          label: 'ملفي الطبي',
                          icon: 'shield' as const,
                      },
                      {
                          id: 'doctor-orders' as const,
                          label: 'إحالاتي الطبية',
                          icon: 'clipboard' as const,
                      },
                      {
                          id: 'doctor-new-referral' as const,
                          label: 'إحالة جديدة',
                          icon: 'plus' as const,
                      },
                  ]
                : []),
            ...(user?.role === 'patient'
                ? [
                      {
                          id: 'patient-orders' as const,
                          label: 'طلباتي',
                          icon: 'clipboard' as const,
                      },
                      {
                          id: 'patient-results' as const,
                          label: 'نتائجي',
                          icon: 'file' as const,
                      },
                  ]
                : []),
        ],
        [canManagePatients, canManageUsers, user?.role],
    );

    function navigateToSection(nextSection: Section) {
        setQuery('');
        setLoadError('');
        void navigate(getPortalPath(nextSection));
    }

    if (booting) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#f3f6f5]">
                <div className="grid justify-items-center gap-4 text-sm text-slate-500">
                    <span className="grid size-16 place-items-center rounded-[1.4rem] bg-white text-brand-700 shadow-[0_14px_40px_-22px_rgba(17,107,94,0.5)]">
                        <Icon name="flask" size={27} />
                    </span>
                    <span className="size-6 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
                    جارٍ تجهيز مساحة العمل...
                </div>
            </main>
        );
    }

    if (!user || !token) {
        return (
            <LoginPage
                email={loginEmail}
                password={loginPassword}
                error={loginError}
                busy={loginBusy}
                showDemoCredentials={showDemoCredentials}
                onEmailChange={setLoginEmail}
                onPasswordChange={setLoginPassword}
                onSubmit={handleLogin}
            />
        );
    }

    if (!canAccessPortalSection(user.role, section)) {
        return <Navigate to={getPortalPath('overview')} replace />;
    }

    const pageTitle = isDoctorPortalSection(section)
        ? doctorSectionTitle(section)
        : section === 'doctor-review'
          ? 'اعتماد الأطباء'
          : section === 'referral-discounts'
            ? 'خصومات الإحالات'
            : isWorkflowSection(section)
              ? workflowSectionTitle(section)
              : section === 'patients'
                ? 'المرضى'
                : section === 'tests'
                  ? 'كتالوج التحاليل'
                  : section === 'branches'
                    ? 'الفروع'
                    : 'نظرة عامة';
    return (
        <PortalLayout
            section={section}
            title={pageTitle}
            user={user}
            roleLabel={roleLabels[user.role]}
            canManagePatients={canManagePatients}
            navigationItems={navItems}
            notifications={orderNotifications}
            realtimeStatus={realtimeStatus}
            soundNotificationsEnabled={soundNotificationsEnabled}
            onNavigate={navigateToSection}
            onSignOut={() => void handleLogout()}
            onToggleSoundNotifications={toggleSoundNotifications}
            onMarkNotificationsAsRead={synchronizeReadNotifications}
            onOpenNotification={openOrderNotification}
        >
            <>
                <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
                    <PortalPageContent
                        section={section}
                        token={token}
                        user={user}
                        roleLabel={roleLabels[user.role]}
                        initialOrderSearch={initialOrderSearch}
                        orderRealtimeRevision={orderRealtimeRevision}
                        canManagePatients={canManagePatients}
                        canManageBranches={canManageBranches}
                        testsTotal={tests?.meta.total}
                        patientsTotal={patients?.meta.total}
                        branchesTotal={branches?.meta.total}
                        summary={dashboardSummary}
                        loading={loadingSection}
                        catalogPage={activePage}
                        query={query}
                        onQueryChange={setQuery}
                        onNavigate={navigateToSection}
                        onAdd={openEditor}
                        onEdit={editCatalogRecord}
                        onPageChange={(nextSection, url) =>
                            void loadSection(nextSection, url)
                        }
                        loadError={loadError}
                        onDismissError={() => setLoadError('')}
                    />
                </main>
                {editor && (
                    <CatalogEditorDialog
                        editor={editor}
                        errors={editorErrors}
                        busy={editorBusy}
                        onClose={() => {
                            setEditor(null);
                            setEditorErrors({});
                        }}
                        onChange={(key, value) =>
                            setEditor((current) =>
                                current
                                    ? {
                                          ...current,
                                          values: {
                                              ...current.values,
                                              [key]: value,
                                          },
                                      }
                                    : null,
                            )
                        }
                        onSubmit={saveEditor}
                    />
                )}
            </>
        </PortalLayout>
    );
}
