<?php

use App\Enums\LabResultStatus;
use App\Enums\SampleStatus;
use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\LabResult;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Sample;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

it('stores, replaces, downloads, and removes a private PDF with a draft result', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $order = Order::factory()->for($branch)->for($patient)->create();
    $orderItem = OrderItem::factory()->for($order)->create();
    Sample::factory()->for($orderItem)->create([
        'status' => SampleStatus::Collected,
        'collected_by' => $administrator->id,
        'collected_at' => now(),
    ]);
    Storage::fake('local');
    Sanctum::actingAs($administrator);

    $firstResponse = $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Draft value',
        'unit' => 'mg/dL',
        'reference_range' => '0-10',
        'notes' => '',
        'pdf' => UploadedFile::fake()->createWithContent(
            'lab-report.pdf',
            "%PDF-1.4\n% result report\n%%EOF",
        ),
    ], ['Accept' => 'application/json']);

    $firstResponse->assertCreated()
        ->assertJsonPath('data.status', LabResultStatus::Draft->value)
        ->assertJsonPath('data.has_pdf', true)
        ->assertJsonPath('data.document_name', 'lab-report.pdf');
    expect($firstResponse->json('data'))->not->toHaveKey('document_path');

    $result = LabResult::query()->where('order_item_id', $orderItem->id)->firstOrFail();
    $firstPath = $result->document_path;
    Storage::disk('local')->assertExists($firstPath);

    $this->postJson("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Manual edit without a new attachment',
    ])->assertCreated()
        ->assertJsonPath('data.has_pdf', true)
        ->assertJsonPath('data.document_name', 'lab-report.pdf');

    expect($result->refresh()->document_path)->toBe($firstPath);

    $download = $this->get("/api/v1/results/{$result->id}/document");
    $download->assertOk()->assertHeader('content-type', 'application/pdf');
    expect($download->headers->get('content-disposition'))
        ->toContain("lab-result-{$result->id}.pdf");

    $secondResponse = $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Updated draft value',
        'pdf' => UploadedFile::fake()->createWithContent(
            'updated-report.pdf',
            "%PDF-1.4\n% updated report\n%%EOF",
        ),
    ], ['Accept' => 'application/json']);

    $secondResponse->assertCreated()
        ->assertJsonPath('data.has_pdf', true)
        ->assertJsonPath('data.document_name', 'updated-report.pdf');

    $secondPath = $result->refresh()->document_path;
    Storage::disk('local')->assertMissing($firstPath);
    Storage::disk('local')->assertExists($secondPath);

    $this->postJson("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Updated draft value',
        'remove_pdf' => true,
    ])->assertCreated()
        ->assertJsonPath('data.has_pdf', false)
        ->assertJsonPath('data.document_name', null);

    Storage::disk('local')->assertMissing($secondPath);
    expect($result->refresh()->document_path)->toBeNull();
});

it('stores and downloads a private result image', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $order = Order::factory()->for($branch)->for($patient)->create();
    $orderItem = OrderItem::factory()->for($order)->create();
    Sample::factory()->for($orderItem)->create([
        'status' => SampleStatus::Collected,
        'collected_by' => $administrator->id,
        'collected_at' => now(),
    ]);
    Storage::fake('local');
    Sanctum::actingAs($administrator);
    $pngContent = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lWQAAAAASUVORK5CYII=',
        true,
    );

    if (! is_string($pngContent)) {
        throw new RuntimeException('Unable to decode the PNG fixture.');
    }

    $response = $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Draft value',
        'document' => UploadedFile::fake()->createWithContent('result.png', $pngContent),
    ], ['Accept' => 'application/json']);

    $response->assertCreated()
        ->assertJsonPath('data.has_document', true)
        ->assertJsonPath('data.has_pdf', false)
        ->assertJsonPath('data.document_type', 'image')
        ->assertJsonPath('data.document_name', 'result.png');

    $result = LabResult::query()->where('order_item_id', $orderItem->id)->firstOrFail();
    Storage::disk('local')->assertExists($result->document_path);

    $this->get("/api/v1/results/{$result->id}/document")
        ->assertOk()
        ->assertHeader('content-type', 'image/png')
        ->assertHeader('content-disposition', 'attachment; filename=lab-result-'.$result->id.'.png');
});

