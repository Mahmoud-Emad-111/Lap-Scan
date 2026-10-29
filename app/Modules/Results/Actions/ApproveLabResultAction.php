<?php

namespace App\Modules\Results\Actions;

use App\Enums\LabResultStatus;
use App\Enums\OrderStatus;
use App\Models\LabResult;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApproveLabResultAction
{
    public function handle(LabResult $result, User $approver): LabResult
    {
        return DB::transaction(function () use ($result, $approver): LabResult {
            $result = LabResult::query()
                ->whereKey($result->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($result->status !== LabResultStatus::Draft) {
                throw ValidationException::withMessages([
                    'result' => 'هذه النتيجة معتمدة بالفعل.',
                ]);
            }

            $result->update([
                'status' => LabResultStatus::Approved,
                'approved_by' => $approver->id,
                'approved_at' => now(),
            ]);

            $orderId = $result->orderItem()->value('order_id');
            $hasUnapprovedResults = OrderItem::query()
                ->where('order_id', $orderId)
                ->whereDoesntHave('result', fn (Builder $query): Builder => $query
                    ->where('status', LabResultStatus::Approved->value))
                ->exists();

            if (! $hasUnapprovedResults) {
                $result->orderItem->order()->update(['status' => OrderStatus::Completed]);
            }

            return $result->refresh();
        });
    }
}
