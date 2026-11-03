<?php

namespace App\Http\Requests\Api\V1;

use App\Models\ShiftSchedule;
use Illuminate\Foundation\Http\FormRequest;

class ShiftAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $schedule = $this->route('shiftSchedule');

        return $schedule instanceof ShiftSchedule
            && ($this->user()?->can('clockAttendance', $schedule) ?? false);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'shift_date' => ['required', 'date_format:Y-m-d'],
        ];
    }
}
