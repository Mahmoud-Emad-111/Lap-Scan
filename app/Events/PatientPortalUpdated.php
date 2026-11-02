<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PatientPortalUpdated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $patientId;

    public int $orderId;

    public string $orderNumber;

    public string $orderStatus;

    public string $updateType;

    public string $occurredAt;

    public function __construct(Order $order, string $updateType)
    {
        $this->patientId = $order->patient_id;
        $this->orderId = $order->id;
        $this->orderNumber = $order->displayNumber();
        $this->orderStatus = $order->status->value;
        $this->updateType = $updateType;
        $this->occurredAt = now()->toISOString();
    }

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel("patients.{$this->patientId}")];
    }

    public function broadcastAs(): string
    {
        return 'patient.portal.updated';
    }

    /**
     * @return array{
     *     order_id: int,
     *     order_number: string,
     *     order_status: string,
     *     update_type: string,
     *     occurred_at: string
     * }
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'order_number' => $this->orderNumber,
            'order_status' => $this->orderStatus,
            'update_type' => $this->updateType,
            'occurred_at' => $this->occurredAt,
        ];
    }
}
