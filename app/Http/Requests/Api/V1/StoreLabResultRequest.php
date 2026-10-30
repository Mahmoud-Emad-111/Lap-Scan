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
            'document' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png,webp',
                'extensions:pdf,jpg,jpeg,png,webp',
                'max:10240',
            ],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'extensions:pdf', 'max:10240'],
            'remove_document' => ['sometimes', 'boolean'],
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
                if ($this->hasFile('document') && $this->hasFile('pdf')) {
                    $validator->errors()->add(
                        'document',
                        'ارفع ملفًا واحدًا فقط.',
                    );
                }

                if (
                    ($this->hasFile('document') || $this->hasFile('pdf'))
                    && ($this->boolean('remove_document') || $this->boolean('remove_pdf'))
                ) {
                    $errorField = $this->hasFile('pdf') && $this->boolean('remove_pdf')
                        ? 'remove_pdf'
                        : 'remove_document';
                    $validator->errors()->add(
                        $errorField,
                        'اختر رفع ملف جديد أو إزالة الملف الحالي، وليس كليهما.',
                    );
                }

                if ($this->boolean('remove_document') && $this->boolean('remove_pdf')) {
                    $validator->errors()->add(
                        'remove_document',
                        'اختر إزالة المرفق مرة واحدة فقط.',
                    );
                }
            },
        ];
    }
}
