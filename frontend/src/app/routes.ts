import type { UserRole } from '@/types/common';

export const PORTAL_SECTIONS = [
    'overview',
    'patients',
    'tests',
    'branches',
    'orders',
    'home-collections',
    'samples',
    'results',
    'reports',
    'users',
    'doctor-review',
    'referral-discounts',
    'patient-promotions',
    'settings',
    'doctor-profile',
    'doctor-orders',
    'doctor-new-referral',
    'patient-orders',
    'patient-results',
] as const;

export type PortalSection = (typeof PORTAL_SECTIONS)[number];
export type DoctorPortalSection = Extract<
    PortalSection,
    'doctor-profile' | 'doctor-orders' | 'doctor-new-referral'
>;

const LABORATORY_ROLES: UserRole[] = ['lab_staff', 'lab_admin'];

const SECTION_ROLES: Record<PortalSection, UserRole[]> = {
    overview: ['patient', 'doctor', ...LABORATORY_ROLES],
    patients: LABORATORY_ROLES,
    tests: ['patient', 'doctor', ...LABORATORY_ROLES],
    branches: LABORATORY_ROLES,
    orders: LABORATORY_ROLES,
    'home-collections': LABORATORY_ROLES,
    samples: LABORATORY_ROLES,
    results: LABORATORY_ROLES,
    reports: LABORATORY_ROLES,
    users: ['lab_admin'],
    'doctor-review': ['lab_admin'],
    'referral-discounts': ['lab_admin'],
    'patient-promotions': ['lab_admin'],
    settings: ['lab_admin'],
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

export function isDoctorPortalSection(
    section: string,
): section is DoctorPortalSection {
    return (
        section === 'doctor-profile' ||
        section === 'doctor-orders' ||
        section === 'doctor-new-referral'
    );
}

export function doctorSectionTitle(section: DoctorPortalSection): string {
    if (section === 'doctor-profile') {
        return 'ملفي الطبي والتحقق';
    }

    return section === 'doctor-new-referral' ? 'إحالة جديدة' : 'إحالاتي الطبية';
}

export function canAccessPortalSection(
    role: UserRole,
    section: PortalSection,
): boolean {
    return SECTION_ROLES[section].includes(role);
}
