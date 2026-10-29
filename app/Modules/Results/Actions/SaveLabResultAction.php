<?php

namespace App\Modules\Results\Actions;

use App\Enums\LabResultStatus;
use App\Enums\SampleStatus;
use App\Models\LabResult;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class SaveLabResultAction
{
    /**
     * @param  array{value: string, unit?: string|null, reference_range?: string|null, notes?: string|null}  $attributes
     */
    public function handle(
        OrderItem $orderItem,
        array $attributes,
        User $author,
        ?UploadedFile $pdf = null,
        bool $removePdf = false,
    ): LabResult {
        $storedPath = null;
        $previousPath = null;

        try {
            $result = DB::transaction(function () use (
                $orderItem,
                $attributes,
                $author,
                $pdf,
                $removePdf,
                &$storedPath,
                &$previousPath,
            ): LabResult {
                $orderItem = OrderItem::query()
                    ->with('sample')
                    ->whereKey($orderItem->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($orderItem->sample?->status !== SampleStatus::Collected) {
                    throw ValidationException::withMessages([
                        'sample' => 'يجب استلام العينة قبل إدخال النتيجة.',
                    ]);
                }

                $result = $orderItem->result()->lockForUpdate()->first();

                if ($result?->status === LabResultStatus::Approved) {
                    throw ValidationException::withMessages([
                        'result' => 'لا يمكن تعديل نتيجة معتمدة.',
                    ]);
                }

                $result ??= new LabResult([
                    'order_item_id' => $orderItem->id,
                ]);
                $previousPath = $result->document_path;
                $result->fill($attributes);

                if ($pdf !== null) {
                    $storedPath = $pdf->store('lab-results', 'local');

                    if (! is_string($storedPath)) {
                        throw new RuntimeException('Unable to store the lab result PDF.');
                    }

                    $result->document_path = $storedPath;
                    $result->document_name = mb_substr($pdf->getClientOriginalName(), 0, 255);
                    $result->document_size = $pdf->getSize() ?: 0;
                } elseif ($removePdf) {
                    $result->document_path = null;
                    $result->document_name = null;
                    $result->document_size = null;
                }

                $result->status = LabResultStatus::Draft;
                $result->entered_by = $author->id;
                $result->entered_at = now();
                $result->approved_by = null;
                $result->approved_at = null;
                $result->save();

                return $result->refresh();
            });
        } catch (Throwable $exception) {
            if ($storedPath !== null && ! Storage::disk('local')->delete($storedPath)) {
                Log::warning('Failed to remove a lab result PDF after a failed save.', [
                    'order_item_id' => $orderItem->id,
                    'path' => $storedPath,
                ]);
            }

            throw $exception;
        }

        if (
            $previousPath !== null
            && ($pdf !== null || $removePdf)
            && $previousPath !== $storedPath
            && ! Storage::disk('local')->delete($previousPath)
        ) {
            Log::warning('Failed to remove a replaced lab result PDF.', [
                'lab_result_id' => $result->id,
                'path' => $previousPath,
            ]);
        }

        return $result;
    }
}
