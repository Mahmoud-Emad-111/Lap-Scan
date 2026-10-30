<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DoctorReferralCreated implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $orderId;

    public int $branchId;

    public string $orderNumber;

    public string $createdAt;

    public function __construct(Order $order)
    {
        $this->orderId = $order->id;
        $this->branchId = $order->branch_id;
        $this->orderNumber = $order->displayNumber();
        $this->createdAt = $order->created_at->toISOString();
    }

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel("branches.{$this->branchId}.orders")];
    }

    public function broadcastAs(): string
    {
        return 'doctor.referral.created';
    }

    /**
     * @return array{order_id: int, branch_id: int, order_number: string, created_at: string}
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'branch_id' => $this->branchId,
            'order_number' => $this->orderNumber,
            'created_at' => $this->createdAt,
        ];
    }
}
