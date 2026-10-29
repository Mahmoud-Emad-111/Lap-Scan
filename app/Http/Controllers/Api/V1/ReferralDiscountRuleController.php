<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreReferralDiscountRuleRequest;
use App\Http\Requests\Api\V1\UpdateReferralDiscountRuleRequest;
use App\Http\Resources\Api\V1\ReferralDiscountRuleResource;
use App\Models\ReferralDiscountRule;
use App\Models\User;
use App\Modules\Orders\Actions\SaveReferralDiscountRuleAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ReferralDiscountRuleController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        Gate::authorize('manageReferralDiscounts', User::class);

        return ReferralDiscountRuleResource::collection(
            ReferralDiscountRule::query()
                ->with(['doctor:id,name', 'branch:id,name'])
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->paginate(25),
        );
    }

    public function store(
        StoreReferralDiscountRuleRequest $request,
        SaveReferralDiscountRuleAction $saveRule,
    ): JsonResponse {
        /** @var array{name: string, discount_type: string, discount_value: numeric-string|int|float, minimum_subtotal?: numeric-string|int|float|null, maximum_discount?: numeric-string|int|float|null, valid_from?: string|null, valid_until?: string|null, doctor_id?: int|null, branch_id?: int|null, referral_scope: string, is_active: bool} $attributes */
        $attributes = $request->validated();
        $rule = $saveRule->handle($attributes, $request->user());

        return ReferralDiscountRuleResource::make($rule)->response()->setStatusCode(201);
    }

    public function update(
        UpdateReferralDiscountRuleRequest $request,
        ReferralDiscountRule $referralDiscountRule,
        SaveReferralDiscountRuleAction $saveRule,
    ): ReferralDiscountRuleResource {
        /** @var array{name: string, discount_type: string, discount_value: numeric-string|int|float, minimum_subtotal?: numeric-string|int|float|null, maximum_discount?: numeric-string|int|float|null, valid_from?: string|null, valid_until?: string|null, doctor_id?: int|null, branch_id?: int|null, referral_scope: string, is_active: bool} $attributes */
        $attributes = $request->validated();
        $rule = $saveRule->handle(
            $attributes,
            $request->user(),
            $referralDiscountRule,
        );

        return ReferralDiscountRuleResource::make($rule);
    }
}
