<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'patient_id' => ['nullable', 'required_without:patient_full_name', 'integer', 'exists:patients,id'],
            'patient_full_name' => ['required_without:patient_id', 'prohibited_with:patient_id', 'string', 'max:255'],
            'patient_phone' => ['required_without:patient_id', 'prohibited_with:patient_id', 'string', 'max:30'],
            'patient_email' => ['nullable', 'prohibited_with:patient_id', 'email', 'max:255'],
            'patient_date_of_birth' => ['nullable', 'prohibited_with:patient_id', 'date', 'before_or_equal:today'],
            'patient_gender' => ['nullable', 'prohibited_with:patient_id', Rule::in(['male', 'female', 'other'])],
            'test_ids' => ['required', 'array', 'min:1'],
            'test_ids.*' => ['required', 'integer', 'distinct', 'exists:tests,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
