<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Events\HomeCollectionRequested;
use App\Models\FcmDeviceToken;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

class SendHomeCollectionPushNotification implements ShouldQueue
{
    public function handle(HomeCollectionRequested $event): void
    {
        $credentials = config('services.firebase.credentials');

        if (! is_string($credentials) || ! is_file($credentials)) {
            Log::warning('Firebase push notifications are not configured.', [
                'credentials_path' => is_string($credentials) ? $credentials : null,
                'order_id' => $event->orderId,
            ]);

            return;
        }

        $messaging = (new Factory)
            ->withServiceAccount($credentials)
            ->createMessaging();

        FcmDeviceToken::query()
            ->whereHas('user', function (Builder $users) use ($event): void {
                $users->where('role', UserRole::LabAdmin->value)
                    ->orWhere(function (Builder $staff) use ($event): void {
                        $staff->where('role', UserRole::LabStaff->value)
                            ->whereHas(
                                'branches',
                                fn (Builder $branches) => $branches->whereKey($event->branchId),
                            );
                    });
            })
            ->select(['id', 'token'])
            ->chunkById(500, function ($deviceTokens) use ($event, $messaging): void {
                $tokens = array_values($deviceTokens->pluck('token')->all());

                if ($tokens === []) {
                    return;
                }

                $message = CloudMessage::new()->withData([
                    'type' => 'home_collection_requested',
                    'title' => 'طلب سحب منزلي جديد',
                    'body' => "وصل طلب سحب منزلي جديد برقم {$event->orderNumber}.",
                    'order_id' => (string) $event->orderId,
                    'branch_id' => (string) $event->branchId,
                    'order_number' => $event->orderNumber,
                    'created_at' => $event->createdAt,
                    'url' => '/home-collections',
                ]);
                $report = $messaging->sendMulticast($message, $tokens);
                $staleTokens = [
                    ...$report->invalidTokens(),
                    ...$report->unknownTokens(),
                ];

                if ($staleTokens !== []) {
                    FcmDeviceToken::query()
                        ->whereIn('token', $staleTokens)
                        ->delete();
                }

                foreach ($report->failures()->getItems() as $failure) {
                    if (
                        ! $failure->messageTargetWasInvalid()
                        && ! $failure->messageWasSentToUnknownToken()
                    ) {
                        $error = $failure->error();

                        if ($error !== null) {
                            throw $error;
                        }
                    }
                }
            });
    }
}
