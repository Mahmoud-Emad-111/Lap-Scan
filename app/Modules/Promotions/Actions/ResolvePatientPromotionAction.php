<?php

namespace App\Modules\Promotions\Actions;

use App\Enums\PatientPromotionKind;
use App\Models\Patient;
use App\Models\PatientPromotion;
use App\Modules\Orders\Actions\CalculateDiscountAction;
use Illuminate\Validation\ValidationException;

class ResolvePatientPromotionAction
{
    public function __construct(private readonly CalculateDiscountAction $calculateDiscount) {}

    /**
     * @param  list<int>  $testIds
     * @return array{promotion: PatientPromotion, discount_in_cents: int}|null
     */
    public function handle(
        ?int $promotionId,
        ?string $couponCode,
        Patient $patient,
        array $testIds,
        int $subtotalInCents,
    ): ?array {
        $normalizedCode = strtoupper(trim($couponCode ?? ''));

        if ($promotionId === null && $normalizedCode === '') {
            return null;
        }

        if ($promotionId !== null && $normalizedCode !== '') {
            throw ValidationException::withMessages([
                'coupon_code' => 'استخدم عرض الباقة أو كود الخصم، مش الاتنين مع بعض.',
            ]);
        }

        $businessDate = today(config('app.business_timezone'));
        $promotionQuery = PatientPromotion::query()
            ->where('is_active', true)
            ->where(function ($query) use ($businessDate): void {
                $query->whereNull('valid_from')
                    ->orWhereDate('valid_from', '<=', $businessDate);
            })
            ->where(function ($query) use ($businessDate): void {
                $query->whereNull('valid_until')
                    ->orWhereDate('valid_until', '>=', $businessDate);
            })
            ->lockForUpdate();

        if ($promotionId !== null) {
            $promotionQuery
                ->whereKey($promotionId)
                ->where('kind', PatientPromotionKind::Offer->value);
        } else {
            $promotionQuery
                ->where('code', $normalizedCode)
                ->whereIn('kind', [
                    PatientPromotionKind::Coupon->value,
                    PatientPromotionKind::ReferralCoupon->value,
                ])
                ->where(function ($query) use ($patient): void {
                    $query->whereNull('patient_id')
                        ->orWhere('patient_id', $patient->id);
                });
        }

        $promotion = $promotionQuery->first();
        $errorField = $promotionId !== null ? 'promotion_id' : 'coupon_code';

        if ($promotion === null) {
            throw ValidationException::withMessages([
                $errorField => 'العرض أو الكوبون غير متاح أو انتهت صلاحيته.',
            ]);
        }

        if (
            $promotion->usage_limit !== null
            && $promotion->used_count >= $promotion->usage_limit
        ) {
            throw ValidationException::withMessages([
                $errorField => 'تم استخدام العرض أو الكوبون بالكامل.',
            ]);
        }

        if (
            $promotion->per_patient_limit !== null
            && $promotion->redemptions()
                ->where('patient_id', $patient->id)
                ->count() >= $promotion->per_patient_limit
        ) {
            throw ValidationException::withMessages([
                $errorField => 'وصلت للحد المسموح لاستخدام العرض أو الكوبون.',
            ]);
        }

        if ($promotion->kind === PatientPromotionKind::Offer) {
            $offerTestIds = $promotion->tests()
                ->where('tests.is_active', true)
                ->pluck('tests.id')
                ->map(fn (int|string $id): int => (int) $id)
                ->sort()
                ->values()
                ->all();
            $selectedTestIds = collect($testIds)
                ->map(fn (int|string $id): int => (int) $id)
                ->sort()
                ->values()
                ->all();

            if ($offerTestIds === [] || $selectedTestIds !== $offerTestIds) {
                throw ValidationException::withMessages([
                    'test_ids' => 'اختيارات التحاليل لازم تطابق باقة العرض بالكامل.',
                ]);
            }
        }

        $discountInCents = $this->calculateDiscount->handle(
            $promotion->discount_type,
            (float) $promotion->discount_value,
            $promotion->minimum_subtotal === null ? null : (float) $promotion->minimum_subtotal,
            $promotion->maximum_discount === null ? null : (float) $promotion->maximum_discount,
            $subtotalInCents,
        );

        return [
            'promotion' => $promotion,
            'discount_in_cents' => $discountInCents,
        ];
    }
}
