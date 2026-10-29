<?php

namespace App\Modules\Results\Actions;

use App\Enums\LabResultStatus;
use App\Enums\OrderStatus;
use App\Models\LabResult;
use App\Models\LabResultRevision;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CorrectLabResultAction
{
    /**
     * @param  array{reason: string, value: string, unit?: string|null, reference_range?: string|null, notes?: string|null}  $attributes
     */
    public function handle(
        LabResult $labResult,
        array $attributes,
        User $corrector,
    ): LabResult {
        return DB::transaction(function () use ($labResult, $attributes, $corrector): LabResult {
            $labResult = LabResult::query()
                ->whereKey($labResult->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($labResult->status !== LabResultStatus::Approved) {
                throw ValidationException::withMessages([
                    'result' => 'لا يمكن تصحيح النتيجة إلا بعد اعتمادها.',
                ]);
            }

            $correctedAt = now();

            LabResultRevision::query()->create([
                'lab_result_id' => $labResult->id,
                'version' => $labResult->version,
                'value' => $labResult->value,
                'unit' => $labResult->unit,
                'reference_range' => $labResult->reference_range,
                'notes' => $labResult->notes,
                'status' => $labResult->status,
                'entered_by' => $labResult->entered_by,
                'entered_at' => $labResult->entered_at,
                'approved_by' => $labResult->approved_by,
                'approved_at' => $labResult->approved_at,
                'correction_reason' => $attributes['reason'],
                'corrected_by' => $corrector->id,
                'corrector_name' => $corrector->name,
                'corrected_at' => $correctedAt,
            ]);

            $labResult->fill([
                'value' => $attributes['value'],
                'unit' => $attributes['unit'] ?? null,
                'reference_range' => $attributes['reference_range'] ?? null,
                'notes' => $attributes['notes'] ?? null,
                'status' => LabResultStatus::Draft,
                'entered_by' => $corrector->id,
                'entered_at' => $correctedAt,
                'approved_by' => null,
                'approved_at' => null,
            ]);
            $labResult->version++;
            $labResult->save();

            $labResult->orderItem->order()->update([
                'status' => OrderStatus::Processing,
            ]);

            return $labResult->refresh();
        });
    }
}
