<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\OrderPriority;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDoctorReferralRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Doctor;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'request_key' => ['required', 'uuid'],
            'patient_id' => ['nullable', 'integer', 'exists:patients,id'],
            'patient_full_name' => ['required_without:patient_id', 'nullable', 'string', 'max:255'],
            'patient_phone' => ['required', 'string', 'max:30'],
            'patient_email' => ['nullable', 'email', 'max:255'],
            'patient_date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'patient_gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'test_ids' => ['required', 'array', 'min:1'],
            'test_ids.*' => ['required', 'integer', 'distinct', 'exists:tests,id'],
            'apply_discount' => ['sometimes', 'boolean'],
            'priority' => ['required', Rule::enum(OrderPriority::class)],
            'urgent_reason' => ['required_if:priority,urgent', 'nullable', 'string', 'min:10', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
