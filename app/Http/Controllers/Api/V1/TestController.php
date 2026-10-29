<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreTestRequest;
use App\Http\Requests\Api\V1\UpdateTestRequest;
use App\Http\Resources\Api\V1\TestResource;
use App\Models\Test;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class TestController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Test::class);

        return TestResource::collection(
            Test::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->orderBy('id')
                ->paginate(50),
        );
    }

    public function store(StoreTestRequest $request): JsonResponse
    {
        $test = Test::query()->create($request->validated());

        return TestResource::make($test)->response()->setStatusCode(201);
    }

    public function show(Test $test): TestResource
    {
        Gate::authorize('view', $test);

        return TestResource::make($test);
    }

    public function update(UpdateTestRequest $request, Test $test): TestResource
    {
        $test->update($request->validated());

        return TestResource::make($test->refresh());
    }
}
