import PatientPromotionController from '@/actions/App/Http/Controllers/Api/V1/PatientPromotionController';
import TestController from '@/actions/App/Http/Controllers/Api/V1/TestController';
import { apiRequest } from '@/lib/api-client';
import type { LabTest } from '@/modules/laboratory/types';
import type { ApiPage } from '@/types/api';
import type {
    PatientPromotion,
    PatientPromotionPage,
    PatientPromotionPayload,
} from '@/modules/patient-promotions/types';

type DataResponse<T> = { data: T };

export function fetchPatientPromotions(
    token: string,
    url?: string,
): Promise<PatientPromotionPage> {
    return apiRequest<PatientPromotionPage>(
        url ?? PatientPromotionController.index(),
        token,
    );
}

export async function fetchPromotionTests(token: string): Promise<LabTest[]> {
    const records: LabTest[] = [];
    let nextUrl: string | null = TestController.index().url;

    while (nextUrl !== null) {
        const page: ApiPage<LabTest> = await apiRequest<ApiPage<LabTest>>(
            nextUrl,
            token,
        );
        records.push(...page.data.filter((test) => test.is_active));
        nextUrl = page.links.next;
    }

    return records;
}

export async function createPatientPromotion(
    token: string,
    payload: PatientPromotionPayload,
): Promise<PatientPromotion> {
    const response = await apiRequest<DataResponse<PatientPromotion>>(
        PatientPromotionController.store(),
        token,
        payload,
    );

    return response.data;
}

export async function updatePatientPromotion(
    token: string,
    id: number,
    payload: PatientPromotionPayload,
): Promise<PatientPromotion> {
    const response = await apiRequest<DataResponse<PatientPromotion>>(
        PatientPromotionController.update.put({ patientPromotion: id }),
        token,
        payload,
    );

    return response.data;
}
