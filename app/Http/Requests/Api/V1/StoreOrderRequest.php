<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'test_ids' => ['required', 'array', 'min:1'],
            'test_ids.*' => ['required', 'integer', 'distinct', 'exists:tests,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
