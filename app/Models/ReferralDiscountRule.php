<?php

namespace App\Models;

use App\Enums\ReferralDiscountScope;
use App\Enums\ReferralDiscountType;
use Database\Factories\ReferralDiscountRuleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $name
 * @property ReferralDiscountType $discount_type
 * @property string $discount_value
 * @property string|null $minimum_subtotal
 * @property string|null $maximum_discount
 * @property Carbon|null $valid_from
 * @property Carbon|null $valid_until
 * @property int|null $doctor_id
 * @property int|null $branch_id
 * @property ReferralDiscountScope $referral_scope
 * @property bool $is_active
 * @property int $created_by
 * @property int|null $updated_by
 */
class ReferralDiscountRule extends Model
{
    /** @use HasFactory<ReferralDiscountRuleFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'discount_type',
        'discount_value',
        'minimum_subtotal',
        'maximum_discount',
        'valid_from',
        'valid_until',
        'doctor_id',
        'branch_id',
        'referral_scope',
        'is_active',
        'created_by',
        'updated_by',
    ];

    /** @return BelongsTo<User, $this> */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /** @return BelongsTo<Branch, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    protected function casts(): array
    {
        return [
            'discount_type' => ReferralDiscountType::class,
            'discount_value' => 'decimal:2',
            'minimum_subtotal' => 'decimal:2',
            'maximum_discount' => 'decimal:2',
            'valid_from' => 'date',
            'valid_until' => 'date',
            'referral_scope' => ReferralDiscountScope::class,
            'is_active' => 'boolean',
        ];
    }
}
