<?php

use App\Enums\LabResultStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Test as LabTest;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('does not expose another patient result through the patient portal', function () {
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->create();
    $patient->user()->associate($patientUser)->save();

    $otherPatient = Patient::factory()->create();
    $otherOrder = Order::factory()->create([
        'patient_id' => $otherPatient->id,
        'branch_id' => Branch::factory(),
    ]);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $otherOrder->id,
        'test_id' => LabTest::factory(),
    ]);
    LabResult::factory()->create([
        'order_item_id' => $orderItem->id,
        'status' => LabResultStatus::Approved,
    ]);
    Sanctum::actingAs($patientUser);

    $this->getJson('/api/v1/patient/results')->assertOk()->assertJsonCount(0, 'data');
});

it('returns 403 when a non-patient opens the patient portal', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/patient/results')->assertForbidden();
});

it('returns 403 when a patient requests an order containing an unapproved result', function () {
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->create();
    $patient->user()->associate($patientUser)->save();
    $order = Order::factory()->create([
        'patient_id' => $patient->id,
        'branch_id' => Branch::factory(),
    ]);
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'test_id' => LabTest::factory(),
    ]);
    LabResult::factory()->create(['order_item_id' => $item->id]);
    Sanctum::actingAs($patientUser);

    $this->getJson("/api/v1/orders/{$order->id}")->assertForbidden();
});
