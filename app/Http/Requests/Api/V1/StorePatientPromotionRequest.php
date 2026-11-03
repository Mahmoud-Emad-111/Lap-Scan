<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PatientPromotionKind;
use App\Models\PatientPromotion;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePatientPromotionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('managePatientPromotions', User::class) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $kind = $this->input('kind');
        $promotion = $this->route('patientPromotion') ?? $this->route('patient_promotion');
        $codeRule = Rule::unique('patient_promotions', 'code');

        if ($promotion instanceof PatientPromotion || is_string($promotion)) {
            $codeRule->ignore($promotion);
        }

        return [
            'kind' => [
                'required',
                Rule::in([
                    PatientPromotionKind::Offer->value,
                    PatientPromotionKind::Coupon->value,
                    PatientPromotionKind::ReferralTemplate->value,
                ]),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'code' => [
                Rule::when($kind === PatientPromotionKind::Coupon->value, ['required'], ['prohibited']),
                'nullable',
                'string',
                'max:40',
                'regex:/^[A-Z0-9][A-Z0-9-]*$/',
                $codeRule,
            ],
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
            'validity_days' => [
                Rule::when(
                    $kind === PatientPromotionKind::ReferralTemplate->value,
                    ['required', 'integer', 'min:1', 'max:365'],
                    ['prohibited'],
                ),
            ],
            'usage_limit' => [
                Rule::when(
                    in_array($kind, [PatientPromotionKind::Offer->value, PatientPromotionKind::Coupon->value], true),
                    ['nullable', 'integer', 'min:1'],
                    ['prohibited'],
                ),
            ],
            'per_patient_limit' => [
                Rule::when(
                    in_array($kind, [PatientPromotionKind::Offer->value, PatientPromotionKind::Coupon->value], true),
                    ['nullable', 'integer', 'min:1'],
                    ['prohibited'],
                ),
            ],
            'test_ids' => [
                Rule::when(
                    $kind === PatientPromotionKind::Offer->value,
                    ['required', 'array', 'min:1', 'max:20'],
                    ['prohibited'],
                ),
            ],
            'test_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('tests', 'id')->where('is_active', true),
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{
     *     kind: string,
     *     name: string,
     *     description: string|null,
     *     code: string|null,
     *     discount_type: string,
     *     discount_value: numeric-string|int|float,
     *     minimum_subtotal: numeric-string|int|float|null,
     *     maximum_discount: numeric-string|int|float|null,
     *     valid_from: string|null,
     *     valid_until: string|null,
     *     validity_days: int|null,
     *     usage_limit: int|null,
     *     per_patient_limit: int|null,
     *     test_ids: list<int>,
     *     is_active: bool
     * }
     */
    public function promotionAttributes(): array
    {
        /** @var array{
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
         *     validity_days?: int|string|null,
         *     usage_limit?: int|string|null,
         *     per_patient_limit?: int|string|null,
         *     test_ids?: array<array-key, int|string>,
         *     is_active: bool|int|string
         * } $validated
         */
        $validated = $this->validated();

        return [
            'kind' => $validated['kind'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'code' => $validated['code'] ?? null,
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'minimum_subtotal' => $validated['minimum_subtotal'] ?? null,
            'maximum_discount' => $validated['maximum_discount'] ?? null,
            'valid_from' => $validated['valid_from'] ?? null,
            'valid_until' => $validated['valid_until'] ?? null,
            'validity_days' => isset($validated['validity_days']) ? (int) $validated['validity_days'] : null,
            'usage_limit' => isset($validated['usage_limit']) ? (int) $validated['usage_limit'] : null,
            'per_patient_limit' => isset($validated['per_patient_limit']) ? (int) $validated['per_patient_limit'] : null,
            'test_ids' => array_values(array_map(
                static fn (int|string $testId): int => (int) $testId,
                $validated['test_ids'] ?? [],
            )),
            'is_active' => $this->boolean('is_active'),
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

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'code.regex' => 'اكتب الكود بحروف إنجليزية وأرقام وشرطة فقط.',
            'discount_value.max' => 'يجب ألا تتجاوز نسبة الخصم 100٪.',
            'valid_until.after_or_equal' => 'يجب أن ينتهي العرض في تاريخ البداية أو بعده.',
            'test_ids.*.exists' => 'اختار تحاليل نشطة فقط.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('code'))) {
            $this->merge(['code' => strtoupper(trim($this->input('code')))]);
        }
    }
}
