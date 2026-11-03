<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\PaymentMethod;
use App\Models\OrderPayment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreOrderPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', OrderPayment::class) ?? false;
    }

    /** @return array<string, array<int, string|int|Enum>> */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
            'method' => ['required', Rule::enum(PaymentMethod::class)],
        ];
    }
}
