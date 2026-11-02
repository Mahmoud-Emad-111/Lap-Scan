<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === UserRole::Patient
            && $user->patientProfile()->exists();
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'label' => ['sometimes', 'required', 'string', 'max:80'],
            'address' => ['sometimes', 'required', 'string', 'max:1500'],
            'instructions' => ['sometimes', 'nullable', 'string', 'max:500'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
