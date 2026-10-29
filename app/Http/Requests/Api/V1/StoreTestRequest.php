<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Test;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Test::class) ?? false;
    }

    /**
     * @return array<string, array<int, string|Unique>>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'alpha_dash', 'max:100', Rule::unique('tests', 'code')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'specimen_type' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'turnaround_time_minutes' => ['required', 'integer', 'min:1', 'max:525600'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
