<?php

namespace App\Modules\Branches\Actions;

use App\Models\Branch;
use Illuminate\Support\Facades\DB;

class SaveBranchAction
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(array $attributes, ?Branch $branch = null): Branch
    {
        return DB::transaction(function () use ($attributes, $branch): Branch {
            $isDefault = $attributes['is_default'] ?? ($branch !== null && $branch->is_default);

            if (! $isDefault && $branch?->is_default) {
                $hasAnotherDefault = Branch::query()
                    ->where('id', '!=', $branch->id)
                    ->where('is_default', true)
                    ->exists();

                if (! $hasAnotherDefault) {
                    $attributes['is_default'] = true;
                    $isDefault = true;
                }
            }

            if ($isDefault) {
                $query = Branch::query()->where('is_default', true);

                if ($branch !== null) {
                    $query->where('id', '!=', $branch->id);
                }

                $query->update(['is_default' => false]);
            }

            $branch ??= new Branch;
            $branch->fill($attributes);

            if (! Branch::query()->where('is_default', true)->exists()) {
                $branch->is_default = true;
            }

            $branch->save();

            return $branch->refresh();
        });
    }
}
