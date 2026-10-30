<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DoctorVerificationStatus;
use App\Enums\LabResultStatus;
use App\Enums\OrderPriority;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreDoctorReferralRequest;
use App\Http\Resources\Api\V1\BranchResource;
use App\Http\Resources\Api\V1\DoctorOrderResource;
use App\Http\Resources\Api\V1\LabResultResource;
use App\Http\Resources\Api\V1\TestResource;
use App\Models\Branch;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Test;
use App\Models\User;
use App\Modules\Orders\Actions\CreateDoctorReferralAction;
use App\Modules\Orders\Actions\CreateOrderAction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DoctorPortalController extends Controller
{
    public function branches(Request $request): AnonymousResourceCollection
    {
        $this->authorizeDoctor($request->user());

        abort_unless($this->isVerified($request->user()), 403, 'يجب اعتماد حساب الطبيب أولاً.');

        return BranchResource::collection(
            Branch::query()->where('is_active', true)->orderBy('name')->paginate(50),
        );
    }

    public function tests(Request $request): AnonymousResourceCollection
    {
        $this->authorizeDoctor($request->user());

        abort_unless($this->isVerified($request->user()), 403, 'يجب اعتماد حساب الطبيب أولاً.');

        return TestResource::collection(
            Test::query()->where('is_active', true)->orderBy('name')->paginate(50),
        );
    }

    public function patients(Request $request): JsonResponse
    {
        $doctor = $request->user();
        $this->authorizeDoctor($doctor);
        abort_unless($this->isVerified($doctor), 403, 'يجب اعتماد حساب الطبيب أولاً.');

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $patients = Patient::query()
            ->where('phone', $validated['phone'])
            ->orderBy('id')
            ->limit(10)
            ->get(['id', 'full_name', 'phone']);

        return response()->json(['data' => $patients]);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $doctor = $request->user();
        $this->authorizeDoctor($doctor);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(OrderStatus::class)],
            'priority' => ['nullable', Rule::enum(OrderPriority::class)],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'results_available' => ['nullable', 'boolean'],
        ]);
        $displayedOrderId = Order::idFromDisplayNumber(trim($filters['search'] ?? ''));

        $orders = Order::query()
            ->where('referring_doctor_id', $doctor->id)
            ->with([
                'branch',
                'patient',
                'items.test',
                'items.sample',
                'items.result:id,order_item_id,status',
            ])
            ->when(isset($filters['search']), function ($query) use ($filters, $displayedOrderId): void {
                $search = $filters['search'];
                $query->where(function ($orders) use ($search, $displayedOrderId): void {
                    $orders
                        ->where('order_number', 'like', '%'.$search.'%')
                        ->when($displayedOrderId !== null, fn ($orders) => $orders->orWhereKey($displayedOrderId))
                        ->orWhereHas('patient', fn ($patients) => $patients
                            ->where('full_name', 'like', '%'.$search.'%')
                            ->orWhere('phone', 'like', '%'.$search.'%'));
                });
            })
            ->when(isset($filters['status']), fn ($query) => $query->where('status', $filters['status']))
            ->when(isset($filters['priority']), fn ($query) => $query->where('priority', $filters['priority']))
            ->when(isset($filters['branch_id']), fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when(isset($filters['from']), fn ($query) => $query->whereDate('created_at', '>=', $filters['from']))
            ->when(isset($filters['to']), fn ($query) => $query->whereDate('created_at', '<=', $filters['to']))
            ->when(array_key_exists('results_available', $filters), function ($query) use ($request): void {
                $hasReleasedResults = $request->boolean('results_available');
                $releasedResults = fn ($results) => $results->where('status', LabResultStatus::Approved->value);

                if ($hasReleasedResults) {
                    $query->whereHas('items.result', $releasedResults);
                } else {
                    $query->whereDoesntHave('items.result', $releasedResults);
                }
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate(25)
            ->withQueryString();

        return DoctorOrderResource::collection($orders);
    }

    public function store(
        StoreDoctorReferralRequest $request,
        CreateDoctorReferralAction $createReferral,
        CreateOrderAction $createOrder,
    ): JsonResponse {
        /** @var array{request_key: string, patient_id?: int|null, patient_full_name?: string|null, patient_phone: string, patient_email?: string|null, patient_date_of_birth?: string|null, patient_gender?: string|null, branch_id: int, test_ids: list<int>, apply_discount?: bool, priority: string, urgent_reason?: string|null, notes?: string|null} $attributes */
        $attributes = $request->validated();
        $order = $createReferral->handle(
            $attributes,
            $request->user(),
            $createOrder,
        );

        return DoctorOrderResource::make($order)
            ->response()
            ->setStatusCode($order->wasRecentlyCreated ? 201 : 200);
    }

    public function show(Request $request, int $order): DoctorOrderResource
    {
        $doctor = $request->user();
        $this->authorizeDoctor($doctor);

        $order = Order::query()
            ->whereKey($order)
            ->where('referring_doctor_id', $doctor->id)
            ->with([
                'branch',
                'patient',
                'items.test',
                'items.sample',
                'items.result:id,order_item_id,status',
            ])
            ->firstOrFail();

        return DoctorOrderResource::make($order);
    }

    public function result(Request $request, LabResult $result): LabResultResource
    {
        $authorizedResult = $this->findReleasedResult($request->user(), $result);

        return LabResultResource::make($authorizedResult->load([
            'orderItem.order.branch',
            'orderItem.order.patient',
        ]));
    }

    public function resultPdf(Request $request, LabResult $result): Response
    {
        $authorizedResult = $this->findReleasedResult($request->user(), $result);
        $authorizedResult->load(['orderItem.order.branch', 'orderItem.order.patient']);

        $pdf = Pdf::loadView('pdf.doctor-result', [
            'result' => $authorizedResult,
            'order' => $authorizedResult->orderItem->order,
            'patient' => $authorizedResult->orderItem->order->patient,
            'branch' => $authorizedResult->orderItem->order->branch,
            'testName' => $authorizedResult->orderItem->test_name,
        ])->setPaper('a4');

        return $pdf->download('lab-result-'.$authorizedResult->id.'.pdf');
    }

    private function findReleasedResult(User $doctor, LabResult $result): LabResult
    {
        $this->authorizeDoctor($doctor);

        abort_unless($this->isVerified($doctor), 403, 'حساب الطبيب غير معتمد حالياً.');

        return LabResult::query()
            ->whereKey($result->id)
            ->where('status', LabResultStatus::Approved->value)
            ->whereHas('orderItem.order', fn ($orders) => $orders
                ->where('referring_doctor_id', $doctor->id))
            ->firstOrFail();
    }

    private function authorizeDoctor(User $doctor): void
    {
        abort_unless($doctor->role === UserRole::Doctor, 403);
    }

    private function isVerified(User $doctor): bool
    {
        return $doctor->doctorProfile?->verification_status === DoctorVerificationStatus::Verified;
    }
}
