<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class StorePushTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && (
                in_array($user->role, [UserRole::LabAdmin, UserRole::LabStaff], true)
                || (
                    $user->role === UserRole::Patient
                    && $user->patientProfile()->exists()
                )
            );
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
        ];
    }
}
