import { lazy, Suspense } from 'react';
import { ErrorBanner, LoadingRows } from '@/components/ui/feedback';
import type { CatalogEditor } from '@/modules/laboratory/components/CatalogEditorDialog';
import { LaboratoryCatalogPage } from '@/modules/laboratory/pages/LaboratoryCatalogPage';
import { PortalOverviewPage } from '@/modules/portal/pages/PortalOverviewPage';
import type { AuthUser } from '@/modules/auth/types';
import type { ApiPage } from '@/types/api';
import type {
    Branch,
    DashboardSummary,
    LabTest,
    Patient,
} from '@/modules/laboratory/types';
import { isDoctorPortalSection, type PortalSection } from '@/app/routes';
import { isWorkflowSection } from '@/components/laboratory/workflow-types';
import type { NotificationSound } from '@/modules/notifications/notification-sounds';

const WorkflowSectionPage = lazy(() =>
    import('@/components/laboratory/workflow-pages').then((module) => ({
        default: module.WorkflowSectionPage,
    })),
);
const DoctorPortalPage = lazy(() =>
    import('@/modules/doctors/pages/DoctorPortalPage').then((module) => ({
        default: module.DoctorPortalPage,
    })),
);
const DoctorManagementPage = lazy(() =>
    import('@/modules/doctors/pages/DoctorManagementPage').then((module) => ({
        default: module.DoctorManagementPage,
    })),
);
const ReferralDiscountRulesPage = lazy(() =>
    import('@/modules/referral-discounts/pages/ReferralDiscountRulesPage').then(
        (module) => ({
            default: module.ReferralDiscountRulesPage,
        }),
    ),
);
const PatientPromotionsPage = lazy(() =>
    import('@/modules/patient-promotions/pages/PatientPromotionsPage').then(
        (module) => ({
            default: module.PatientPromotionsPage,
        }),
    ),
);
const AppSettingsPage = lazy(() =>
    import('@/modules/settings/pages/AppSettingsPage').then((module) => ({
        default: module.AppSettingsPage,
    })),
);
const PaymentsPage = lazy(() =>
    import('@/modules/finance/pages/PaymentsPage').then((module) => ({
        default: module.PaymentsPage,
    })),
);
const ShiftsPage = lazy(() =>
    import('@/modules/shifts/pages/ShiftsPage').then((module) => ({
        default: module.ShiftsPage,
    })),
);

type CatalogPage = ApiPage<Patient> | ApiPage<LabTest> | ApiPage<Branch> | null;

type PortalPageContentProps = {
    section: PortalSection;
    token: string;
    user: AuthUser;
    roleLabel: string;
    initialOrderSearch?: string;
    initialOrderPriority?: string;
    orderRealtimeRevision: number;
    canManagePatients: boolean;
    canManageBranches: boolean;
    testsTotal?: number;
    patientsTotal?: number;
    branchesTotal?: number;
    summary: DashboardSummary | null;
    loading: boolean;
    soundNotificationsEnabled: boolean;
    notificationSound: NotificationSound;
    firebasePushAvailable: boolean;
    firebasePushEnabled: boolean;
    firebasePushBusy: boolean;
    onToggleSoundNotifications: () => void;
    onNotificationSoundChange: (sound: NotificationSound) => void;
    onPreviewNotificationSound: () => void;
    onToggleFirebasePushNotifications: () => void;
    catalogPage: CatalogPage;
    query: string;
    onQueryChange: (query: string) => void;
    onNavigate: (section: PortalSection) => void;
    onViewOrder: (orderNumber: string) => void;
    onViewUrgentOrders: () => void;
    onAdd: (kind: CatalogEditor['kind']) => void;
    onEdit: (record: Patient | LabTest | Branch) => void;
    onPageChange: (section: PortalSection, url: string) => void;
    loadError: string;
    onDismissError: () => void;
};

