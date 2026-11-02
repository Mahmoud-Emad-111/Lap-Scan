<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PatientPromotionKind;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AcceptPatientReferralRequest;
use App\Models\Patient;
use App\Models\PatientPromotion;
use App\Modules\Promotions\Actions\AcceptPatientReferralAction;
use App\Modules\Promotions\Actions\GeneratePatientReferralCodeAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientReferralController extends Controller
{
    public function show(
        Request $request,
        GeneratePatientReferralCodeAction $generateReferralCode,
    ): JsonResponse {
        $patient = $this->patient($request);
        $businessDate = today(config('app.business_timezone'));
        $templateAvailable = PatientPromotion::query()
            ->where('kind', PatientPromotionKind::ReferralTemplate->value)
            ->where('is_active', true)
            ->where(function ($query) use ($businessDate): void {
                $query->whereNull('valid_from')->orWhereDate('valid_from', '<=', $businessDate);
            })
            ->where(function ($query) use ($businessDate): void {
                $query->whereNull('valid_until')->orWhereDate('valid_until', '>=', $businessDate);
            })
            ->exists();

        return response()->json([
            'data' => [
                'referral_code' => $generateReferralCode->handle($patient),
                'accepted_count' => $patient->referralsSent()->count(),
                'rewarded_count' => $patient->referralsSent()->whereNotNull('rewarded_at')->count(),
                'has_been_referred' => $patient->referralReceived()->exists(),
                'enabled' => $templateAvailable,
            ],
        ]);
    }

    public function store(
        AcceptPatientReferralRequest $request,
        AcceptPatientReferralAction $acceptReferral,
    ): JsonResponse {
        $patient = $this->patient($request);
        $referral = $acceptReferral->handle($patient, $request->validated('referral_code'));

        return response()->json([
            'data' => [
                'accepted_at' => $referral->accepted_at->toISOString(),
            ],
        ], 201);
    }

    private function patient(Request $request): Patient
    {
        abort_unless($request->user()?->role === UserRole::Patient, 403);

        return $request->user()->patientProfile()->firstOrFail();
    }
}
