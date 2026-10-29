<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageDoctors', User::class) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'verification_status' => [
                'required',
                Rule::in([
                    DoctorVerificationStatus::Verified->value,
                    DoctorVerificationStatus::Rejected->value,
                    DoctorVerificationStatus::Suspended->value,
                ]),
            ],
            'verification_note' => [
                Rule::requiredIf(in_array($this->input('verification_status'), [
                    DoctorVerificationStatus::Rejected->value,
                    DoctorVerificationStatus::Suspended->value,
                ], true)),
                'nullable',
                'string',
                'min:10',
                'max:2000',
            ],
        ];
    }
}
