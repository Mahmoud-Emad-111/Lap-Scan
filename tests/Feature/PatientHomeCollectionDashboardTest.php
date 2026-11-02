<?php

use App\Enums\OrderSource;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('returns only home collection orders when filtering the dashboard order list', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    $patient = Patient::factory()->create();
    $branch = Branch::factory()->create();
    $homeCollection = Order::factory()->create([
        'patient_id' => $patient->id,
        'branch_id' => $branch->id,
        'source' => OrderSource::HomeCollection,
        'collection_address' => 'البيت: شارع النيل',
        'collection_requested_at' => now()->addDay(),
    ]);
    Order::factory()->create([
        'patient_id' => $patient->id,
        'branch_id' => $branch->id,
        'source' => OrderSource::Laboratory,
    ]);
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/orders?source=home_collection')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $homeCollection->id)
        ->assertJsonPath('data.0.source', OrderSource::HomeCollection->value)
        ->assertJsonPath('data.0.collection_address', 'البيت: شارع النيل')
        ->assertJsonPath('data.0.collection_requested_at', fn ($value) => $value !== null);
});

it('rejects an unsupported order source filter', function () {
    $admin = User::factory()->create();
    $admin->forceFill(['role' => UserRole::LabAdmin])->save();
    Sanctum::actingAs($admin);

    $this->getJson('/api/v1/orders?source=unknown')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['source']);
});
