import LabResultController from '@/actions/App/Http/Controllers/Api/V1/LabResultController';
import OrderController from '@/actions/App/Http/Controllers/Api/V1/OrderController';
import PatientPortalController from '@/actions/App/Http/Controllers/Api/V1/PatientPortalController';
import ReportController from '@/actions/App/Http/Controllers/Api/V1/ReportController';
import SampleController from '@/actions/App/Http/Controllers/Api/V1/SampleController';
import UserController from '@/actions/App/Http/Controllers/Api/V1/UserController';
import { apiRequest } from '@/lib/api-client';
import {
    fetchBranches,
    fetchPatients,
    fetchTests,
} from '@/modules/laboratory/services/laboratoryApi';
import type {
    ApiPage,
    BranchOption,
    PatientOption,
    ReportData,
    TestOption,
    UserRole,
    WorkflowRow,
    WorkflowSection,
} from '@/components/laboratory/workflow-types';
import type { Branch, LabTest, Patient } from '@/modules/laboratory/types';

type DataResponse<T> = { data: T };

export type WorkflowUserPayload = {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    branch_ids?: number[];
};

export type WorkflowOrderPayload = {
    patient_id: number;
    branch_id: number;
    test_ids: number[];
    notes: string;
};

export type WorkflowResultPayload = {
    value: string;
    unit: string;
    reference_range: string;
    notes: string;
};

export async function fetchWorkflowRows(
    token: string,
    section: Exclude<WorkflowSection, 'reports'>,
    url?: string,
): Promise<ApiPage<WorkflowRow>> {
    const endpoint = {
        users: UserController.index(),
        orders: OrderController.index(),
        samples: SampleController.index(),
        results: OrderController.index(),
        'patient-orders': PatientPortalController.orders(),
        'patient-results': PatientPortalController.results(),
    }[section];

    return apiRequest<ApiPage<WorkflowRow>>(url ?? endpoint, token);
}

export function getWorkflowOrdersUrl(priority?: string): string {
    return OrderController.index({
        query: priority ? { priority } : {},
    }).url;
}

export async function fetchOperationsReport(
    token: string,
): Promise<ReportData> {
    const response = await apiRequest<DataResponse<ReportData>>(
        ReportController(),
        token,
    );

    return response.data;
}

export async function fetchBranchOptions(
    token: string,
): Promise<BranchOption[]> {
    return (await fetchBranches(token)).data.map(({ id, name }: Branch) => ({
        id,
        name,
    }));
}

export async function fetchPatientOptions(
    token: string,
): Promise<PatientOption[]> {
    return (await fetchPatients(token)).data.map(
        ({ id, full_name, phone }: Patient) => ({ id, full_name, phone }),
    );
}

export async function fetchTestOptions(token: string): Promise<TestOption[]> {
    return (await fetchTests(token)).data.map(
        ({ id, name, code, price }: LabTest) => ({ id, name, code, price }),
    );
}

export async function saveWorkflowUser(
    token: string,
    id: number | undefined,
    payload: WorkflowUserPayload,
): Promise<void> {
    const route = id
        ? UserController.update({ user: id })
        : UserController.store();

    await apiRequest<unknown>(route, token, payload);
}

export async function createWorkflowOrder(
    token: string,
    payload: WorkflowOrderPayload,
): Promise<void> {
    await apiRequest<unknown>(OrderController.store(), token, payload);
}

export async function saveWorkflowResult(
    token: string,
    orderItemId: number,
    payload: WorkflowResultPayload,
): Promise<void> {
    await apiRequest<unknown>(
        LabResultController.store({ orderItem: orderItemId }),
        token,
        payload,
    );
}

export async function collectWorkflowSample(
    token: string,
    sampleId: number,
): Promise<void> {
    await apiRequest<unknown>(
        SampleController.collect({ sample: sampleId }),
        token,
        {},
    );
}

export async function approveWorkflowResult(
    token: string,
    resultId: number,
): Promise<void> {
    await apiRequest<unknown>(
        LabResultController.approve({ result: resultId }),
        token,
        {},
    );
}
