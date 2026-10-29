<?php

use App\Enums\LabResultStatus;
use App\Enums\OrderStatus;
use App\Enums\SampleStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Patient;
use App\Models\Test as LabTest;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('creates an order with price snapshots and one sample per selected test', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $patient = Patient::factory()->create();
    $firstTest = LabTest::factory()->create(['price' => '125.00']);
    $secondTest = LabTest::factory()->create(['price' => '200.00']);
    Sanctum::actingAs($staff);

    $response = $this->postJson('/api/v1/orders', [
        'branch_id' => $branch->id,
        'patient_id' => $patient->id,
        'test_ids' => [$firstTest->id, $secondTest->id],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.total', '325.00')
        ->assertJsonCount(2, 'data.items');
    $this->assertDatabaseCount('order_items', 2);
    $this->assertDatabaseCount('samples', 2);
    $this->assertDatabaseHas('orders', ['status' => OrderStatus::Registered->value, 'total' => '325.00']);
    $this->assertDatabaseHas('samples', ['status' => SampleStatus::PendingCollection->value]);
});

it('returns 403 when laboratory staff create an order for an unassigned branch', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($staff);

    $this->postJson('/api/v1/orders', [
        'branch_id' => $branch->id,
        'patient_id' => $patient->id,
        'test_ids' => [$test->id],
    ])->assertForbidden();

    $this->assertDatabaseCount('orders', 0);
});

it('keeps an order registered until all of its samples are collected', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $patient = Patient::factory()->create();
    $tests = LabTest::factory()->count(2)->create();
    Sanctum::actingAs($staff);

    $orderResponse = $this->postJson('/api/v1/orders', [
        'branch_id' => $branch->id,
        'patient_id' => $patient->id,
        'test_ids' => $tests->modelKeys(),
    ])->assertCreated()
        ->assertJsonCount(2, 'data.items');

    $orderId = $orderResponse->json('data.id');
    $sampleIds = collect($orderResponse->json('data.items'))
        ->pluck('sample.id')
        ->all();

    $this->assertDatabaseCount('samples', 2);
    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'status' => OrderStatus::Registered->value,
    ]);

    $this->postJson("/api/v1/samples/{$sampleIds[0]}/collection")
        ->assertOk()
        ->assertJsonPath('data.status', SampleStatus::Collected->value);

    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'status' => OrderStatus::Registered->value,
    ]);
    $this->assertDatabaseHas('samples', [
        'id' => $sampleIds[1],
        'status' => SampleStatus::PendingCollection->value,
    ]);

    $this->postJson("/api/v1/samples/{$sampleIds[1]}/collection")
        ->assertOk()
        ->assertJsonPath('data.status', SampleStatus::Collected->value);

    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'status' => OrderStatus::Processing->value,
    ]);
});

it('moves a single-sample order to processing when its sample is collected', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $patient = Patient::factory()->create();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($staff);

    $orderResponse = $this->postJson('/api/v1/orders', [
        'branch_id' => $branch->id,
        'patient_id' => $patient->id,
        'test_ids' => [$test->id],
    ])->assertCreated()
        ->assertJsonPath('data.items.0.sample.status', SampleStatus::PendingCollection->value);

    $orderId = $orderResponse->json('data.id');
    $sampleId = $orderResponse->json('data.items.0.sample.id');

    $this->postJson("/api/v1/samples/{$sampleId}/collection")
        ->assertOk()
        ->assertJsonPath('data.status', SampleStatus::Collected->value);

    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'status' => OrderStatus::Processing->value,
    ]);
});

it('publishes patient results only after an authorized result is approved', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->create();
    $patient->user()->associate($patientUser)->save();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($staff);

    $orderResponse = $this->postJson('/api/v1/orders', [
        'branch_id' => $branch->id,
        'patient_id' => $patient->id,
        'test_ids' => [$test->id],
    ])->assertCreated();
    $orderItemId = $orderResponse->json('data.items.0.id');
    $sampleId = $orderResponse->json('data.items.0.sample.id');

    $this->postJson("/api/v1/samples/{$sampleId}/collection")
        ->assertOk()
        ->assertJsonPath('data.status', SampleStatus::Collected->value);

    $resultResponse = $this->postJson("/api/v1/order-items/{$orderItemId}/result", [
        'value' => 'التجربة ليست نتيجة طبية',
        'unit' => 'وحدة تجريبية',
        'reference_range' => 'بيانات تعليمية',
    ])->assertCreated()
        ->assertJsonPath('data.status', LabResultStatus::Draft->value);
    $resultId = $resultResponse->json('data.id');

    Sanctum::actingAs($patientUser);
    $this->getJson('/api/v1/patient/results')->assertOk()->assertJsonCount(0, 'data');

    Sanctum::actingAs($staff);
    $this->postJson("/api/v1/results/{$resultId}/approval")
        ->assertOk()
        ->assertJsonPath('data.status', LabResultStatus::Approved->value);

    $this->assertDatabaseHas('orders', [
        'id' => $orderResponse->json('data.id'),
        'status' => OrderStatus::Completed->value,
    ]);
    $this->assertDatabaseHas('lab_results', [
        'id' => $resultId,
        'status' => LabResultStatus::Approved->value,
        'approved_by' => $staff->id,
    ]);

    Sanctum::actingAs($patientUser);
    $this->getJson('/api/v1/patient/results')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.value', 'التجربة ليست نتيجة طبية');
});
