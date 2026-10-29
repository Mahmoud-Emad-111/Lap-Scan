<?php

namespace App\Models;

use App\Enums\SampleStatus;
use Database\Factories\SampleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property SampleStatus $status
 * @property Carbon|null $collected_at
 */
class Sample extends Model
{
    /** @use HasFactory<SampleFactory> */
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'barcode',
        'specimen_type',
        'status',
        'collected_by',
        'collected_at',
        'notes',
    ];

    /** @return BelongsTo<OrderItem, $this> */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /** @return BelongsTo<User, $this> */
    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    protected function casts(): array
    {
        return [
            'status' => SampleStatus::class,
            'collected_at' => 'datetime',
        ];
    }
}
