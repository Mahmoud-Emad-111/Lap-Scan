<?php

namespace App\Enums;

enum UserRole: string
{
    case Patient = 'patient';
    case Doctor = 'doctor';
    case LabStaff = 'lab_staff';
    case LabAdmin = 'lab_admin';

    public function canManagePatients(): bool
    {
        return in_array($this, [self::LabStaff, self::LabAdmin], true);
    }

    public function canManageCatalog(): bool
    {
        return in_array($this, [self::LabStaff, self::LabAdmin], true);
    }

    public function canManageOrders(): bool
    {
        return in_array($this, [self::LabStaff, self::LabAdmin], true);
    }

    public function canManageUsers(): bool
    {
        return $this === self::LabAdmin;
    }
}
