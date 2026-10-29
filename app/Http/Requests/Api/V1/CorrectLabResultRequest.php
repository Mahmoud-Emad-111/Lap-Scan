<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;

class CorrectLabResultRequest extends StoreLabResultRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('correct', $this->route('result')) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
            ...parent::rules(),
        ];
    }
}
