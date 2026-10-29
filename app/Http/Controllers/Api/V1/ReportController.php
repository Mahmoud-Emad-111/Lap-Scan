<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LabResultStatus;
use App\Enums\OrderStatus;
use App\Enums\SampleStatus;
use App\Http\Controllers\Controller;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\Sample;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReportController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Order::class);
        $filters = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $orders = Order::query()
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'branch.users',
                    fn ($users) => $users->whereKey($request->user()->id),
                ),
            )
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to));

        $orderIds = (clone $orders)->select('id');
        $samples = Sample::query()
            ->whereHas('orderItem', fn ($query) => $query->whereIn('order_id', $orderIds))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to));
        $results = LabResult::query()
            ->whereHas('orderItem', fn ($query) => $query->whereIn('order_id', $orderIds))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to));

        return response()->json([
            'data' => [
                'orders_total' => (clone $orders)->count(),
                'orders_by_status' => (clone $orders)
                    ->selectRaw('status, count(*) as total')
                    ->groupBy('status')
                    ->pluck('total', 'status'),
                'samples_total' => (clone $samples)->count(),
                'samples_pending' => (clone $samples)->where('status', SampleStatus::PendingCollection->value)->count(),
                'results_total' => (clone $results)->count(),
                'results_pending_approval' => (clone $results)->where('status', LabResultStatus::Draft->value)->count(),
                'results_approved' => (clone $results)->where('status', LabResultStatus::Approved->value)->count(),
                'completed_orders' => (clone $orders)->where('status', OrderStatus::Completed->value)->count(),
            ],
        ]);
    }
}
