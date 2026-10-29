import BranchController from '@/actions/App/Http/Controllers/Api/V1/BranchController';
import DoctorController from '@/actions/App/Http/Controllers/Api/V1/DoctorController';
import ReferralDiscountRuleController from '@/actions/App/Http/Controllers/Api/V1/ReferralDiscountRuleController';
import { apiRequest } from '@/lib/api-client';
import type { ApiPage } from '@/components/laboratory/workflow-types';
import type {
    ReferralDiscountBranchOption,
    ReferralDiscountDoctorOption,
    ReferralDiscountRule,
    ReferralDiscountRulePage,
    ReferralDiscountRulePayload,
} from '@/modules/referral-discounts/types';

type DataResponse<T> = { data: T };

export async function fetchReferralDiscountRules(
    token: string,
    url?: string,
): Promise<ReferralDiscountRulePage> {
    return apiRequest<ReferralDiscountRulePage>(
        url ?? ReferralDiscountRuleController.index(),
        token,
    );
}

export async function fetchReferralDiscountOptions(token: string): Promise<{
    doctors: ReferralDiscountDoctorOption[];
    branches: ReferralDiscountBranchOption[];
}> {
    const [doctors, branches] = await Promise.all([
        fetchAllPages<ReferralDiscountDoctorOption>(
            DoctorController.index().url,
            token,
        ),
        fetchAllPages<ReferralDiscountBranchOption>(
            BranchController.index().url,
            token,
        ),
    ]);

    return {
        doctors: doctors.filter(
            (doctor) => doctor.verification_status === 'verified',
        ),
        branches: branches.filter((branch) => branch.is_active),
    };
}

export async function createReferralDiscountRule(
    token: string,
    payload: ReferralDiscountRulePayload,
): Promise<ReferralDiscountRule> {
    const response = await apiRequest<DataResponse<ReferralDiscountRule>>(
        ReferralDiscountRuleController.store(),
        token,
        payload,
    );

    return response.data;
}

export async function updateReferralDiscountRule(
    token: string,
    id: number,
    payload: ReferralDiscountRulePayload,
): Promise<ReferralDiscountRule> {
    const response = await apiRequest<DataResponse<ReferralDiscountRule>>(
        ReferralDiscountRuleController.update.put({
            referral_discount_rule: id,
        }),
        token,
        payload,
    );

    return response.data;
}

async function fetchAllPages<T>(url: string, token: string): Promise<T[]> {
    const records: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl !== null) {
        const page: ApiPage<T> = await apiRequest<ApiPage<T>>(nextUrl, token);
        records.push(...page.data);
        nextUrl = page.links.next;
    }

    return records;
}
