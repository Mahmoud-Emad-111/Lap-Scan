<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/** @property Carbon $accepted_at */
class PatientReferral extends Model
{
    protected $fillable = [
        'inviter_patient_id',
        'invited_patient_id',
        'reward_template_id',
        'referral_code',
        'accepted_at',
        'rewarded_at',
    ];

    /** @return BelongsTo<Patient, $this> */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'inviter_patient_id');
    }

    /** @return BelongsTo<Patient, $this> */
    public function invited(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'invited_patient_id');
    }

    /** @return BelongsTo<PatientPromotion, $this> */
    public function rewardTemplate(): BelongsTo
    {
        return $this->belongsTo(PatientPromotion::class, 'reward_template_id');
    }

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'rewarded_at' => 'datetime',
        ];
    }
}
