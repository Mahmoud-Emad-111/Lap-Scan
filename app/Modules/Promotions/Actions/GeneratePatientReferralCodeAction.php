<?php

namespace App\Modules\Promotions\Actions;

use App\Models\Patient;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GeneratePatientReferralCodeAction
{
    public function handle(Patient $patient): string
    {
        return DB::transaction(function () use ($patient): string {
            $patient = Patient::query()
                ->whereKey($patient->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($patient->referral_code !== null) {
                return $patient->referral_code;
            }

            do {
                $code = 'LAP-'.Str::upper(Str::random(12));
            } while (Patient::query()->where('referral_code', $code)->exists());

            $patient->forceFill(['referral_code' => $code])->save();

            return $code;
        });
    }
}
