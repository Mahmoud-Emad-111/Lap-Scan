<?php

namespace App\Models;

use App\Enums\LabResultStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $version
 * @property string $value
 * @property string|null $unit
 * @property string|null $reference_range
 * @property string|null $notes
 * @property LabResultStatus $status
 * @property Carbon $entered_at
 * @property Carbon|null $approved_at
 * @property string $correction_reason
 * @property int $corrected_by
 * @property string $corrector_name
 * @property Carbon $corrected_at
 */
class LabResultRevision extends Model
{
    protected $fillable = [
        'lab_result_id',
        'version',
        'value',
        'unit',
        'reference_range',
        'notes',
        'status',
        'entered_by',
        'entered_at',
        'approved_by',
        'approved_at',
        'correction_reason',
        'corrected_by',
        'corrector_name',
        'corrected_at',
    ];

    protected static function booted(): void
    {
        static::updating(static function (LabResultRevision $revision): never {
            throw new LogicException('Lab result revisions are immutable.');
        });

        static::deleting(static function (LabResultRevision $revision): never {
            throw new LogicException('Lab result revisions are immutable.');
        });
    }

    /** @return BelongsTo<LabResult, $this> */
    public function labResult(): BelongsTo
    {
        return $this->belongsTo(LabResult::class);
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

    /** @return BelongsTo<User, $this> */
    public function corrector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'corrected_by');
    }

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'status' => LabResultStatus::class,
            'entered_at' => 'datetime',
            'approved_at' => 'datetime',
            'corrected_at' => 'datetime',
        ];
    }
}
