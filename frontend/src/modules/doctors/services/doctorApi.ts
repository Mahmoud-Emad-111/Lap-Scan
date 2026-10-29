import DoctorController from '@/actions/App/Http/Controllers/Api/V1/DoctorController';
import DoctorPortalController from '@/actions/App/Http/Controllers/Api/V1/DoctorPortalController';
import DoctorProfileController from '@/actions/App/Http/Controllers/Api/V1/DoctorProfileController';
import { apiRequest, downloadAuthorizedFile } from '@/lib/api-client';
import type {
    ApiPage,
    BranchOption,
    TestOption,
} from '@/components/laboratory/workflow-types';
import type {
    DoctorOrder,
    DoctorPage,
    DoctorPatientMatch,
    DoctorProfile,
    DoctorReferralPayload,
    DoctorResult,
} from '@/modules/doctors/types';

type DataResponse<T> = { data: T };

export type DoctorListRecord = DoctorProfile;

export async function fetchDoctorProfile(
    token: string,
): Promise<DoctorProfile> {
    const response = await apiRequest<DataResponse<DoctorProfile>>(
        DoctorProfileController.show(),
        token,
    );

    return response.data;
}

export async function updateDoctorProfile(
    token: string,
    payload: Pick<
        DoctorProfile,
        'name' | 'phone' | 'specialty' | 'license_number'
    >,
): Promise<DoctorProfile> {
    const response = await apiRequest<DataResponse<DoctorProfile>>(
        DoctorProfileController.update.put(),
        token,
        payload,
    );

    return response.data;
}

export async function fetchDoctorBranches(
    token: string,
): Promise<BranchOption[]> {
    const response = await apiRequest<ApiPage<BranchOption>>(
        DoctorPortalController.branches(),
        token,
    );

    return response.data;
}

export async function fetchDoctorTests(token: string): Promise<TestOption[]> {
    const response = await apiRequest<ApiPage<TestOption>>(
        DoctorPortalController.tests(),
        token,
    );

    return response.data;
}

export async function findDoctorPatients(
    token: string,
    phone: string,
): Promise<DoctorPatientMatch[]> {
    const response = await apiRequest<DataResponse<DoctorPatientMatch[]>>(
        DoctorPortalController.patients({ query: { phone } }),
        token,
    );

    return response.data;
}

export async function fetchDoctorOrders(
    token: string,
    filters:
        | {
              priority?: string;
              search?: string;
              status?: string;
              branch_id?: string;
              from?: string;
              to?: string;
              results_available?: string;
          }
        | string = {},
): Promise<DoctorPage> {
    const response = await apiRequest<DoctorPage>(
        typeof filters === 'string'
            ? filters
            : DoctorPortalController.index({ query: filters }),
        token,
    );

    return response;
}

export async function fetchDoctorOrder(
    token: string,
    orderId: number,
): Promise<DoctorOrder> {
    const response = await apiRequest<DataResponse<DoctorOrder>>(
        DoctorPortalController.show(orderId),
        token,
    );

    return response.data;
}

export async function createDoctorReferral(
    token: string,
    payload: DoctorReferralPayload,
): Promise<DoctorOrder> {
    const response = await apiRequest<DataResponse<DoctorOrder>>(
        DoctorPortalController.store(),
        token,
        payload,
    );

    return response.data;
}

export async function fetchDoctorResult(
    token: string,
    resultId: number,
): Promise<DoctorResult> {
    const response = await apiRequest<DataResponse<DoctorResult>>(
        DoctorPortalController.result(resultId),
        token,
    );

    return response.data;
}

export async function downloadDoctorResult(
    token: string,
    resultId: number,
): Promise<void> {
    await downloadAuthorizedFile(
        DoctorPortalController.resultPdf(resultId).url,
        token,
        `lab-result-${resultId}.pdf`,
    );
}

export async function fetchDoctors(
    token: string,
    route?: string,
): Promise<ApiPage<DoctorListRecord>> {
    return apiRequest<ApiPage<DoctorListRecord>>(
        route ?? DoctorController.index(),
        token,
    );
}

export async function updateDoctorVerification(
    token: string,
    doctorId: number,
    payload: {
        verification_status: 'verified' | 'rejected' | 'suspended';
        verification_note: string | null;
    },
): Promise<DoctorProfile> {
    const response = await apiRequest<DataResponse<DoctorProfile>>(
        DoctorController.updateVerification.patch({ doctor: doctorId }),
        token,
        payload,
    );

    return response.data;
}
