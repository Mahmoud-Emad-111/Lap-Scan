<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateAppSettingRequest;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;

class AppSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => [
                'home_collection_enabled' => AppSetting::homeCollectionEnabled(),
            ],
        ]);
    }

    public function update(UpdateAppSettingRequest $request): JsonResponse
    {
        $settings = AppSetting::query()->firstOrFail();
        $settings->update($request->validated());

        return response()->json([
            'data' => [
                'home_collection_enabled' => $settings->refresh()->home_collection_enabled,
            ],
        ]);
    }
}
