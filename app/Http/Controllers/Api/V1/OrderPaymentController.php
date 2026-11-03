<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreOrderPaymentRequest;
use App\Http\Resources\Api\V1\OrderPaymentResource;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\User;
use App\Modules\Payments\Actions\RecordOrderPaymentAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class OrderPaymentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', OrderPayment::class);
        $filters = $request->validate([
            'method' => ['sometimes', 'nullable', Rule::enum(PaymentMethod::class)],
            'branch_id' => ['sometimes', 'nullable', 'integer', 'exists:branches,id'],
            'recorded_by' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date', 'after_or_equal:from'],
        ]);

        $visibleBranches = $request->user()->isLabAdministrator()
            ? null
            : $request->user()->branches()->select('branches.id');
        $recorders = User::query()
            ->whereHas('recordedPayments', function ($query) use ($visibleBranches): void {
                if ($visibleBranches !== null) {
                    $query->whereIn('branch_id', $visibleBranches);
                }
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        $payments = OrderPayment::query()
            ->with(['order.patient', 'branch', 'recorder'])
            ->when($visibleBranches !== null, fn ($query) => $query->whereIn('branch_id', $visibleBranches))
            ->when(isset($filters['method']), fn ($query) => $query->where('method', $filters['method']))
            ->when(isset($filters['branch_id']), fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when(isset($filters['recorded_by']), fn ($query) => $query->where('recorded_by', $filters['recorded_by']))
            ->when(isset($filters['from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when(isset($filters['to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->latest('created_at')
            ->latest('id')
            ->paginate(25)
            ->withQueryString();

        return OrderPaymentResource::collection($payments)->additional([
            'recorders' => $recorders,
        ]);
    }

    public function store(
        StoreOrderPaymentRequest $request,
        Order $order,
        RecordOrderPaymentAction $recordPayment,
    ): JsonResponse {
        Gate::authorize('view', $order);
        /** @var array{amount: numeric-string|int|float, method: string} $attributes */
        $attributes = $request->validated();
        $payment = $recordPayment->handle($order, $request->user(), $attributes);

        return OrderPaymentResource::make($payment)->response()->setStatusCode(201);
    }
}