export function PortalPageContent({
    section,
    token,
    user,
    roleLabel,
    initialOrderSearch,
    initialOrderPriority,
    orderRealtimeRevision,
    canManagePatients,
    canManageBranches,
    testsTotal,
    patientsTotal,
    branchesTotal,
    summary,
    loading,
    soundNotificationsEnabled,
    notificationSound,
    firebasePushAvailable,
    firebasePushEnabled,
    firebasePushBusy,
    onToggleSoundNotifications,
    onNotificationSoundChange,
    onPreviewNotificationSound,
    onToggleFirebasePushNotifications,
    catalogPage,
    query,
    onQueryChange,
    onNavigate,
    onViewOrder,
    onViewUrgentOrders,
    onAdd,
    onEdit,
    onPageChange,
    loadError,
    onDismissError,
}: PortalPageContentProps) {
    return (
        <>
            {loadError && (
                <div className="mb-5">
                    <ErrorBanner
                        message={loadError}
                        onDismiss={onDismissError}
                    />
                </div>
            )}

            {section === 'overview' ? (
                <PortalOverviewPage
                    user={user}
                    roleLabel={roleLabel}
                    canManagePatients={canManagePatients}
                    testsTotal={testsTotal}
                    patientsTotal={patientsTotal}
                    branchesTotal={branchesTotal}
                    summary={summary}
                    loading={loading}
                    token={token}
                    orderRealtimeRevision={orderRealtimeRevision}
                    onNavigate={onNavigate}
                    onViewOrder={onViewOrder}
                    onViewUrgentOrders={onViewUrgentOrders}
                />
            ) : isDoctorPortalSection(section) ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <DoctorPortalPage section={section} token={token} />
                </Suspense>
            ) : section === 'doctor-review' ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <DoctorManagementPage token={token} />
                </Suspense>
            ) : section === 'referral-discounts' ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <ReferralDiscountRulesPage token={token} />
                </Suspense>
            ) : section === 'patient-promotions' ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <PatientPromotionsPage token={token} />
                </Suspense>
            ) : section === 'settings' ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <AppSettingsPage
                        token={token}
                        canManageSystemSettings={user.role === 'lab_admin'}
                        soundNotificationsEnabled={soundNotificationsEnabled}
                        notificationSound={notificationSound}
                        firebasePushAvailable={firebasePushAvailable}
                        firebasePushEnabled={firebasePushEnabled}
                        firebasePushBusy={firebasePushBusy}
                        onToggleSoundNotifications={onToggleSoundNotifications}
                        onNotificationSoundChange={onNotificationSoundChange}
                        onPreviewNotificationSound={onPreviewNotificationSound}
                        onToggleFirebasePushNotifications={
                            onToggleFirebasePushNotifications
                        }
                    />
                </Suspense>
            ) : section === 'payments' ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <PaymentsPage
                        token={token}
                        isAdministrator={user.role === 'lab_admin'}
                    />
                </Suspense>
            ) : section === 'shifts' ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <ShiftsPage
                        token={token}
                        isAdministrator={user.role === 'lab_admin'}
                        currentUserId={user.id}
                    />
                </Suspense>
            ) : isWorkflowSection(section) ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <WorkflowSectionPage
                        section={section}
                        token={token}
                        role={user.role}
                        currentUserId={user.id}
                        orderRealtimeRevision={orderRealtimeRevision}
                        initialOrderSearch={initialOrderSearch}
                        initialOrderPriority={initialOrderPriority}
                    />
                </Suspense>
            ) : isCatalogSection(section) ? (
                <LaboratoryCatalogPage
                    section={section}
                    page={catalogPage}
                    query={query}
                    loading={loading}
                    canAdd={
                        section === 'branches'
                            ? canManageBranches
                            : canManagePatients
                    }
                    canEdit={
                        section === 'branches'
                            ? canManageBranches
                            : canManagePatients
                    }
                    onQueryChange={onQueryChange}
                    onAdd={() =>
                        onAdd(
                            section === 'patients'
                                ? 'patient'
                                : section === 'tests'
                                  ? 'test'
                                  : 'branch',
                        )
                    }
                    onEdit={onEdit}
                    onPageChange={(url) => onPageChange(section, url)}
                />
            ) : null}
        </>
    );
}

function isCatalogSection(
    section: PortalSection,
): section is 'patients' | 'tests' | 'branches' {
    return (
        section === 'patients' || section === 'tests' || section === 'branches'
    );
}

function PageChunkFallback() {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <LoadingRows />
        </section>
    );
}
