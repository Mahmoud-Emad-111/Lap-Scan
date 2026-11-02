<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class AcceptPatientReferralRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
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
            'referral_code' => ['required', 'string', 'max:24'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('referral_code'))) {
            $this->merge(['referral_code' => strtoupper(trim($this->input('referral_code')))]);
        }
    }
}
