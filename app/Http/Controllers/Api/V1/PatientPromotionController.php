<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PatientPromotionKind;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePatientPromotionRequest;
use App\Http\Requests\Api\V1\UpdatePatientPromotionRequest;
use App\Http\Resources\Api\V1\PatientPromotionResource;
use App\Models\Patient;
use App\Models\PatientPromotion;
use App\Models\User;
use App\Modules\Promotions\Actions\SavePatientPromotionAction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PatientPromotionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('managePatientPromotions', User::class);

        return PatientPromotionResource::collection(
            PatientPromotion::query()
                ->whereIn('kind', [
                    PatientPromotionKind::Offer->value,
                    PatientPromotionKind::Coupon->value,
                    PatientPromotionKind::ReferralTemplate->value,
                ])
                ->with('tests:id,name,code')
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->paginate(25),
        );
    }

    public function store(
        StorePatientPromotionRequest $request,
        SavePatientPromotionAction $savePromotion,
    ): JsonResponse {
        $attributes = $request->promotionAttributes();
        $promotion = $savePromotion->handle($attributes, $request->user());

        return PatientPromotionResource::make($promotion)->response()->setStatusCode(201);
    }

    public function update(
        UpdatePatientPromotionRequest $request,
        PatientPromotion $patientPromotion,
        SavePatientPromotionAction $savePromotion,
    ): PatientPromotionResource {
        $attributes = $request->promotionAttributes();

        return PatientPromotionResource::make(
            $savePromotion->handle($attributes, $request->user(), $patientPromotion),
        );
    }

    public function offers(Request $request): AnonymousResourceCollection
    {
        $patient = $this->patient($request);
        $businessDate = today(config('app.business_timezone'));

        return PatientPromotionResource::collection(
            PatientPromotion::query()
                ->where('kind', PatientPromotionKind::Offer->value)
                ->where('is_active', true)
                ->where(function (Builder $query) use ($businessDate): void {
                    $query->whereNull('valid_from')->orWhereDate('valid_from', '<=', $businessDate);
                })
                ->where(function (Builder $query) use ($businessDate): void {
                    $query->whereNull('valid_until')->orWhereDate('valid_until', '>=', $businessDate);
                })
                ->where(function (Builder $query): void {
                    $query->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit');
                })
                ->where(function (Builder $query) use ($patient): void {
                    $query->whereNull('per_patient_limit')
                        ->orWhereRaw(
                            '(SELECT COUNT(*) FROM patient_promotion_redemptions WHERE patient_promotion_redemptions.patient_promotion_id = patient_promotions.id AND patient_promotion_redemptions.patient_id = ?) < patient_promotions.per_patient_limit',
                            [$patient->id],
                        );
                })
                ->whereHas('tests', fn (Builder $query): Builder => $query->where('tests.is_active', true))
                ->whereDoesntHave('tests', fn (Builder $query): Builder => $query->where('tests.is_active', false))
                ->with('tests:id,name,code')
                ->orderBy('name')
                ->paginate(20),
        );
    }

    public function coupons(Request $request): AnonymousResourceCollection
    {
        $patient = $this->patient($request);
        $businessDate = today(config('app.business_timezone'));

        return PatientPromotionResource::collection(
            PatientPromotion::query()
                ->where('kind', PatientPromotionKind::ReferralCoupon->value)
                ->where('patient_id', $patient->id)
                ->where('is_active', true)
                ->where(function (Builder $query) use ($businessDate): void {
                    $query->whereNull('valid_from')->orWhereDate('valid_from', '<=', $businessDate);
                })
                ->where(function (Builder $query) use ($businessDate): void {
                    $query->whereNull('valid_until')->orWhereDate('valid_until', '>=', $businessDate);
                })
                ->whereDoesntHave('redemptions', fn (Builder $query): Builder => $query
                    ->where('patient_id', $patient->id))
                ->orderByDesc('created_at')
                ->paginate(20),
        );
    }

    private function patient(Request $request): Patient
    {
        abort_unless($request->user()?->role === UserRole::Patient, 403);

        return $request->user()->patientProfile()->firstOrFail();
    }
}
