<?php

namespace App\Models;

use Database\Factories\ShiftAttendanceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $shift_date
 * @property Carbon|null $clocked_in_at
 * @property Carbon|null $clocked_out_at
 */
class ShiftAttendance extends Model
{
    /** @use HasFactory<ShiftAttendanceFactory> */
    use HasFactory;

    protected $fillable = [
        'shift_schedule_id',
        'shift_date',
        'clocked_in_at',
        'clocked_out_at',
    ];

    /** @return BelongsTo<ShiftSchedule, $this> */
    public function shiftSchedule(): BelongsTo
    {
        return $this->belongsTo(ShiftSchedule::class);
    }

    protected function casts(): array
    {
        return [
            'shift_date' => 'date',
            'clocked_in_at' => 'datetime',
            'clocked_out_at' => 'datetime',
        ];
    }
}
