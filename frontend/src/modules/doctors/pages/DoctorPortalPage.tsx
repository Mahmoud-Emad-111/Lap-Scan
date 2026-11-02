import { DoctorOrdersPage } from '@/modules/doctors/pages/DoctorOrdersPage';
import { DoctorProfilePage } from '@/modules/doctors/pages/DoctorProfilePage';
import { NewDoctorReferralPage } from '@/modules/doctors/pages/NewDoctorReferralPage';
import type { DoctorPortalSection } from '@/app/routes';

export function DoctorPortalPage({
    section,
    token,
}: {
    section: DoctorPortalSection;
    token: string;
}) {
    if (section === 'doctor-profile') {
        return <DoctorProfilePage token={token} />;
    }

    if (section === 'doctor-new-referral') {
        return <NewDoctorReferralPage token={token} />;
    }

    return <DoctorOrdersPage token={token} />;
}
