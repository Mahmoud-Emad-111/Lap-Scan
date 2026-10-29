<?php

namespace App\Modules\Results\Actions;

use App\Enums\LabResultStatus;
use App\Enums\SampleStatus;
use App\Models\LabResult;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveLabResultAction
{
    /**
     * @param  array{value: string, unit?: string|null, reference_range?: string|null, notes?: string|null}  $attributes
     */
    public function handle(OrderItem $orderItem, array $attributes, User $author): LabResult
    {
        return DB::transaction(function () use ($orderItem, $attributes, $author): LabResult {
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
            $result->fill($attributes);
            $result->status = LabResultStatus::Draft;
            $result->entered_by = $author->id;
            $result->entered_at = now();
            $result->approved_by = null;
            $result->approved_at = null;
            $result->save();

            return $result->refresh();
        });
    }
}
