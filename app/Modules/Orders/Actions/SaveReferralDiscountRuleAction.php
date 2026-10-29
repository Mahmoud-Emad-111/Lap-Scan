<?php

namespace App\Modules\Orders\Actions;

use App\Enums\ReferralDiscountScope;
use App\Models\ReferralDiscountRule;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveReferralDiscountRuleAction
{
    /**
     * @param  array{
     *     name: string,
     *     discount_type: string,
     *     discount_value: numeric-string|int|float,
     *     minimum_subtotal?: numeric-string|int|float|null,
     *     maximum_discount?: numeric-string|int|float|null,
     *     valid_from?: string|null,
     *     valid_until?: string|null,
     *     doctor_id?: int|null,
     *     branch_id?: int|null,
     *     referral_scope: string,
     *     is_active: bool
     * }  $attributes
     */
    public function handle(
        array $attributes,
        User $actor,
        ?ReferralDiscountRule $rule = null,
    ): ReferralDiscountRule {
        return DB::transaction(function () use ($attributes, $actor, $rule): ReferralDiscountRule {
            if ($attributes['is_active']) {
                $this->ensureNoActiveRuleConflict($attributes, $rule);
            }

            $rule ??= new ReferralDiscountRule;
            $rule->fill($attributes);

            $rule->forceFill([
                ...(! $rule->exists ? ['created_by' => $actor->id] : []),
                'updated_by' => $actor->id,
            ]);
            $rule->save();

            return $rule->load(['doctor:id,name', 'branch:id,name', 'creator:id,name', 'updater:id,name']);
        });
    }

    /**
     * @param  array{
     *     discount_type: string,
     *     valid_from?: string|null,
     *     valid_until?: string|null,
     *     doctor_id?: int|null,
     *     branch_id?: int|null,
     *     referral_scope: string,
     *     is_active: bool
     * }  $attributes
     */
    private function ensureNoActiveRuleConflict(array $attributes, ?ReferralDiscountRule $rule): void
    {
        $query = ReferralDiscountRule::query()->where('is_active', true);

        if ($rule?->exists) {
            $query->where('id', '!=', $rule->id);
        }

        if (($attributes['doctor_id'] ?? null) !== null) {
            $query->where(function ($query) use ($attributes): void {
                $query->whereNull('doctor_id')->orWhere('doctor_id', $attributes['doctor_id']);
            });
        }

        if (($attributes['branch_id'] ?? null) !== null) {
            $query->where(function ($query) use ($attributes): void {
                $query->whereNull('branch_id')->orWhere('branch_id', $attributes['branch_id']);
            });
        }

        if ($attributes['referral_scope'] === ReferralDiscountScope::FirstReferral->value) {
            $query->whereIn('referral_scope', [
                ReferralDiscountScope::FirstReferral->value,
                ReferralDiscountScope::AllReferrals->value,
            ]);
        }

        if (($attributes['valid_until'] ?? null) !== null) {
            $query->where(function ($query) use ($attributes): void {
                $query->whereNull('valid_from')
                    ->orWhereDate('valid_from', '<=', $attributes['valid_until']);
            });
        }

        if (($attributes['valid_from'] ?? null) !== null) {
            $query->where(function ($query) use ($attributes): void {
                $query->whereNull('valid_until')
                    ->orWhereDate('valid_until', '>=', $attributes['valid_from']);
            });
        }

        $query->lockForUpdate();
        $incomingSpecificity = (int) (($attributes['doctor_id'] ?? null) !== null)
            + (int) (($attributes['branch_id'] ?? null) !== null);

        $hasConflict = $query->get(['doctor_id', 'branch_id'])->contains(
            fn (ReferralDiscountRule $existingRule): bool => (int) ($existingRule->doctor_id !== null)
                + (int) ($existingRule->branch_id !== null) === $incomingSpecificity,
        );

        if ($hasConflict) {
            throw ValidationException::withMessages([
                'valid_from' => 'تتعارض هذه القاعدة مع قاعدة سارية لها نفس أولوية التطبيق.',
            ]);
        }
    }
}
