<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Modules\Users\Actions\CreateUserAction;
use App\Modules\Users\Actions\UpdateUserAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', User::class);

        return UserResource::collection(
            User::query()->with('branches')->orderBy('name')->orderBy('id')->paginate(25),
        );
    }

    public function store(StoreUserRequest $request, CreateUserAction $createUser): JsonResponse
    {
        /** @var array{
         *     name: string,
         *     email: string,
         *     phone?: string|null,
         *     password: string,
         *     role: string,
         *     branch_ids?: array<array-key, int|string>
         * } $validated
         */
        $validated = $request->validated();
        $user = $createUser->handle([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'role' => $validated['role'],
            'branch_ids' => array_values(array_map(
                static fn (int|string $branchId): int => (int) $branchId,
                $validated['branch_ids'] ?? [],
            )),
        ]);

        return UserResource::make($user)->response()->setStatusCode(201);
    }

    public function show(User $user): UserResource
    {
        Gate::authorize('view', $user);

        return UserResource::make($user->load('branches'));
    }

    public function update(
        UpdateUserRequest $request,
        User $user,
        UpdateUserAction $updateUser,
    ): UserResource {
        return UserResource::make($updateUser->handle($user, $request->validated()));
    }
}
