<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Order;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('records a partial payment and returns the remaining order balance', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $order = Order::factory()->for($branch)->create(['total' => '120.00']);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/orders/{$order->id}/payments", [
        'amount' => '45.00',
        'method' => 'wallet',
    ])->assertCreated()
        ->assertJsonPath('data.amount', '45.00')
        ->assertJsonPath('data.method', 'wallet');

    $this->assertDatabaseHas('order_payments', [
        'order_id' => $order->id,
        'branch_id' => $branch->id,
        'recorded_by' => $staff->id,
        'amount' => '45.00',
        'method' => 'wallet',
    ]);

    $this->getJson('/api/v1/orders?payment_status=outstanding')
        ->assertOk()
        ->assertJsonPath('data.0.paid_amount', '45.00')
        ->assertJsonPath('data.0.balance_due', '75.00')
        ->assertJsonPath('data.0.payment_status', 'partial');
});

it('rejects a payment larger than the outstanding order balance', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $order = Order::factory()->for($branch)->create(['total' => '100.00']);
    $order->payments()->create([
        'branch_id' => $branch->id,
        'recorded_by' => $staff->id,
        'amount' => '80.00',
        'method' => PaymentMethod::Cash,
    ]);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/orders/{$order->id}/payments", [
        'amount' => '20.01',
        'method' => 'cash',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);

    $this->assertDatabaseCount('order_payments', 1);
});

it('rejects payment amounts with more than two decimal places', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $order = Order::factory()->for($branch)->create(['total' => '100.00']);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/orders/{$order->id}/payments", [
        'amount' => '1.005',
        'method' => 'cash',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);

    $this->assertDatabaseCount('order_payments', 0);
});

it('does not allow staff to collect payment for an unassigned branch', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $order = Order::factory()->create(['total' => '100.00']);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/orders/{$order->id}/payments", [
        'amount' => '10.00',
        'method' => 'cash',
    ])->assertForbidden();

    $this->assertDatabaseCount('order_payments', 0);
});

it('does not accept payment for a cancelled order', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $order = Order::factory()->for($branch)->create([
        'status' => OrderStatus::Cancelled,
        'total' => '100.00',
    ]);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/orders/{$order->id}/payments", [
        'amount' => '10.00',
        'method' => 'cash',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['order']);

    $this->assertDatabaseCount('order_payments', 0);
});

it('returns finance totals and payment breakdowns to administrators', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    $order = Order::factory()->for($branch)->create(['total' => '100.00']);
    $order->payments()->create([
        'branch_id' => $branch->id,
        'recorded_by' => $administrator->id,
        'amount' => '35.00',
        'method' => PaymentMethod::Cash,
    ]);
    Sanctum::actingAs($administrator);

    $this->getJson('/api/v1/reports/finance')
        ->assertOk()
        ->assertJsonPath('data.summary.total_collected', '35.00')
        ->assertJsonPath('data.summary.outstanding_balance', '65.00')
        ->assertJsonPath('data.by_method.0.method', 'cash')
        ->assertJsonPath('data.by_branch.0.branch.id', $branch->id);
});

it('does not expose finance reports to laboratory staff', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    Sanctum::actingAs($staff);

    $this->getJson('/api/v1/reports/finance')->assertForbidden();
});

it('filters payments by recorder and returns only recorders from assigned branches', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $recorder = User::factory()->create();
    $otherRecorder = User::factory()->create();
    $branch = Branch::factory()->create();
    $unassignedBranch = Branch::factory()->create();
    $staff->branches()->attach($branch);
    $visibleOrder = Order::factory()->for($branch)->create(['total' => '100.00']);
    $hiddenOrder = Order::factory()->for($unassignedBranch)->create(['total' => '100.00']);
    $visibleOrder->payments()->create([
        'branch_id' => $branch->id,
        'recorded_by' => $recorder->id,
        'amount' => '25.00',
        'method' => PaymentMethod::Cash,
    ]);
    $hiddenOrder->payments()->create([
        'branch_id' => $unassignedBranch->id,
        'recorded_by' => $otherRecorder->id,
        'amount' => '50.00',
        'method' => PaymentMethod::Cash,
    ]);
    Sanctum::actingAs($staff);

    $this->getJson("/api/v1/payments?recorded_by={$recorder->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.recorded_by.id', $recorder->id)
        ->assertJsonPath('recorders.0.id', $recorder->id)
        ->assertJsonMissing(['id' => $otherRecorder->id]);
});

it('validates the payment recorder filter', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($administrator);

    $this->getJson('/api/v1/payments?recorded_by=not-a-user')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['recorded_by']);
});

it('rejects a payment recorder filter for a user that does not exist', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($administrator);

    $this->getJson('/api/v1/payments?recorded_by=99999999')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['recorded_by']);
});
