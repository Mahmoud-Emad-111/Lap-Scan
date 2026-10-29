<?php

namespace App\Models;

use App\Enums\LabResultStatus;
use Database\Factories\LabResultFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property LabResultStatus $status
 * @property string|null $document_path
 * @property string|null $document_name
 * @property int|null $document_size
 * @property Carbon $entered_at
 * @property Carbon|null $approved_at
 * @property int $version
 */
class LabResult extends Model
{
    /** @use HasFactory<LabResultFactory> */
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'value',
        'unit',
        'reference_range',
        'notes',
        'status',
        'entered_by',
        'approved_by',
        'entered_at',
        'approved_at',
    ];

    /** @return BelongsTo<OrderItem, $this> */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    /** @return BelongsTo<User, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** @return HasMany<LabResultRevision, $this> */
    public function revisions(): HasMany
    {
        return $this->hasMany(LabResultRevision::class)->orderBy('version');
    }

    protected function casts(): array
    {
        return [
            'status' => LabResultStatus::class,
            'version' => 'integer',
            'entered_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }
}
