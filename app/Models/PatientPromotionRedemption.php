<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientPromotionRedemption extends Model
{
    protected $fillable = [
        'patient_promotion_id',
        'patient_id',
        'order_id',
        'discount_amount',
    ];

    /** @return BelongsTo<PatientPromotion, $this> */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(PatientPromotion::class, 'patient_promotion_id');
    }

    /** @return BelongsTo<Patient, $this> */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected function casts(): array
    {
        return [
            'discount_amount' => 'decimal:2',
        ];
    }
}
