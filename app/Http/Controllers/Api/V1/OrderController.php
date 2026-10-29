<?php

namespace App\Http\Controllers\Api\V1;

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

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Order::class);

        $orders = Order::query()
            ->with(['branch', 'patient', 'referringDoctor', 'items.sample', 'items.result', 'items.test'])
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'branch.users',
                    fn ($users) => $users->whereKey($request->user()->id),
                ),
            )
            ->when(
                in_array($request->query('priority'), ['normal', 'urgent'], true),
                fn ($query) => $query->where('priority', $request->query('priority')),
            )
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($orders) use ($request): void {
                    $search = $request->string('search')->toString();
                    $orders
                        ->where('order_number', 'like', '%'.$search.'%')
                        ->orWhereHas('patient', fn ($patients) => $patients
                            ->where('full_name', 'like', '%'.$search.'%')
                            ->orWhere('phone', 'like', '%'.$search.'%'));
                }),
            )
            ->latest('created_at')
            ->latest('id')
            ->paginate(25);

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request, CreateOrderAction $createOrder): JsonResponse
    {
        /** @var array{patient_id: int, branch_id: int, test_ids: list<int>, notes?: string|null} $attributes */
        $attributes = $request->validated();
        Gate::authorize('view', Branch::query()->findOrFail($attributes['branch_id']));
        Gate::authorize('view', Patient::query()->findOrFail($attributes['patient_id']));

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
