<?php

namespace App\Modules\Payments\Actions;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordOrderPaymentAction
{
    /**
     * @param  array{amount: numeric-string|int|float, method: string}  $attributes
     */
    public function handle(Order $order, User $recorder, array $attributes): OrderPayment
    {
        return DB::transaction(function () use ($order, $recorder, $attributes): OrderPayment {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedOrder->status === OrderStatus::Cancelled) {
                throw ValidationException::withMessages([
                    'order' => 'لا يمكن تسجيل تحصيل لطلب ملغي.',
                ]);
            }

            if (
                ! $recorder->isLabAdministrator()
                && ! $recorder->branches()->whereKey($lockedOrder->branch_id)->exists()
            ) {
                throw ValidationException::withMessages([
                    'order' => 'لا يمكنك تسجيل تحصيل لطلب خارج فروعك.',
                ]);
            }

            $totalInCents = $this->toCents($lockedOrder->total);
            $paidInCents = $this->toCents($lockedOrder->payments()->sum('amount'));
            $amountInCents = $this->toCents((string) $attributes['amount']);
            $balanceInCents = $totalInCents - $paidInCents;

            if ($balanceInCents <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'تم تحصيل قيمة هذا الطلب بالكامل.',
                ]);
            }

            if ($amountInCents > $balanceInCents) {
                throw ValidationException::withMessages([
                    'amount' => 'قيمة التحصيل أكبر من المبلغ المتبقي على الطلب.',
                ]);
            }

            return $lockedOrder->payments()->create([
                'branch_id' => $lockedOrder->branch_id,
                'recorded_by' => $recorder->id,
                'amount' => number_format($amountInCents / 100, 2, '.', ''),
                'method' => PaymentMethod::from($attributes['method']),
            ])->load(['order.patient', 'branch', 'recorder']);
        }, 3);
    }

    private function toCents(string|int|float $amount): int
    {
        return (int) round((float) $amount * 100);
    }
}
