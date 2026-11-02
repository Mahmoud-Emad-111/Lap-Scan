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

type CatalogPage = ApiPage<Patient> | ApiPage<LabTest> | ApiPage<Branch> | null;

type PortalPageContentProps = {
    section: PortalSection;
    token: string;
    user: AuthUser;
    roleLabel: string;
    initialOrderSearch?: string;
    orderRealtimeRevision: number;
    canManagePatients: boolean;
    canManageBranches: boolean;
    testsTotal?: number;
    patientsTotal?: number;
    branchesTotal?: number;
    summary: DashboardSummary | null;
    loading: boolean;
    catalogPage: CatalogPage;
    query: string;
    onQueryChange: (query: string) => void;
    onNavigate: (section: PortalSection) => void;
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
    orderRealtimeRevision,
    canManagePatients,
    canManageBranches,
    testsTotal,
    patientsTotal,
    branchesTotal,
    summary,
    loading,
    catalogPage,
    query,
    onQueryChange,
    onNavigate,
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
                    onNavigate={onNavigate}
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
            ) : isWorkflowSection(section) ? (
                <Suspense fallback={<PageChunkFallback />}>
                    <WorkflowSectionPage
                        section={section}
                        token={token}
                        role={user.role}
                        currentUserId={user.id}
                        orderRealtimeRevision={orderRealtimeRevision}
                        initialOrderSearch={initialOrderSearch}
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
