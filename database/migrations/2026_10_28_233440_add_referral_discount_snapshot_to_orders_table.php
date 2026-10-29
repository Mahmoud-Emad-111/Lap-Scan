<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->foreignId('discount_rule_id')
                ->nullable()
                ->constrained('referral_discount_rules')
                ->nullOnDelete();
            $table->json('discount_snapshot')->nullable();
        });

        DB::table('orders')->update(['subtotal' => DB::raw('total')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['discount_rule_id']);
            $table->dropColumn([
                'subtotal',
                'discount_amount',
                'discount_rule_id',
                'discount_snapshot',
            ]);
        });
    }
};
