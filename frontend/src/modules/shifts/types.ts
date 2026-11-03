import type { ApiPage } from '@/types/api';

export type ShiftOccurrence = {
    shift_schedule_id: number;
    shift_date: string;
    starts_at: string;
    ends_at: string;
    branch: { id: number; name: string };
    user: { id: number; name: string };
    attendance: {
        id: number;
        clocked_in_at: string | null;
        clocked_out_at: string | null;
    } | null;
};

export type ShiftOccurrencePage = ApiPage<ShiftOccurrence>;

export type ShiftSchedule = {
    id: number;
    branch: { id: number; name: string };
    user: { id: number; name: string };
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    effective_from: string;
    effective_until: string | null;
    is_active: boolean;
};

export type ShiftSchedulePage = ApiPage<ShiftSchedule>;

export type ShiftSchedulePayload = {
    branch_id: number;
    user_id: number;
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    effective_from: string;
    effective_until: string | null;
};

export type ShiftStaffOption = {
    id: number;
    name: string;
    role: string;
    branches: Array<{ id: number }>;
};
