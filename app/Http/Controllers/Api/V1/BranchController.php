<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreBranchRequest;
use App\Http\Requests\Api\V1\UpdateBranchRequest;
use App\Http\Resources\Api\V1\BranchResource;
use App\Models\Branch;
use App\Modules\Branches\Actions\SaveBranchAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class BranchController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Branch::class);
        $user = $request->user();

        $branches = Branch::query()
            ->when(
                ! $user->isLabAdministrator(),
                fn ($query) => $query->whereHas(
                    'users',
                    fn ($users) => $users->whereKey($user->getKey()),
                ),
            )
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(25);

        return BranchResource::collection($branches);
    }

    public function store(StoreBranchRequest $request, SaveBranchAction $saveBranch): JsonResponse
    {
        $branch = $saveBranch->handle($request->validated());

        return BranchResource::make($branch)->response()->setStatusCode(201);
    }

    public function show(Branch $branch): BranchResource
    {
        Gate::authorize('view', $branch);

        return BranchResource::make($branch);
    }

    public function update(
        UpdateBranchRequest $request,
        Branch $branch,
        SaveBranchAction $saveBranch,
    ): BranchResource {
        return BranchResource::make($saveBranch->handle($request->validated(), $branch));
    }
}
