<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class FinanceReportController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        Gate::authorize('viewFinanceReport', OrderPayment::class);
        $filters = $request->validate([
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date', 'after_or_equal:from'],
        ]);
        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->toDateString();

        $payments = DB::table('order_payments')
            ->whereDate('order_payments.created_at', '>=', $from)
            ->whereDate('order_payments.created_at', '<=', $to);
        $paymentGroups = (clone $payments)
            ->select('method')
            ->selectRaw('SUM(amount) as total, COUNT(*) as count')
            ->groupBy('method')
            ->orderBy('method')
            ->get()
            ->map(fn (\stdClass $payment): array => [
                'method' => $payment->method,
                'total' => number_format((float) $payment->total, 2, '.', ''),
                'count' => (int) $payment->count,
            ])
            ->values();
        $branchGroups = (clone $payments)
            ->join('branches', 'branches.id', '=', 'order_payments.branch_id')
            ->select('branches.id as branch_id', 'branches.name as branch_name')
            ->selectRaw('SUM(order_payments.amount) as total, COUNT(*) as count')
            ->groupBy('branches.id', 'branches.name')
            ->orderBy('branches.id')
            ->get()
            ->map(fn (\stdClass $payment): array => [
                'branch' => [
                    'id' => (int) $payment->branch_id,
                    'name' => $payment->branch_name,
                ],
                'total' => number_format((float) $payment->total, 2, '.', ''),
                'count' => (int) $payment->count,
            ])
            ->values();
        $orderTotals = Order::query()
            ->where('status', '!=', OrderStatus::Cancelled->value)
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->leftJoinSub(
                OrderPayment::query()
                    ->select('order_id')
                    ->selectRaw('SUM(amount) as paid_total')
                    ->groupBy('order_id'),
                'payment_totals',
                'payment_totals.order_id',
                '=',
                'orders.id',
            )
            ->selectRaw('COALESCE(SUM(orders.total), 0) as billed_total')
            ->selectRaw(
                'COALESCE(SUM(orders.total - COALESCE(payment_totals.paid_total, 0)), 0) as outstanding_balance',
            )
            ->toBase()
            ->first();

        return response()->json([
            'data' => [
                'period' => ['from' => $from, 'to' => $to],
                'summary' => [
                    'total_collected' => number_format((float) (clone $payments)->sum('amount'), 2, '.', ''),
                    'payment_count' => (int) (clone $payments)->count(),
                    'billed_total' => number_format((float) ($orderTotals->billed_total ?? 0), 2, '.', ''),
                    'outstanding_balance' => number_format((float) ($orderTotals->outstanding_balance ?? 0), 2, '.', ''),
                ],
                'by_method' => $paymentGroups,
                'by_branch' => $branchGroups,
            ],
        ]);
    }
}
