<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientHomeCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === UserRole::Patient
            && $user->patientProfile()->exists();
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('branches', 'id')->where('is_active', true),
            ],
            'address_id' => [
                'required',
                'integer',
                Rule::exists('patient_addresses', 'id')->where('user_id', $this->user()?->id),
            ],
            'test_ids' => ['required', 'array', 'min:1', 'max:20'],
            'test_ids.*' => ['required', 'integer', 'distinct', 'exists:tests,id'],
            'collection_requested_at' => ['required', 'date', 'after:now'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'promotion_id' => [
                'nullable',
                'integer',
                Rule::exists('patient_promotions', 'id')
                    ->where('kind', 'offer'),
                Rule::prohibitedIf($this->filled('coupon_code')),
            ],
            'coupon_code' => [
                'nullable',
                'string',
                'max:40',
                Rule::prohibitedIf($this->filled('promotion_id')),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('coupon_code'))) {
            $this->merge(['coupon_code' => strtoupper(trim($this->input('coupon_code')))]);
        }
    }
}
