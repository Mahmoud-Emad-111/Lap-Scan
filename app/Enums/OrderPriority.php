<?php

namespace App\Enums;

enum OrderPriority: string
{
    case Normal = 'normal';
    case Urgent = 'urgent';
}
