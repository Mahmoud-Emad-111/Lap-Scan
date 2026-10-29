<?php

use App\Enums\LabResultStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\LabResult;
use App\Models\LabResultRevision;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Test as LabTest;
use App\Models\User;
use App\Modules\Results\Actions\CorrectLabResultAction;
use Laravel\Sanctum\Sanctum;

function createReleasedLabResultForCorrection(User $staff, Branch $branch): LabResult
{
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->create();
    $patient->user()->associate($patientUser)->save();
    $test = LabTest::factory()->create();
    $order = Order::factory()->create([
        'branch_id' => $branch->id,
        'patient_id' => $patient->id,
        'created_by' => $staff->id,
        'status' => OrderStatus::Completed,
    ]);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'test_id' => $test->id,
    ]);

    return LabResult::factory()->create([
        'order_item_id' => $orderItem->id,
        'value' => 'Original released value',
        'unit' => 'unit-old',
        'reference_range' => 'old range',
        'notes' => 'Original released notes',
        'status' => LabResultStatus::Approved,
        'entered_by' => $staff->id,
        'entered_at' => now()->subHour(),
        'approved_by' => $staff->id,
        'approved_at' => now()->subMinute(),
    ]);
}

function makeAssignedLabStaff(): array
{
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $staff->branches()->attach($branch);

    return [$staff, $branch];
}

it('preserves an approved result version and requires approval before releasing its correction', function () {
    [$staff, $branch] = makeAssignedLabStaff();
    $result = createReleasedLabResultForCorrection($staff, $branch);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/results/{$result->id}/corrections", [
        'reason' => 'Corrected after a verified transcription error.',
        'value' => 'Corrected value',
        'unit' => 'unit-new',
        'reference_range' => 'new range',
        'notes' => 'Corrected notes',
    ])->assertOk()
        ->assertJsonPath('data.id', $result->id)
        ->assertJsonPath('data.version', 2)
        ->assertJsonPath('data.status', LabResultStatus::Draft->value)
        ->assertJsonPath('data.value', 'Corrected value')
        ->assertJsonPath('data.approved_at', null);

    $this->postJson("/api/v1/results/{$result->id}/corrections", [
        'reason' => 'A second correction before review.',
        'value' => 'Overwritten draft value',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('result');

    $this->assertDatabaseHas('orders', [
        'id' => $result->orderItem->order_id,
        'status' => OrderStatus::Processing->value,
    ]);

    $historyResponse = $this->getJson("/api/v1/results/{$result->id}/revisions")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.version', 1)
        ->assertJsonPath('data.0.value', 'Original released value')
        ->assertJsonPath('data.0.unit', 'unit-old')
        ->assertJsonPath('data.0.reference_range', 'old range')
        ->assertJsonPath('data.0.notes', 'Original released notes')
        ->assertJsonPath('data.0.status', LabResultStatus::Approved->value)
        ->assertJsonPath('data.0.entered_by', $staff->id)
        ->assertJsonPath('data.0.approved_by', $staff->id)
        ->assertJsonPath('data.0.correction_reason', 'Corrected after a verified transcription error.')
        ->assertJsonPath('data.0.corrected_by.id', $staff->id)
        ->assertJsonPath('data.0.corrected_by.name', $staff->name);

    expect($historyResponse->json('data.0.corrected_at'))->not->toBeEmpty();

    $this->assertDatabaseHas('lab_result_revisions', [
        'lab_result_id' => $result->id,
        'version' => 1,
        'corrected_by' => $staff->id,
        'correction_reason' => 'Corrected after a verified transcription error.',
    ]);

    $revision = LabResultRevision::query()->where('lab_result_id', $result->id)->firstOrFail();

    expect(fn () => $revision->update(['value' => 'Overwritten historical value']))
        ->toThrow(LogicException::class, 'Lab result revisions are immutable.');

    $this->assertDatabaseHas('lab_result_revisions', [
        'lab_result_id' => $result->id,
        'version' => 1,
        'value' => 'Original released value',
    ]);
});

