<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SampleResource;
use App\Models\Sample;
use App\Modules\Samples\Actions\CollectSampleAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SampleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Sample::class);

        $samples = Sample::query()
            ->with(['orderItem.order.patient', 'orderItem.order.branch'])
            ->when(
                ! $request->user()->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'orderItem.order.branch.users',
                    fn ($users) => $users->whereKey($request->user()->id),
                ),
            )
            ->orderBy('status')
            ->latest('id')
            ->paginate(25);

        return SampleResource::collection($samples);
    }

    public function collect(
        Request $request,
        Sample $sample,
        CollectSampleAction $collectSample,
    ): JsonResponse {
        Gate::authorize('update', $sample);

        $sample = $collectSample->handle($sample, $request->user());

        return SampleResource::make($sample->load('orderItem.order.patient'))
            ->response()
            ->setStatusCode(200);
    }

    public function show(Sample $sample): SampleResource
    {
        Gate::authorize('view', $sample);

        return SampleResource::make($sample->load('orderItem.order.patient'));
    }
}
