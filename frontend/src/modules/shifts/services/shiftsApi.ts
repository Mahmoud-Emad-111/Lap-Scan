import BranchController from '@/actions/App/Http/Controllers/Api/V1/BranchController';
import ShiftAttendanceController from '@/actions/App/Http/Controllers/Api/V1/ShiftAttendanceController';
import ShiftScheduleController from '@/actions/App/Http/Controllers/Api/V1/ShiftScheduleController';
import UserController from '@/actions/App/Http/Controllers/Api/V1/UserController';
import { apiRequest } from '@/lib/api-client';
import type { ApiPage } from '@/types/api';
import type {
    ShiftOccurrencePage,
    ShiftSchedule,
    ShiftSchedulePayload,
    ShiftStaffOption,
} from '@/modules/shifts/types';

type DataResponse<T> = { data: T };

export function fetchShiftOccurrences(
    token: string,
    week: string,
    url?: string,
): Promise<ShiftOccurrencePage> {
    return apiRequest<ShiftOccurrencePage>(
        url ?? ShiftAttendanceController.index({ query: { week } }),
        token,
    );
}

export async function fetchShiftSchedules(
    token: string,
): Promise<ShiftSchedule[]> {
    return fetchAllPages<ShiftSchedule>(
        ShiftScheduleController.index().url,
        token,
    );
}

export async function fetchShiftOptions(token: string): Promise<{
    staff: ShiftStaffOption[];
    branches: Array<{ id: number; name: string }>;
}> {
    const [staff, branches] = await Promise.all([
        fetchAllPages<ShiftStaffOption>(UserController.index().url, token),
        fetchAllPages<{ id: number; name: string; is_active: boolean }>(
            BranchController.index().url,
            token,
        ),
    ]);

    return {
        staff: staff.filter(
            (user) => user.role === 'lab_staff' && user.branches.length > 0,
        ),
        branches: branches
            .filter((branch) => branch.is_active)
            .map(({ id, name }) => ({ id, name })),
    };
}

export async function createShiftSchedule(
    token: string,
    payload: ShiftSchedulePayload,
): Promise<void> {
    await apiRequest<unknown>(ShiftScheduleController.store(), token, payload);
}

export async function setShiftScheduleActive(
    token: string,
    scheduleId: number,
    isActive: boolean,
): Promise<void> {
    await apiRequest<unknown>(
        ShiftScheduleController.update.patch({ shiftSchedule: scheduleId }),
        token,
        { is_active: isActive },
    );
}

export async function clockIn(
    token: string,
    scheduleId: number,
    shiftDate: string,
): Promise<void> {
    await apiRequest<DataResponse<unknown>>(
        ShiftAttendanceController.clockIn({ shiftSchedule: scheduleId }),
        token,
        { shift_date: shiftDate },
    );
}

export async function clockOut(
    token: string,
    scheduleId: number,
    shiftDate: string,
): Promise<void> {
    await apiRequest<DataResponse<unknown>>(
        ShiftAttendanceController.clockOut({ shiftSchedule: scheduleId }),
        token,
        { shift_date: shiftDate },
    );
}

async function fetchAllPages<T>(url: string, token: string): Promise<T[]> {
    const records: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl !== null) {
        const page: ApiPage<T> = await apiRequest<ApiPage<T>>(nextUrl, token);
        records.push(...page.data);
        nextUrl = page.links.next;
    }

    return records;
}
