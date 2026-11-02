<?php

namespace App\Modules\Promotions\Actions;

use App\Enums\PatientPromotionKind;
use App\Models\PatientPromotion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SavePatientPromotionAction
{
    /**
     * @param  array{
     *     kind: string,
     *     name: string,
     *     description?: string|null,
     *     code?: string|null,
     *     discount_type: string,
     *     discount_value: numeric-string|int|float,
     *     minimum_subtotal?: numeric-string|int|float|null,
     *     maximum_discount?: numeric-string|int|float|null,
     *     valid_from?: string|null,
     *     valid_until?: string|null,
     *     validity_days?: int|null,
     *     usage_limit?: int|null,
     *     per_patient_limit?: int|null,
     *     test_ids?: list<int>,
     *     is_active: bool
     * }  $attributes
     */
    public function handle(
        array $attributes,
        User $actor,
        ?PatientPromotion $promotion = null,
    ): PatientPromotion {
        return DB::transaction(function () use ($attributes, $actor, $promotion): PatientPromotion {
            $kind = PatientPromotionKind::from($attributes['kind']);
            $testIds = $attributes['test_ids'] ?? [];
            unset($attributes['test_ids']);
            $attributes['code'] = $kind === PatientPromotionKind::Coupon
                ? ($attributes['code'] ?? null)
                : null;
            $attributes['validity_days'] = $kind === PatientPromotionKind::ReferralTemplate
                ? ($attributes['validity_days'] ?? null)
                : null;
            $attributes['usage_limit'] = $kind === PatientPromotionKind::ReferralTemplate
                ? null
                : ($attributes['usage_limit'] ?? null);
            $attributes['per_patient_limit'] = $kind === PatientPromotionKind::ReferralTemplate
                ? null
                : ($attributes['per_patient_limit'] ?? null);

            if ($promotion === null) {
                $attributes['created_by'] = $actor->id;
                $promotion = PatientPromotion::query()->create($attributes);
            } else {
                $attributes['updated_by'] = $actor->id;
                $promotion->update($attributes);
            }

            $promotion->tests()->sync(
                $kind === PatientPromotionKind::Offer ? $testIds : [],
            );

            if (
                $kind === PatientPromotionKind::ReferralTemplate
                && $promotion->is_active
            ) {
                PatientPromotion::query()
                    ->where('kind', PatientPromotionKind::ReferralTemplate->value)
                    ->where('is_active', true)
                    ->where('id', '<>', $promotion->id)
                    ->update(['is_active' => false, 'updated_by' => $actor->id]);
            }

            return $promotion->load('tests:id,name,code');
        });
    }
}
