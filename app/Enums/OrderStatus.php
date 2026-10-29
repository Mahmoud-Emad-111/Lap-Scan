<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Registered = 'registered';
    case Processing = 'processing';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
