<?php

namespace App\Http\Requests\Api\V1;

use App\Models\LabResult;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreLabResultRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', LabResult::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'value' => ['required', 'string', 'max:10000'],
            'unit' => ['nullable', 'string', 'max:50'],
            'reference_range' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'extensions:pdf', 'max:10240'],
            'remove_pdf' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->hasFile('pdf') && $this->boolean('remove_pdf')) {
                    $validator->errors()->add(
                        'remove_pdf',
                        'اختر رفع ملف جديد أو إزالة الملف الحالي، وليس كليهما.',
                    );
                }
            },
        ];
    }
}
