import type { UserRole } from '@/types/common';

export const PORTAL_SECTIONS = [
    'overview',
    'patients',
    'tests',
    'branches',
    'orders',
    'samples',
    'results',
    'reports',
    'users',
    'doctor-review',
    'referral-discounts',
    'doctor-profile',
    'doctor-orders',
    'doctor-new-referral',
    'patient-orders',
    'patient-results',
] as const;

export type PortalSection = (typeof PORTAL_SECTIONS)[number];

const LABORATORY_ROLES: UserRole[] = ['lab_staff', 'lab_admin'];

const SECTION_ROLES: Record<PortalSection, UserRole[]> = {
    overview: ['patient', 'doctor', ...LABORATORY_ROLES],
    patients: LABORATORY_ROLES,
    tests: ['patient', 'doctor', ...LABORATORY_ROLES],
    branches: LABORATORY_ROLES,
    orders: LABORATORY_ROLES,
    samples: LABORATORY_ROLES,
    results: LABORATORY_ROLES,
    reports: LABORATORY_ROLES,
    users: ['lab_admin'],
    'doctor-review': ['lab_admin'],
    'referral-discounts': ['lab_admin'],
    'doctor-profile': ['doctor'],
    'doctor-orders': ['doctor'],
    'doctor-new-referral': ['doctor'],
    'patient-orders': ['patient'],
    'patient-results': ['patient'],
};

export function getPortalPath(section: PortalSection): string {
    return section === 'overview' ? '/' : `/${section}`;
}

export function getPortalSection(pathname: string): PortalSection | null {
    if (pathname === '/') {
        return 'overview';
    }

    const section = pathname.replace(/\/+$/, '').slice(1);

    return PORTAL_SECTIONS.find((candidate) => candidate === section) ?? null;
}

export function canAccessPortalSection(
    role: UserRole,
    section: PortalSection,
): boolean {
    return SECTION_ROLES[section].includes(role);
}
