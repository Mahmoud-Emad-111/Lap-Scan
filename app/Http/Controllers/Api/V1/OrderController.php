<?php

namespace App\Http\Controllers\Api\V1;

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

        $filters = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', Rule::enum(OrderStatus::class)],
            'priority' => ['sometimes', 'nullable', Rule::in(['normal', 'urgent'])],
            'branch_id' => ['sometimes', 'nullable', 'integer', 'exists:branches,id'],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date', 'after_or_equal:from'],
        ]);
        $displayedOrderId = Order::idFromDisplayNumber(trim($filters['search'] ?? ''));

        $orders = Order::query()
            ->with(['branch', 'patient', 'referringDoctor', 'items.sample', 'items.result', 'items.test'])
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'branch.users',
                    fn ($users) => $users->whereKey($request->user()->id),
                ),
            )
            ->when(isset($filters['priority']), fn ($query) => $query->where('priority', $filters['priority']))
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['branch_id']), fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when(isset($filters['from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when(isset($filters['to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->when(
                isset($filters['search']) && $filters['search'] !== '',
                fn ($query) => $query->where(function ($orders) use ($filters, $displayedOrderId): void {
                    $search = $filters['search'];
                    $orders
                        ->where('order_number', 'like', '%'.$search.'%')
                        ->when($displayedOrderId !== null, fn ($orders) => $orders->orWhereKey($displayedOrderId))
                        ->orWhereHas('patient', fn ($patients) => $patients
                            ->where('full_name', 'like', '%'.$search.'%')
                            ->orWhere('phone', 'like', '%'.$search.'%'));
                }),
            )
            ->latest('created_at')
            ->latest('id')
            ->paginate(25)
            ->withQueryString();

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

        return OrderResource::make($order->load([
            'branch',
            'patient',
            'referringDoctor',
            'items.sample',
            'items.result',
            'items.test',
        ]));
    }
}
