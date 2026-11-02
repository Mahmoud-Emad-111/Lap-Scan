<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAppSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === UserRole::LabAdmin;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'home_collection_enabled' => ['required', 'boolean'],
        ];
    }
}
