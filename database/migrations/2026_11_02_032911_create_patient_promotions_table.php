<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_promotions', function (Blueprint $table) {
            $table->id();
            $table->string('kind');
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('code', 40)->nullable()->unique();
            $table->foreignId('patient_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('patient_promotions')->restrictOnDelete();
            $table->string('discount_type');
            $table->decimal('discount_value', 10, 2);
            $table->decimal('minimum_subtotal', 10, 2)->nullable();
            $table->decimal('maximum_discount', 10, 2)->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->unsignedSmallInteger('validity_days')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedInteger('per_patient_limit')->nullable();
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['kind', 'is_active', 'valid_from', 'valid_until']);
        });

        Schema::create('patient_promotion_test', function (Blueprint $table) {
            $table->foreignId('patient_promotion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_id')->constrained()->restrictOnDelete();
            $table->primary(['patient_promotion_id', 'test_id']);
        });

        Schema::create('patient_promotion_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_promotion_id')->constrained()->restrictOnDelete();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->unique()->constrained()->restrictOnDelete();
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();

            $table->unique(
                ['patient_promotion_id', 'patient_id', 'order_id'],
                'patient_promo_redemptions_promo_patient_order_unique',
            );
            $table->index(
                ['patient_promotion_id', 'patient_id'],
                'patient_promo_redemptions_promo_patient_index',
            );
        });

        Schema::create('patient_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inviter_patient_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('invited_patient_id')->unique()->constrained('patients')->restrictOnDelete();
            $table->foreignId('reward_template_id')->constrained('patient_promotions')->restrictOnDelete();
            $table->string('referral_code', 40);
            $table->timestamp('accepted_at');
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamps();

            $table->index(['inviter_patient_id', 'rewarded_at']);
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->string('referral_code', 24)->nullable()->unique();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('patient_promotion_id')
                ->nullable()
                ->constrained('patient_promotions')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('patient_promotion_id');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropUnique(['referral_code']);
            $table->dropColumn('referral_code');
        });

        Schema::dropIfExists('patient_referrals');
        Schema::dropIfExists('patient_promotion_redemptions');
        Schema::dropIfExists('patient_promotion_test');
        Schema::dropIfExists('patient_promotions');
    }
};
