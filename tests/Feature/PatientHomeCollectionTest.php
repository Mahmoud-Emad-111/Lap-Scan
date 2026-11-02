<?php

use App\Enums\OrderSource;
use App\Enums\UserRole;
use App\Events\HomeCollectionRequested;
use App\Events\PatientPortalUpdated;
use App\Models\Branch;
use App\Models\Patient;
use App\Models\Test as LabTest;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;

it('creates a home collection order for the authenticated patient profile', function () {
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    $patient = Patient::factory()->for($patientUser)->create();
    $address = $patientUser->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع النيل، مبنى ٥',
        'is_default' => true,
    ]);
    $branch = Branch::factory()->create(['is_default' => true]);
    $test = LabTest::factory()->create(['price' => '125.00']);
    $requestedAt = now()->addDay()->startOfHour();
    Sanctum::actingAs($patientUser);
    Event::fake([PatientPortalUpdated::class, HomeCollectionRequested::class]);

    $response = $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$test->id],
        'collection_requested_at' => $requestedAt->toISOString(),
        'notes' => 'اتصل قبل الوصول',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.source', OrderSource::HomeCollection->value)
        ->assertJsonPath('data.status', 'registered')
        ->assertJsonPath('data.total', '125.00')
        ->assertJsonPath('data.collection_address', 'البيت: شارع النيل، مبنى ٥')
        ->assertJsonPath('data.notes', 'اتصل قبل الوصول')
        ->assertJsonCount(1, 'data.items');

    $this->assertDatabaseHas('orders', [
        'patient_id' => $patient->id,
        'created_by' => $patientUser->id,
        'source' => OrderSource::HomeCollection->value,
        'collection_address' => 'البيت: شارع النيل، مبنى ٥',
        'total' => '125.00',
    ]);

    Event::assertDispatched(
        PatientPortalUpdated::class,
        fn (PatientPortalUpdated $event): bool => $event->broadcastOn()[0]->name ===
                "private-patients.{$patient->id}"
            && $event->broadcastWith()['update_type'] === 'home_collection_created',
    );
    Event::assertDispatched(
        HomeCollectionRequested::class,
        fn (HomeCollectionRequested $event): bool => $event->broadcastOn()[0]->name ===
                "private-branches.{$branch->id}.orders"
            && $event->broadcastWith()['order_id'] === $response->json('data.id')
            && $event->broadcastWith()['branch_id'] === $branch->id,
    );
});

it('rejects home collection requests from users without a linked patient profile', function () {
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    Sanctum::actingAs($patientUser);

    $this->postJson('/api/v1/patient/home-collections', [])
        ->assertForbidden();

    $this->assertDatabaseCount('orders', 0);
});

it('rejects inactive tests and past collection dates without creating orders', function () {
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($patientUser)->create();
    $address = $patientUser->patientAddresses()->create([
        'label' => 'البيت',
        'address' => 'شارع النيل، مبنى ٥',
        'is_default' => true,
    ]);
    $branch = Branch::factory()->create();
    $inactiveTest = LabTest::factory()->create(['is_active' => false]);
    Sanctum::actingAs($patientUser);

    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$inactiveTest->id],
        'collection_requested_at' => now()->addDay()->toISOString(),
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['test_ids']);

    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $address->id,
        'test_ids' => [$inactiveTest->id],
        'collection_requested_at' => now()->subMinute()->toISOString(),
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['collection_requested_at']);

    $this->assertDatabaseCount('orders', 0);
});

it('does not let patients book against another account address', function () {
    $patientUser = User::factory()->create();
    $patientUser->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($patientUser)->create();
    $otherUser = User::factory()->create();
    $otherUser->forceFill(['role' => UserRole::Patient])->save();
    Patient::factory()->for($otherUser)->create();
    $otherAddress = $otherUser->patientAddresses()->create([
        'label' => 'عنوان خاص',
        'address' => 'عنوان آخر',
    ]);
    $branch = Branch::factory()->create();
    $test = LabTest::factory()->create();
    Sanctum::actingAs($patientUser);

    $this->postJson('/api/v1/patient/home-collections', [
        'branch_id' => $branch->id,
        'address_id' => $otherAddress->id,
        'test_ids' => [$test->id],
        'collection_requested_at' => now()->addDay()->toISOString(),
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['address_id']);

    $this->assertDatabaseCount('orders', 0);
});
