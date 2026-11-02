import {
    show as showAppSettings,
    update as updateAppSettingsRoute,
} from '@/actions/App/Http/Controllers/Api/V1/AppSettingController';
import { apiRequest } from '@/lib/api-client';

export type AppSettings = {
    home_collection_enabled: boolean;
};

type DataResponse<T> = { data: T };

export async function fetchAppSettings(token: string): Promise<AppSettings> {
    const response = await apiRequest<DataResponse<AppSettings>>(
        showAppSettings(),
        token,
    );

    return response.data;
}

export async function updateAppSettings(
    token: string,
    settings: AppSettings,
): Promise<AppSettings> {
    const response = await apiRequest<DataResponse<AppSettings>>(
        updateAppSettingsRoute.patch(),
        token,
        settings,
    );

    return response.data;
}
