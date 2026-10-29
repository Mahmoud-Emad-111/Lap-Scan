<?php

namespace App\Enums;

enum OrderSource: string
{
    case Laboratory = 'laboratory';
    case Doctor = 'doctor';
}
