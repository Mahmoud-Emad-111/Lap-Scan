<?php

namespace App\Modules\Orders\Actions;

use App\Enums\OrderPriority;
use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Events\HomeCollectionRequested;
use App\Events\PatientPortalUpdated;
use App\Models\Branch;
use App\Models\Order;
use App\Models\Patient;
use App\Models\Test;
use App\Models\User;
use App\Modules\Promotions\Actions\ResolvePatientPromotionAction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateOrderAction
{
    public function __construct(
        private readonly ApplyReferralDiscountAction $applyReferralDiscount,
        private readonly ResolveReferralDiscountRuleAction $resolveDiscountRule,
        private readonly ResolvePatientPromotionAction $resolvePatientPromotion,
    ) {}

    /**
     * @param  array{patient_id?: int|null, patient_full_name?: string, patient_phone?: string, patient_email?: string|null, patient_date_of_birth?: string|null, patient_gender?: string|null, branch_id: int, test_ids: list<int>, notes?: string|null, referring_doctor_id?: int|null, source?: OrderSource, priority?: OrderPriority, urgent_reason?: string|null, request_key?: string|null, collection_address?: string|null, collection_requested_at?: string|null, promotion_id?: int|null, coupon_code?: string|null}  $attributes
     * @param  array{doctor: User, branch: Branch, is_first_referral: bool}|null  $discountContext
     */
    public function handle(
        array $attributes,
        User $creator,
        ?array $discountContext = null,
    ): Order {
        return DB::transaction(function () use ($attributes, $creator, $discountContext): Order {
            $patientId = $attributes['patient_id'] ?? null;

            if ($patientId === null) {
                $patientFullName = $attributes['patient_full_name'] ?? null;
                $patientPhone = $attributes['patient_phone'] ?? null;

                if ($patientFullName === null || $patientPhone === null) {
                    throw ValidationException::withMessages([
                        'patient_full_name' => 'اسم المريض ورقم الهاتف مطلوبان لإنشاء سجل جديد.',
                    ]);
                }

                $patient = Patient::query()->create([
                    'full_name' => $patientFullName,
                    'phone' => $patientPhone,
                    'email' => $attributes['patient_email'] ?? null,
                    'date_of_birth' => $attributes['patient_date_of_birth'] ?? null,
                    'gender' => $attributes['patient_gender'] ?? null,
                ]);
                $patientId = $patient->id;
            }

            $tests = Test::query()
                ->whereIn('id', $attributes['test_ids'])
                ->where('is_active', true)
                ->get()
                ->keyBy('id');

            if ($tests->count() !== count($attributes['test_ids'])) {
                throw ValidationException::withMessages([
                    'test_ids' => 'يجب اختيار تحاليل نشطة فقط.',
                ]);
            }

            $subtotalInCents = 0;
            foreach ($tests as $test) {
                $subtotalInCents += (int) round((float) $test->price * 100);
            }

            $discountRule = $discountContext === null
                ? null
                : $this->resolveDiscountRule->handle(
                    $discountContext['doctor'],
                    $discountContext['branch'],
                    $discountContext['is_first_referral'],
                    $subtotalInCents,
                );
            $patientPromotion = $discountContext === null
                && (isset($attributes['promotion_id']) || isset($attributes['coupon_code']))
                    ? $this->resolvePatientPromotion->handle(
                        $attributes['promotion_id'] ?? null,
                        $attributes['coupon_code'] ?? null,
                        Patient::query()->findOrFail($patientId),
                        $attributes['test_ids'],
                        $subtotalInCents,
                    )
                    : null;
            $patientPromotionRecord = $patientPromotion['promotion'] ?? null;
            $discountInCents = $discountRule !== null
                ? $this->applyReferralDiscount->handle($discountRule, $subtotalInCents)
                : ($patientPromotion['discount_in_cents'] ?? 0);
            $totalInCents = $subtotalInCents - $discountInCents;
            $discountSnapshot = $discountRule !== null
                ? [
                    'rule_id' => $discountRule->id,
                    'name' => $discountRule->name,
                    'discount_type' => $discountRule->discount_type->value,
                    'discount_value' => $discountRule->discount_value,
                    'minimum_subtotal' => $discountRule->minimum_subtotal,
                    'maximum_discount' => $discountRule->maximum_discount,
                    'referral_scope' => $discountRule->referral_scope->value,
                    'discount_amount' => number_format($discountInCents / 100, 2, '.', ''),
                    'applied_at' => now()->toISOString(),
                ]
                : ($patientPromotionRecord === null
                    ? null
                    : [
                        'promotion_id' => $patientPromotionRecord->id,
                        'kind' => $patientPromotionRecord->kind->value,
                        'name' => $patientPromotionRecord->name,
                        'code' => $patientPromotionRecord->code,
                        'discount_type' => $patientPromotionRecord->discount_type->value,
                        'discount_value' => $patientPromotionRecord->discount_value,
                        'minimum_subtotal' => $patientPromotionRecord->minimum_subtotal,
                        'maximum_discount' => $patientPromotionRecord->maximum_discount,
                        'discount_amount' => number_format($discountInCents / 100, 2, '.', ''),
                        'applied_at' => now()->toISOString(),
                    ]);

            $order = Order::query()->create([
                'order_number' => 'LAB-'.now()->format('Ymd').'-'.Str::upper((string) Str::ulid()),
                'branch_id' => $attributes['branch_id'],
                'patient_id' => $patientId,
                'created_by' => $creator->id,
                'referring_doctor_id' => $attributes['referring_doctor_id'] ?? null,
                'status' => OrderStatus::Registered,
                'source' => $attributes['source'] ?? OrderSource::Laboratory,
                'priority' => $attributes['priority'] ?? OrderPriority::Normal,
                'urgent_reason' => $attributes['urgent_reason'] ?? null,
                'request_key' => $attributes['request_key'] ?? null,
                'notes' => $attributes['notes'] ?? null,
                'subtotal' => number_format($subtotalInCents / 100, 2, '.', ''),
                'discount_amount' => number_format($discountInCents / 100, 2, '.', ''),
                'discount_rule_id' => $discountRule?->id,
                'discount_snapshot' => $discountSnapshot,
                'patient_promotion_id' => $patientPromotionRecord?->id,
                'collection_address' => $attributes['collection_address'] ?? null,
                'collection_requested_at' => $attributes['collection_requested_at'] ?? null,
                'total' => number_format($totalInCents / 100, 2, '.', ''),
            ]);

            foreach ($attributes['test_ids'] as $testId) {
                $test = $tests->get($testId);

                if ($test === null) {
                    throw ValidationException::withMessages([
                        'test_ids' => 'تعذّر تحميل التحاليل المختارة.',
                    ]);
                }

                $item = $order->items()->create([
                    'test_id' => $test->id,
                    'test_code' => $test->code,
                    'test_name' => $test->name,
                    'specimen_type' => $test->specimen_type,
                    'price' => $test->price,
                ]);

                $item->sample()->create([
                    'barcode' => $order->order_number.'-'.$item->id,
                    'specimen_type' => $test->specimen_type,
                ]);
            }

            if ($patientPromotionRecord !== null) {
                $patientPromotionRecord->increment('used_count');
                $patientPromotionRecord->redemptions()->create([
                    'patient_id' => $patientId,
                    'order_id' => $order->id,
                    'discount_amount' => number_format($discountInCents / 100, 2, '.', ''),
                ]);
            }

            PatientPortalUpdated::dispatch(
                $order,
                $order->source === OrderSource::HomeCollection ? 'home_collection_created' : 'order_created',
            );

            if ($order->source === OrderSource::HomeCollection) {
                HomeCollectionRequested::dispatch($order);
            }

            return $order->load(['branch', 'patient', 'referringDoctor', 'items.sample', 'items.test']);
        });
    }
}
