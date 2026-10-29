import { DoctorOrdersPage } from '@/modules/doctors/pages/DoctorOrdersPage';
import { DoctorProfilePage } from '@/modules/doctors/pages/DoctorProfilePage';
import { NewDoctorReferralPage } from '@/modules/doctors/pages/NewDoctorReferralPage';

export type DoctorPortalSection =
    | 'doctor-profile'
    | 'doctor-orders'
    | 'doctor-new-referral';

export function isDoctorPortalSection(
    section: string,
): section is DoctorPortalSection {
    return ['doctor-profile', 'doctor-orders', 'doctor-new-referral'].includes(
        section,
    );
}

export function doctorSectionTitle(section: DoctorPortalSection): string {
    if (section === 'doctor-profile') {
        return 'ملفي الطبي والتحقق';
    }

    return section === 'doctor-new-referral' ? 'إحالة جديدة' : 'إحالاتي الطبية';
}

export function DoctorPortalPage({
    section,
    token,
    onNotice,
}: {
    section: DoctorPortalSection;
    token: string;
    onNotice: (message: string) => void;
}) {
    if (section === 'doctor-profile') {
        return <DoctorProfilePage token={token} onNotice={onNotice} />;
    }

    if (section === 'doctor-new-referral') {
        return <NewDoctorReferralPage token={token} onNotice={onNotice} />;
    }

    return <DoctorOrdersPage token={token} />;
}
