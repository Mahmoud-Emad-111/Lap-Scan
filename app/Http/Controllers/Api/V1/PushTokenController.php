<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StorePushTokenRequest;
use App\Models\FcmDeviceToken;
use Illuminate\Http\JsonResponse;

class PushTokenController extends Controller
{
    public function store(StorePushTokenRequest $request): JsonResponse
    {
        $token = $request->validated('token');

        FcmDeviceToken::query()->updateOrCreate(
            ['token_hash' => hash('sha256', $token)],
            [
                'user_id' => $request->user()->id,
                'token' => $token,
            ],
        );

        return response()->json(['message' => 'تم تسجيل إشعارات المتصفح.'], 201);
    }

    public function destroy(StorePushTokenRequest $request): JsonResponse
    {
        $token = $request->validated('token');

        FcmDeviceToken::query()
            ->whereBelongsTo($request->user())
            ->where('token_hash', hash('sha256', $token))
            ->delete();

        return response()->json(['message' => 'تم إلغاء تسجيل إشعارات المتصفح.']);
    }
}
