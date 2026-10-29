<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class UpdateTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('test')) ?? false;
    }

    /**
     * @return array<string, array<int, string|Unique>>
     */
    public function rules(): array
    {
        return [
            'code' => [
                'sometimes',
                'required',
                'string',
                'alpha_dash',
                'max:100',
                Rule::unique('tests', 'code')->ignore($this->route('test')),
            ],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'specimen_type' => ['sometimes', 'required', 'string', 'max:100'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999999.99'],
            'turnaround_time_minutes' => ['sometimes', 'required', 'integer', 'min:1', 'max:525600'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
