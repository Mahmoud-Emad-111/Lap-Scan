import PatientAddressController from '@/actions/App/Http/Controllers/Api/V1/PatientAddressController';
import PatientPortalController from '@/actions/App/Http/Controllers/Api/V1/PatientPortalController';
import PatientPromotionController from '@/actions/App/Http/Controllers/Api/V1/PatientPromotionController';
import PatientReferralController from '@/actions/App/Http/Controllers/Api/V1/PatientReferralController';
import TestController from '@/actions/App/Http/Controllers/Api/V1/TestController';
import { apiRequest, downloadPatientResult } from '@/lib/api-client';
import type {
    ApiList,
    ApiPage,
    Branch,
    LabTest,
    PatientAddress,
    PatientOrder,
    PatientPromotion,
    PatientReferralSummary,
    PatientResult,
    PatientPortalSettings,
} from '@/types/api';
import LabResultController from '@/actions/App/Http/Controllers/Api/V1/LabResultController';
import { show as showAppSettings } from '@/actions/App/Http/Controllers/Api/V1/AppSettingController';

export function getTests(token: string): Promise<ApiPage<LabTest>> {
    return apiRequest(TestController.index(), token);
}

export function getBranches(token: string): Promise<ApiPage<Branch>> {
    return apiRequest(PatientPortalController.branches(), token);
}

export function getAddresses(token: string): Promise<ApiList<PatientAddress>> {
    return apiRequest(PatientAddressController.index(), token);
}

export function getOrders(token: string): Promise<ApiPage<PatientOrder>> {
    return apiRequest(PatientPortalController.orders(), token);
}

export function getResults(token: string): Promise<ApiPage<PatientResult>> {
    return apiRequest(PatientPortalController.results(), token);
}

export function getOffers(token: string): Promise<ApiPage<PatientPromotion>> {
    return apiRequest(PatientPromotionController.offers(), token);
}

export function getPatientPortalSettings(
    token: string,
): Promise<{ data: PatientPortalSettings }> {
    return apiRequest(showAppSettings(), token);
}

export function getReferralCoupons(token: string): Promise<ApiPage<PatientPromotion>> {
    return apiRequest(PatientPromotionController.coupons(), token);
}

export function getReferralSummary(token: string): Promise<{ data: PatientReferralSummary }> {
    return apiRequest(PatientReferralController.show(), token);
}

export function acceptReferral(
    token: string,
    referralCode: string,
): Promise<{ data: { accepted_at: string } }> {
    return apiRequest(PatientReferralController.store(), token, {
        referral_code: referralCode,
    });
}

export function createAddress(
    token: string,
    address: Pick<PatientAddress, 'label' | 'address' | 'instructions' | 'is_default'>,
): Promise<{ data: PatientAddress }> {
    return apiRequest(PatientAddressController.store(), token, address);
}

export function updateAddress(
    token: string,
    id: number,
    address: Partial<Pick<PatientAddress, 'label' | 'address' | 'instructions' | 'is_default'>>,
): Promise<{ data: PatientAddress }> {
    return apiRequest(PatientAddressController.update({ patientAddress: id }), token, address);
}

export function deleteAddress(token: string, id: number): Promise<void> {
    return apiRequest(PatientAddressController.destroy({ patientAddress: id }), token);
}

export function createHomeCollection(
    token: string,
    payload: {
        address_id: number;
        branch_id: number;
        test_ids: number[];
        collection_requested_at: string;
        notes: string;
        promotion_id?: number;
        coupon_code?: string;
    },
): Promise<{ data: PatientOrder }> {
    return apiRequest(PatientPortalController.storeHomeCollection(), token, payload);
}

export function downloadResult(token: string, resultId: number): Promise<void> {
    return downloadPatientResult(
        LabResultController.document({ result: resultId }),
        token,
        `lab-result-${resultId}.pdf`,
    );
}
