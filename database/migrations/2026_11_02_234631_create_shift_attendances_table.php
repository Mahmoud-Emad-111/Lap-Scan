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
        Schema::create('shift_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_schedule_id')->constrained()->restrictOnDelete();
            $table->date('shift_date');
            $table->timestamp('clocked_in_at');
            $table->timestamp('clocked_out_at')->nullable();
            $table->timestamps();

            $table->unique(['shift_schedule_id', 'shift_date']);
            $table->index(['shift_date', 'shift_schedule_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_attendances');
    }
};
