<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'test_id',
        'test_code',
        'test_name',
        'specimen_type',
        'price',
    ];

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Test, $this> */
    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    /** @return HasOne<Sample, $this> */
    public function sample(): HasOne
    {
        return $this->hasOne(Sample::class);
    }

    /** @return HasOne<LabResult, $this> */
    public function result(): HasOne
    {
        return $this->hasOne(LabResult::class);
    }

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }
}
