<?php

namespace App\Enums;

enum SampleStatus: string
{
    case PendingCollection = 'pending_collection';
    case Collected = 'collected';
}
