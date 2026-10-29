<?php

namespace App\Models;

use App\Enums\DoctorVerificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property DoctorVerificationStatus $verification_status
 * @property Carbon|null $verified_at
 */
class DoctorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'specialty',
        'license_number',
        'verification_status',
        'verification_note',
        'reviewed_by',
        'reviewed_at',
        'verified_by',
        'verified_at',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** @return BelongsTo<User, $this> */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    protected function casts(): array
    {
        return [
            'verification_status' => DoctorVerificationStatus::class,
            'reviewed_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }
}
