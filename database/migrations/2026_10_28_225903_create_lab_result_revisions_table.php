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
        Schema::create('lab_result_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_result_id')
                ->constrained('lab_results')
                ->restrictOnDelete();
            $table->unsignedInteger('version');
            $table->text('value');
            $table->string('unit')->nullable();
            $table->string('reference_range')->nullable();
            $table->text('notes')->nullable();
            $table->string('status');
            $table->foreignId('entered_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('entered_at');
            $table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('correction_reason');
            $table->foreignId('corrected_by')->constrained('users')->restrictOnDelete();
            $table->string('corrector_name');
            $table->timestamp('corrected_at');
            $table->timestamps();

            $table->unique(['lab_result_id', 'version']);
            $table->index(['lab_result_id', 'corrected_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_result_revisions');
    }
};
