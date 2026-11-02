<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = [
        'home_collection_enabled',
    ];

    public static function homeCollectionEnabled(): bool
    {
        $enabled = static::query()->value('home_collection_enabled');

        return $enabled === null || (bool) $enabled;
    }

    protected function casts(): array
    {
        return [
            'home_collection_enabled' => 'boolean',
        ];
    }
}
