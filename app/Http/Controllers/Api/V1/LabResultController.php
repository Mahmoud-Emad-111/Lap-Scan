<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CorrectLabResultRequest;
use App\Http\Requests\Api\V1\StoreLabResultRequest;
use App\Http\Resources\Api\V1\LabResultResource;
use App\Http\Resources\Api\V1\LabResultRevisionResource;
use App\Models\LabResult;
use App\Models\OrderItem;
use App\Modules\Results\Actions\ApproveLabResultAction;
use App\Modules\Results\Actions\CorrectLabResultAction;
use App\Modules\Results\Actions\SaveLabResultAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LabResultController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', LabResult::class);

        $results = LabResult::query()
            ->with(['orderItem.order.patient', 'orderItem.order.branch'])
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'orderItem.order.branch.users',
                    fn ($users) => $users->whereKey($request->user()->id),
                ),
            )
            ->latest('updated_at')
            ->latest('id')
            ->paginate(25);

        return LabResultResource::collection($results);
    }

    public function store(
        StoreLabResultRequest $request,
        OrderItem $orderItem,
        SaveLabResultAction $saveLabResult,
    ): JsonResponse {
        Gate::authorize('view', $orderItem->order);

        /** @var array{value: string, unit?: string|null, reference_range?: string|null, notes?: string|null} $attributes */
        $attributes = $request->safe()->only([
            'value',
            'unit',
            'reference_range',
            'notes',
        ]);

        $result = $saveLabResult->handle(
            $orderItem,
            $attributes,
            $request->user(),
            $request->file('document') ?? $request->file('pdf'),
            $request->boolean('remove_document') || $request->boolean('remove_pdf'),
        );

        return LabResultResource::make($result->load('orderItem.order.patient'))
            ->response()
            ->setStatusCode(201);
    }

    public function document(Request $request, LabResult $result): StreamedResponse
    {
        if ($request->user()->role === UserRole::Patient) {
            abort_unless(Gate::allows('downloadDocument', $result), 404);
        } else {
            Gate::authorize('downloadDocument', $result);
        }

        abort_if($result->document_path === null, 404);
        abort_unless(Storage::disk('local')->exists($result->document_path), 404);

        $extension = strtolower(pathinfo((string) $result->document_name, PATHINFO_EXTENSION));
        $mimeType = match ($extension) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            default => null,
        };
        abort_if($mimeType === null, 404);

        return Storage::disk('local')->download(
            $result->document_path,
            'lab-result-'.$result->id.'.'.$extension,
            [
                'Content-Type' => $mimeType,
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }

    public function approve(
        Request $request,
        LabResult $result,
        ApproveLabResultAction $approveResult,
    ): LabResultResource {
        Gate::authorize('update', $result);

        return LabResultResource::make(
            $approveResult->handle($result, $request->user())
                ->load('orderItem.order.patient'),
        );
    }

    public function correct(
        CorrectLabResultRequest $request,
        LabResult $result,
        CorrectLabResultAction $correctResult,
    ): LabResultResource {
        /** @var array{reason: string, value: string, unit?: string|null, reference_range?: string|null, notes?: string|null} $attributes */
        $attributes = $request->safe()->only([
            'reason',
            'value',
            'unit',
            'reference_range',
            'notes',
        ]);

        return LabResultResource::make(
            $correctResult->handle(
                $result,
                $attributes,
                $request->user(),
            )->load('orderItem.order.patient'),
        );
    }

    public function revisions(LabResult $result): AnonymousResourceCollection
    {
        Gate::authorize('view', $result);

        return LabResultRevisionResource::collection(
            $result->revisions()->paginate(25),
        );
    }
}
