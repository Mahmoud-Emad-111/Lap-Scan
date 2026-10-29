<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\LabResultStatus;
use App\Enums\SampleStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Sample;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $orders = Order::query();
        $pendingSamples = Sample::query()->where('status', SampleStatus::PendingCollection->value);
        $pendingResults = OrderItem::query()
            ->whereHas('sample', fn ($query) => $query->where('status', SampleStatus::Collected->value))
            ->whereDoesntHave('result', fn ($query) => $query
                ->where('status', LabResultStatus::Approved->value));

        if ($user->role === UserRole::LabStaff) {
            $branchIds = $user->branches()->pluck('branches.id');
            $orders->whereIn('branch_id', $branchIds);
            $pendingSamples->whereHas('orderItem.order', fn ($query) => $query->whereIn('branch_id', $branchIds));
            $pendingResults->whereHas('order', fn ($query) => $query->whereIn('branch_id', $branchIds));
        } elseif ($user->role === UserRole::Patient) {
            $patientId = $user->patientProfile()->value('id');
            $orders->where('patient_id', $patientId ?? 0);
        } elseif ($user->role === UserRole::Doctor) {
            $orders->where('referring_doctor_id', $user->id);
        } elseif (! $user->isLabAdministrator()) {
            $orders->whereRaw('1 = 0');
        }

        return response()->json([
            'data' => [
                'patients_total' => $user->role->canManagePatients() ? Patient::query()->count() : null,
                'active_tests_total' => Test::query()->where('is_active', true)->count(),
                'orders_today' => (clone $orders)->whereDate('created_at', today())->count(),
                'pending_samples' => $user->role->canManageOrders() ? $pendingSamples->count() : null,
                'pending_results' => $user->role->canManageOrders() ? $pendingResults->count() : null,
                'patient_results' => $user->role === UserRole::Patient
                    ? LabResult::query()
                        ->where('status', LabResultStatus::Approved->value)
                        ->whereHas('orderItem.order', fn ($query) => $query->where('patient_id', $patientId ?? 0))
                        ->count()
                    : null,
                'doctor_orders' => $user->role === UserRole::Doctor
                    ? (clone $orders)->count()
                    : null,
                'doctor_urgent_orders' => $user->role === UserRole::Doctor
                    ? (clone $orders)->where('priority', 'urgent')->count()
                    : null,
                'doctor_available_results' => $user->role === UserRole::Doctor
                    ? LabResult::query()
                        ->where('status', LabResultStatus::Approved->value)
                        ->whereHas('orderItem.order', fn ($query) => $query
                            ->where('referring_doctor_id', $user->id))
                        ->count()
                    : null,
            ],
        ]);
    }
}
