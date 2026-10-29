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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('referring_doctor_id')
                ->nullable()
                ->after('created_by')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('source')->default('laboratory')->after('status');
            $table->string('priority')->default('normal')->after('source');
            $table->text('urgent_reason')->nullable()->after('priority');
            $table->uuid('request_key')->nullable()->after('urgent_reason');
            $table->unique(['referring_doctor_id', 'request_key']);
            $table->index(['referring_doctor_id', 'created_at']);
            $table->index(['priority', 'status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['priority', 'status', 'created_at']);
            $table->dropIndex(['referring_doctor_id', 'created_at']);
            $table->dropUnique(['referring_doctor_id', 'request_key']);
            $table->dropConstrainedForeignId('referring_doctor_id');
            $table->dropColumn(['source', 'priority', 'urgent_reason', 'request_key']);
        });
    }
};
