<?php

namespace App\Models;

use App\Enums\PatientPromotionKind;
use App\Enums\ReferralDiscountType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatientPromotion extends Model
{
    protected $fillable = [
        'kind',
        'name',
        'description',
        'code',
        'patient_id',
        'template_id',
        'discount_type',
        'discount_value',
        'minimum_subtotal',
        'maximum_discount',
        'valid_from',
        'valid_until',
        'validity_days',
        'usage_limit',
        'used_count',
        'per_patient_limit',
        'is_active',
        'created_by',
        'updated_by',
    ];

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<PatientPromotion, $this> */
    public function template(): BelongsTo
    {
        return $this->belongsTo(self::class, 'template_id');
    }

    /** @return BelongsToMany<Test, $this> */
    public function tests(): BelongsToMany
    {
        return $this->belongsToMany(Test::class);
    }

    /** @return HasMany<PatientPromotionRedemption, $this> */
    public function redemptions(): HasMany
    {
        return $this->hasMany(PatientPromotionRedemption::class);
    }

    protected function casts(): array
    {
        return [
            'kind' => PatientPromotionKind::class,
            'discount_type' => ReferralDiscountType::class,
            'discount_value' => 'decimal:2',
            'minimum_subtotal' => 'decimal:2',
            'maximum_discount' => 'decimal:2',
            'valid_from' => 'date',
            'valid_until' => 'date',
            'validity_days' => 'integer',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'per_patient_limit' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
