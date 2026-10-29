<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreReferralDiscountRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageReferralDiscounts', User::class) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed_amount'])],
            'discount_value' => [
                'required',
                'numeric',
                'gt:0',
                'max:99999999.99',
                Rule::when($this->input('discount_type') === 'percentage', ['max:100']),
            ],
            'minimum_subtotal' => ['nullable', 'numeric', 'gte:0', 'max:99999999.99'],
            'maximum_discount' => ['nullable', 'numeric', 'gt:0', 'max:99999999.99'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'doctor_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', UserRole::Doctor->value),
            ],
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')],
            'referral_scope' => ['required', Rule::in(['first_referral', 'all_referrals'])],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'discount_value.max' => 'يجب ألا تتجاوز نسبة الخصم 100٪.',
            'valid_until.after_or_equal' => 'يجب أن ينتهي الخصم في تاريخ صلاحية البداية أو بعده.',
            'doctor_id.exists' => 'الطبيب المحدد غير موجود.',
            'branch_id.exists' => 'الفرع المحدد غير موجود.',
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (
                    $this->input('discount_type') === 'fixed_amount'
                    && $this->filled('maximum_discount')
                    && (float) $this->input('maximum_discount') > (float) $this->input('discount_value')
                ) {
                    $validator->errors()->add(
                        'maximum_discount',
                        'لا يمكن أن يتجاوز الحد الأقصى قيمة الخصم الثابت.',
                    );
                }
            },
        ];
    }
}
