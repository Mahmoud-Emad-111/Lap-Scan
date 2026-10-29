<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::Doctor;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $profileId = $this->user()?->doctorProfile()->value('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'specialty' => ['required', 'string', 'max:150'],
            'license_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('doctor_profiles', 'license_number')->ignore($profileId),
            ],
        ];
    }
}