it('rejects invalid PDFs and does not create a result', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $order = Order::factory()->for($branch)->for($patient)->create();
    $orderItem = OrderItem::factory()->for($order)->create();
    Sample::factory()->for($orderItem)->create([
        'status' => SampleStatus::Collected,
        'collected_by' => $administrator->id,
        'collected_at' => now(),
    ]);
    Storage::fake('local');
    Sanctum::actingAs($administrator);

    $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Draft value',
        'pdf' => UploadedFile::fake()->create('report.txt', 10, 'text/plain'),
    ], ['Accept' => 'application/json'])->assertUnprocessable()
        ->assertJsonValidationErrors('pdf');

    $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Draft value',
        'document' => UploadedFile::fake()->create('report.svg', 10, 'image/svg+xml'),
    ], ['Accept' => 'application/json'])->assertUnprocessable()
        ->assertJsonValidationErrors('document');

    $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Draft value',
        'remove_pdf' => true,
        'pdf' => UploadedFile::fake()->createWithContent(
            'report.pdf',
            "%PDF-1.4\n% report\n%%EOF",
        ),
    ], ['Accept' => 'application/json'])->assertUnprocessable()
        ->assertJsonValidationErrors('remove_pdf');

    $this->assertDatabaseMissing('lab_results', ['order_item_id' => $orderItem->id]);
    expect(Storage::disk('local')->allFiles('lab-results'))->toBe([]);
});

it('keeps PDF downloads within the existing branch authorization boundary', function () {
    $staff = User::factory()->create();
    $staff->forceFill(['role' => UserRole::LabStaff])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $order = Order::factory()->for($branch)->for($patient)->create();
    $orderItem = OrderItem::factory()->for($order)->create();
    $result = LabResult::factory()->for($orderItem)->create([
        'document_path' => 'lab-results/private-report.pdf',
        'document_name' => 'private-report.pdf',
        'document_size' => 28,
    ]);
    Sample::factory()->for($orderItem)->create([
        'status' => SampleStatus::Collected,
        'collected_by' => $staff->id,
        'collected_at' => now(),
    ]);
    Storage::fake('local');
    Storage::disk('local')->put($result->document_path, "%PDF-1.4\n%%EOF");

    $this->getJson("/api/v1/results/{$result->id}/document")->assertUnauthorized();
    Sanctum::actingAs($staff);

    $this->get("/api/v1/results/{$result->id}/document")->assertForbidden();
    $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Unauthorized update',
        'pdf' => UploadedFile::fake()->createWithContent(
            'unauthorized.pdf',
            "%PDF-1.4\n% denied\n%%EOF",
        ),
    ], ['Accept' => 'application/json'])->assertForbidden();
    Storage::disk('local')->assertExists($result->document_path);

    $patient = User::factory()->create();
    $patient->forceFill(['role' => UserRole::Patient])->save();
    Sanctum::actingAs($patient);
    $this->get("/api/v1/results/{$result->id}/document")->assertForbidden();

    Sanctum::actingAs($staff);
    $staff->branches()->attach($branch);
    $this->get("/api/v1/results/{$result->id}/document")->assertOk();
});

it('does not store a PDF when the sample has not been collected', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $order = Order::factory()->for($branch)->for($patient)->create();
    $orderItem = OrderItem::factory()->for($order)->create();
    Sample::factory()->for($orderItem)->create();
    Storage::fake('local');
    Sanctum::actingAs($administrator);

    $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Draft value',
        'pdf' => UploadedFile::fake()->createWithContent(
            'lab-report.pdf',
            "%PDF-1.4\n% report\n%%EOF",
        ),
    ], ['Accept' => 'application/json'])->assertUnprocessable()
        ->assertJsonValidationErrors('sample');

    $this->assertDatabaseMissing('lab_results', ['order_item_id' => $orderItem->id]);
    expect(Storage::disk('local')->allFiles('lab-results'))->toBe([]);
});

it('does not replace the PDF attached to an approved result', function () {
    $administrator = User::factory()->create();
    $administrator->forceFill(['role' => UserRole::LabAdmin])->save();
    $branch = Branch::factory()->create();
    $patient = Patient::factory()->create();
    $order = Order::factory()->for($branch)->for($patient)->create();
    $orderItem = OrderItem::factory()->for($order)->create();
    Sample::factory()->for($orderItem)->create([
        'status' => SampleStatus::Collected,
        'collected_by' => $administrator->id,
        'collected_at' => now(),
    ]);
    $result = LabResult::factory()->for($orderItem)->create([
        'status' => LabResultStatus::Approved,
        'document_path' => 'lab-results/approved-report.pdf',
        'document_name' => 'approved-report.pdf',
        'document_size' => 14,
    ]);
    Storage::fake('local');
    Storage::disk('local')->put($result->document_path, "%PDF-1.4\n%%EOF");
    Sanctum::actingAs($administrator);

    $this->post("/api/v1/order-items/{$orderItem->id}/result", [
        'value' => 'Attempted replacement',
        'pdf' => UploadedFile::fake()->createWithContent(
            'replacement.pdf',
            "%PDF-1.4\n% replacement\n%%EOF",
        ),
    ], ['Accept' => 'application/json'])->assertUnprocessable()
        ->assertJsonValidationErrors('result');

    Storage::disk('local')->assertExists($result->document_path);
    expect(Storage::disk('local')->allFiles('lab-results'))->toHaveCount(1);
});
