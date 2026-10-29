import BranchController from '@/actions/App/Http/Controllers/Api/V1/BranchController';
import DashboardController from '@/actions/App/Http/Controllers/Api/V1/DashboardController';
import PatientController from '@/actions/App/Http/Controllers/Api/V1/PatientController';
import TestController from '@/actions/App/Http/Controllers/Api/V1/TestController';
import { apiRequest } from '@/lib/api-client';
import type { ApiPage } from '@/types/api';
import type {
    Branch,
    BranchPayload,
    DashboardSummary,
    LabTest,
    LabTestPayload,
    Patient,
    PatientPayload,
} from '@/modules/laboratory/types';

type DataResponse<T> = { data: T };

export function fetchPatients(
    token: string,
    url?: string,
): Promise<ApiPage<Patient>> {
    return apiRequest<ApiPage<Patient>>(
        url ?? PatientController.index(),
        token,
    );
}

export function fetchTests(
    token: string,
    url?: string,
): Promise<ApiPage<LabTest>> {
    return apiRequest<ApiPage<LabTest>>(url ?? TestController.index(), token);
}

export function fetchBranches(
    token: string,
    url?: string,
): Promise<ApiPage<Branch>> {
    return apiRequest<ApiPage<Branch>>(url ?? BranchController.index(), token);
}

export async function fetchDashboardSummary(
    token: string,
): Promise<DashboardSummary> {
    const response = await apiRequest<DataResponse<DashboardSummary>>(
        DashboardController(),
        token,
    );

    return response.data;
}

export async function savePatient(
    token: string,
    id: number | undefined,
    payload: PatientPayload,
): Promise<void> {
    const route = id
        ? PatientController.update({ patient: id })
        : PatientController.store();

    await apiRequest<unknown>(route, token, payload);
}

export async function saveTest(
    token: string,
    id: number | undefined,
    payload: LabTestPayload,
): Promise<void> {
    const route = id
        ? TestController.update({ test: id })
        : TestController.store();

    await apiRequest<unknown>(route, token, payload);
}

export async function saveBranch(
    token: string,
    id: number | undefined,
    payload: BranchPayload,
): Promise<void> {
    const route = id
        ? BranchController.update({ branch: id })
        : BranchController.store();

    await apiRequest<unknown>(route, token, payload);
}
