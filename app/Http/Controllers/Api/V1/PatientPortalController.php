<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LabResultStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\PatientResultResource;
use App\Models\LabResult;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatientPortalController extends Controller
{
    public function orders(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()->role === UserRole::Patient, 403);
        $patientId = $request->user()->patientProfile()->value('id');

        $orders = Order::query()
            ->where('patient_id', $patientId ?? 0)
            ->with(['branch', 'patient', 'items.sample'])
            ->latest('created_at')
            ->latest('id')
            ->paginate(25);

        return OrderResource::collection($orders);
    }

    public function results(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()->role === UserRole::Patient, 403);
        $patientId = $request->user()->patientProfile()->value('id');
        $results = LabResult::query()
            ->where('status', LabResultStatus::Approved->value)
            ->whereHas('orderItem.order', fn ($query) => $query->where('patient_id', $patientId ?? 0))
            ->with('orderItem.order')
            ->latest('approved_at')
            ->paginate(25);

        return PatientResultResource::collection($results);
    }
}
