<?php

namespace App\Models;

use Database\Factories\TestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    /** @use HasFactory<TestFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'specimen_type',
        'price',
        'turnaround_time_minutes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'turnaround_time_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
