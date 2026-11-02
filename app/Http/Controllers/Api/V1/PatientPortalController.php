<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LabResultStatus;
use App\Enums\OrderSource;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePatientHomeCollectionRequest;
use App\Http\Resources\Api\V1\BranchResource;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\PatientResource;
use App\Http\Resources\Api\V1\PatientResultResource;
use App\Models\AppSetting;
use App\Models\Branch;
use App\Models\LabResult;
use App\Models\Order;
use App\Modules\Orders\Actions\CreateOrderAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatientPortalController extends Controller
{
    public function orders(Request $request): AnonymousResourceCollection
    {
        $this->authorizePatient($request);
        $patientId = $request->user()->patientProfile()->value('id');

        $orders = Order::query()
            ->where('patient_id', $patientId ?? 0)
            ->with(['branch', 'patient', 'items.sample', 'items.test'])
            ->latest('created_at')
            ->latest('id')
            ->paginate(25);

        return OrderResource::collection($orders);
    }

    public function branches(Request $request): AnonymousResourceCollection
    {
        $this->authorizePatient($request);

        return BranchResource::collection(
            Branch::query()
                ->where('is_active', true)
                ->orderByDesc('is_default')
                ->orderBy('name')
                ->paginate(50),
        );
    }

    public function profile(Request $request): PatientResource
    {
        $this->authorizePatient($request);

        return PatientResource::make($request->user()->patientProfile()->firstOrFail());
    }

    public function storeHomeCollection(
        StorePatientHomeCollectionRequest $request,
        CreateOrderAction $createOrder,
    ): JsonResponse {
        abort_unless(
            AppSetting::homeCollectionEnabled(),
            409,
            'خدمة السحب المنزلي غير متاحة حالياً.',
        );

        $user = $request->user();
        $attributes = $request->validated();
        $address = $user->patientAddresses()->findOrFail($attributes['address_id']);
        $attributes['patient_id'] = $user->patientProfile()->value('id');
        $attributes['source'] = OrderSource::HomeCollection;
        $attributes['collection_address'] = $address->label.': '.$address->address;
        $attributes['notes'] = $attributes['notes'] ?? $address->instructions;
        unset($attributes['address_id']);

        $order = $createOrder->handle($attributes, $user);

        return OrderResource::make($order)->response()->setStatusCode(201);
    }

    public function results(Request $request): AnonymousResourceCollection
    {
        $this->authorizePatient($request);
        $patientId = $request->user()->patientProfile()->value('id');
        $results = LabResult::query()
            ->where('status', LabResultStatus::Approved->value)
            ->whereHas('orderItem.order', fn ($query) => $query->where('patient_id', $patientId ?? 0))
            ->with('orderItem.order')
            ->latest('approved_at')
            ->paginate(25);

        return PatientResultResource::collection($results);
    }

    private function authorizePatient(Request $request): void
    {
        abort_unless(
            $request->user()->role === UserRole::Patient
            && $request->user()->patientProfile()->exists(),
            403,
        );
    }
}