it('releases corrected values only after the existing approval endpoint approves the draft', function () {
    [$staff, $branch] = makeAssignedLabStaff();
    $result = createReleasedLabResultForCorrection($staff, $branch);
    $patientUser = $result->orderItem->order->patient->user;
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/results/{$result->id}/corrections", [
        'reason' => 'Fix a verified data-entry mistake.',
        'value' => 'Corrected released value',
    ])->assertOk()
        ->assertJsonPath('data.status', LabResultStatus::Draft->value)
        ->assertJsonPath('data.version', 2);

    $this->assertDatabaseHas('lab_results', [
        'id' => $result->id,
        'value' => 'Corrected released value',
        'status' => LabResultStatus::Draft->value,
        'approved_by' => null,
        'approved_at' => null,
    ]);

    Sanctum::actingAs($patientUser);
    $this->getJson('/api/v1/patient/results')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    Sanctum::actingAs($staff);
    $this->postJson("/api/v1/results/{$result->id}/approval")
        ->assertOk()
        ->assertJsonPath('data.status', LabResultStatus::Approved->value)
        ->assertJsonPath('data.version', 2)
        ->assertJsonPath('data.value', 'Corrected released value')
        ->assertJsonPath('data.approved_by', $staff->id);

    $this->assertDatabaseHas('lab_result_revisions', [
        'lab_result_id' => $result->id,
        'version' => 1,
        'value' => 'Original released value',
    ]);
    $this->assertDatabaseHas('orders', [
        'id' => $result->orderItem->order_id,
        'status' => OrderStatus::Completed->value,
    ]);

    Sanctum::actingAs($patientUser);
    $this->getJson('/api/v1/patient/results')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.value', 'Corrected released value');
});

it('forbids staff from another branch from correcting or approving a result', function () {
    [$staff, $branch] = makeAssignedLabStaff();
    $result = createReleasedLabResultForCorrection($staff, $branch);
    [$unassignedStaff] = makeAssignedLabStaff();
    Sanctum::actingAs($unassignedStaff);

    $this->postJson("/api/v1/results/{$result->id}/corrections", [
        'reason' => 'A correction reason with enough detail.',
        'value' => 'Unauthorized correction',
    ])->assertForbidden();

    $this->postJson("/api/v1/results/{$result->id}/approval")
        ->assertForbidden();
    $this->getJson("/api/v1/results/{$result->id}/revisions")
        ->assertForbidden();

    $this->assertDatabaseHas('lab_results', [
        'id' => $result->id,
        'value' => 'Original released value',
        'status' => LabResultStatus::Approved->value,
    ]);
    $this->assertDatabaseCount('lab_result_revisions', 0);
});

it('rejects a correction without a meaningful reason and leaves the released result unchanged', function () {
    [$staff, $branch] = makeAssignedLabStaff();
    $result = createReleasedLabResultForCorrection($staff, $branch);
    Sanctum::actingAs($staff);

    $this->postJson("/api/v1/results/{$result->id}/corrections", [
        'reason' => '   ',
        'value' => 'Changed value',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('reason');

    $this->assertDatabaseHas('lab_results', [
        'id' => $result->id,
        'value' => 'Original released value',
        'status' => LabResultStatus::Approved->value,
    ]);
    $this->assertDatabaseCount('lab_result_revisions', 0);
});

it('rolls back both the revision and the result update when saving the correction fails', function () {
    [$staff, $branch] = makeAssignedLabStaff();
    $result = createReleasedLabResultForCorrection($staff, $branch);

    LabResult::updating(static function (): never {
        throw new RuntimeException('Simulated result persistence failure.');
    });

    expect(fn () => app(CorrectLabResultAction::class)->handle(
        $result,
        [
            'reason' => 'Correct a verified data-entry mistake.',
            'value' => 'Partially saved value',
        ],
        $staff,
    ))->toThrow(RuntimeException::class, 'Simulated result persistence failure.');

    $this->assertDatabaseHas('lab_results', [
        'id' => $result->id,
        'value' => 'Original released value',
        'status' => LabResultStatus::Approved->value,
        'version' => 1,
    ]);
    $this->assertDatabaseCount('lab_result_revisions', 0);
});
