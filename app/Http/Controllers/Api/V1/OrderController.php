<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreOrderRequest;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Modules\Orders\Actions\CreateOrderAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Order::class);

        /** @var array{
         *     search?: string|null,
         *     status?: string|null,
         *     source?: string|null,
         *     priority?: 'normal'|'urgent'|null,
         *     branch_id?: int|string|null,
         *     payment_status?: 'outstanding'|'unpaid'|'partial'|'paid'|null,
         *     from?: string|null,
         *     to?: string|null
         * } $filters
         */
        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', Rule::enum(OrderStatus::class)],
            'source' => ['sometimes', 'nullable', Rule::enum(OrderSource::class)],
            'priority' => ['sometimes', 'nullable', Rule::in(['normal', 'urgent'])],
            'branch_id' => ['sometimes', 'nullable', 'integer', 'exists:branches,id'],
            'payment_status' => ['sometimes', 'nullable', Rule::in(['outstanding', 'unpaid', 'partial', 'paid'])],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date', 'after_or_equal:from'],
        ]);
        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? null;
        $source = $filters['source'] ?? null;
        $priority = $filters['priority'] ?? null;
        $branchId = $filters['branch_id'] ?? null;
        $paymentStatus = $filters['payment_status'] ?? null;
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;
        $displayedOrderId = Order::idFromDisplayNumber(trim($search ?? ''));

        $orders = Order::query()
            ->withSum('payments', 'amount')
            ->with(['branch', 'patient', 'referringDoctor', 'items.sample', 'items.result', 'items.test'])
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'branch.users',
                    fn ($users) => $users->whereKey($request->user()->id),
                ),
            )
            ->when($priority !== null, fn ($query) => $query->where('priority', $priority))
            ->when($status !== null, fn ($query) => $query->where('status', $status))
            ->when($source !== null, fn ($query) => $query->where('source', $source))
            ->when($branchId !== null, fn ($query) => $query->where('branch_id', $branchId))
            ->when($from !== null, fn ($query) => $query->whereDate('created_at', '>=', $from))
            ->when($to !== null, fn ($query) => $query->whereDate('created_at', '<=', $to))
            ->when(
                $search !== null && $search !== '',
                fn ($query) => $query->where(function ($orders) use ($search, $displayedOrderId): void {
                    $orders
                        ->where('order_number', 'like', '%'.$search.'%')
                        ->when($displayedOrderId !== null, fn ($orders) => $orders->orWhereKey($displayedOrderId))
                        ->orWhereHas('patient', fn ($patients) => $patients
                            ->where('full_name', 'like', '%'.$search.'%')
                            ->orWhere('phone', 'like', '%'.$search.'%'));
                }),
            )
            ->latest('created_at')
            ->latest('id');

        if ($paymentStatus !== null) {
            $paidAmountQuery = '(SELECT COALESCE(SUM(order_payments.amount), 0) FROM order_payments WHERE order_payments.order_id = orders.id)';

            match ($paymentStatus) {
                'outstanding' => $orders
                    ->where('status', '!=', OrderStatus::Cancelled->value)
                    ->whereRaw($paidAmountQuery.' < orders.total'),
                'unpaid' => $orders->whereRaw($paidAmountQuery.' = 0'),
                'partial' => $orders
                    ->whereRaw($paidAmountQuery.' > 0')
                    ->whereRaw($paidAmountQuery.' < orders.total'),
                'paid' => $orders->whereRaw($paidAmountQuery.' >= orders.total'),
            };
        }

        $orders = $orders->paginate(25)->withQueryString();

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request, CreateOrderAction $createOrder): JsonResponse
    {
        /** @var array{patient_id?: int|null, patient_full_name?: string, patient_phone?: string, patient_email?: string|null, patient_date_of_birth?: string|null, patient_gender?: string|null, branch_id: int, test_ids: list<int>, notes?: string|null} $attributes */
        $attributes = $request->validated();
        Gate::authorize('view', Branch::query()->findOrFail($attributes['branch_id']));
        if (isset($attributes['patient_id'])) {
            Gate::authorize('view', Patient::query()->findOrFail($attributes['patient_id']));
        } else {
            Gate::authorize('create', Patient::class);
        }

        $order = $createOrder->handle($attributes, $request->user());

        return OrderResource::make($order)->response()->setStatusCode(201);
    }

    public function show(Order $order): OrderResource
    {
        Gate::authorize('view', $order);

        return OrderResource::make($order->loadSum('payments', 'amount')->load([
            'branch',
            'patient',
            'referringDoctor',
            'items.sample',
            'items.result',
            'items.test',
        ]));
    }
}
