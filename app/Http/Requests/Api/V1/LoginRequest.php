<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required_without:identifier',
                'nullable',
                'email',
                'max:255',
                Rule::prohibitedIf($this->filled('identifier')),
            ],
            'identifier' => [
                'required_without:email',
                'nullable',
                'string',
                'max:255',
                Rule::prohibitedIf($this->filled('email')),
            ],
            'password' => ['required', 'string'],
            'device_name' => ['required', 'string', 'max:255'],
        ];
    }
}
