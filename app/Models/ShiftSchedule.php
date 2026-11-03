<?php

namespace App\Models;

use Database\Factories\ShiftScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $effective_from
 * @property Carbon|null $effective_until
 */
class ShiftSchedule extends Model
{
    /** @use HasFactory<ShiftScheduleFactory> */
    use HasFactory;

    protected $attributes = [
        'is_active' => true,
    ];

    protected $fillable = [
        'branch_id',
        'user_id',
        'created_by',
        'day_of_week',
        'starts_at',
        'ends_at',
        'effective_from',
        'effective_until',
        'is_active',
    ];

    /** @return BelongsTo<Branch, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<ShiftAttendance, $this> */
    public function attendances(): HasMany
    {
        return $this->hasMany(ShiftAttendance::class);
    }

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'effective_from' => 'date',
            'effective_until' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
