<?php

namespace App\Modules\Samples\Actions;

use App\Enums\OrderStatus;
use App\Enums\SampleStatus;
use App\Models\Sample;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CollectSampleAction
{
    public function handle(Sample $sample, User $collector): Sample
    {
        return DB::transaction(function () use ($sample, $collector): Sample {
            $sample = Sample::query()
                ->whereKey($sample->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($sample->status !== SampleStatus::PendingCollection) {
                throw ValidationException::withMessages([
                    'sample' => 'تم تسجيل استلام هذه العينة من قبل.',
                ]);
            }

            $sample->update([
                'status' => SampleStatus::Collected,
                'collected_by' => $collector->id,
                'collected_at' => now(),
            ]);

            $order = $sample->orderItem->order;
            $hasSamples = $order->items()
                ->whereHas('sample')
                ->exists();
            $hasItemsWithoutCollectedSamples = $order->items()
                ->whereDoesntHave('sample', fn (Builder $query): Builder => $query
                    ->where('status', SampleStatus::Collected->value))
                ->exists();

            if ($hasSamples && ! $hasItemsWithoutCollectedSamples) {
                $order->update(['status' => OrderStatus::Processing]);
            }

            return $sample->refresh();
        });
    }
}
