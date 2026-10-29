<?php

namespace App\Models;

use App\Enums\OrderPriority;
use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property OrderStatus $status
 * @property OrderSource $source
 * @property OrderPriority $priority
 * @property string $subtotal
 * @property string $discount_amount
 * @property int|null $discount_rule_id
 * @property array{rule_id: int, name: string, discount_type: string, discount_value: string, minimum_subtotal: string|null, maximum_discount: string|null, referral_scope: string, discount_amount: string, applied_at: string}|null $discount_snapshot
 * @property string $total
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'order_number',
        'branch_id',
        'patient_id',
        'created_by',
        'referring_doctor_id',
        'status',
        'source',
        'priority',
        'urgent_reason',
        'request_key',
        'notes',
        'subtotal',
        'discount_amount',
        'discount_rule_id',
        'discount_snapshot',
        'total',
    ];

    /** @return BelongsTo<Branch, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function referringDoctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referring_doctor_id');
    }

    /** @return BelongsTo<ReferralDiscountRule, $this> */
    public function discountRule(): BelongsTo
    {
        return $this->belongsTo(ReferralDiscountRule::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'source' => OrderSource::class,
            'priority' => OrderPriority::class,
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'discount_snapshot' => 'array',
            'total' => 'decimal:2',
        ];
    }
}
