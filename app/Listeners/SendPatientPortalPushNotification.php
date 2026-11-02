<?php

namespace App\Listeners;

use App\Events\PatientPortalUpdated;
use App\Models\FcmDeviceToken;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\WebPushConfig;

class SendPatientPortalPushNotification implements ShouldQueue
{
    public $tries = 4;

    public $backoff = [5, 15, 30];

    public function handle(PatientPortalUpdated $event): void
    {
        $credentials = config('services.firebase.credentials');

        if (! is_string($credentials) || ! is_file($credentials)) {
            Log::warning('Firebase patient push notifications are not configured.', [
                'credentials_path' => is_string($credentials) ? $credentials : null,
                'order_id' => $event->orderId,
                'patient_id' => $event->patientId,
            ]);

            return;
        }

        $notification = match ($event->updateType) {
            'home_collection_created' => [
                'تم تسجيل طلب السحب المنزلي',
                "طلب السحب المنزلي {$event->orderNumber} اتسجل بنجاح.",
                '/bookings',
            ],
            'order_created' => [
                'تم تسجيل طلب التحاليل',
                "طلب التحاليل {$event->orderNumber} اتسجل بنجاح.",
                '/bookings',
            ],
            'sample_collected' => [
                'تم استلام العينة',
                "تم استلام العينة الخاصة بالطلب {$event->orderNumber}.",
                '/bookings',
            ],
            'result_available' => [
                'نتيجة جديدة جاهزة',
                "نتيجة جديدة للطلب {$event->orderNumber} جاهزة للعرض.",
                '/results',
            ],
            default => null,
        };

        if ($notification === null) {
            return;
        }

        [$title, $body, $url] = $notification;
        $messaging = (new Factory)
            ->withServiceAccount($credentials)
            ->createMessaging();

        FcmDeviceToken::query()
            ->whereHas(
                'user',
                fn (Builder $users) => $users->whereHas(
                    'patientProfile',
                    fn (Builder $patients) => $patients->whereKey($event->patientId),
                ),
            )
            ->select(['id', 'token'])
            ->chunkById(500, function ($deviceTokens) use (
                $event,
                $messaging,
                $title,
                $body,
                $url,
            ): void {
                $tokens = array_values($deviceTokens->pluck('token')->all());

                if ($tokens === []) {
                    return;
                }

                $message = CloudMessage::new()
                    ->withData([
                        'type' => 'patient_portal_updated',
                        'title' => $title,
                        'body' => $body,
                        'order_id' => (string) $event->orderId,
                        'order_number' => $event->orderNumber,
                        'order_status' => $event->orderStatus,
                        'update_type' => $event->updateType,
                        'occurred_at' => $event->occurredAt,
                        'url' => $url,
                    ])
                    ->withHighestPossiblePriority()
                    ->withWebPushConfig(WebPushConfig::new()->withHighUrgency());
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
