<?php

namespace Database\Factories;

use App\Enums\ReferralDiscountScope;
use App\Enums\ReferralDiscountType;
use App\Models\ReferralDiscountRule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReferralDiscountRule>
 */
class ReferralDiscountRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'discount_type' => ReferralDiscountType::Percentage,
            'discount_value' => '10.00',
            'minimum_subtotal' => null,
            'maximum_discount' => null,
            'valid_from' => null,
            'valid_until' => null,
            'doctor_id' => null,
            'branch_id' => null,
            'referral_scope' => ReferralDiscountScope::AllReferrals,
            'is_active' => true,
            'created_by' => User::factory(),
        ];
    }
}
