export type NotificationSound = 'single' | 'double' | 'triple';

export const notificationSoundOptions: Array<{
    value: NotificationSound;
    label: string;
}> = [
    { value: 'single', label: 'نغمة قصيرة' },
    { value: 'double', label: 'نغمتان' },
    { value: 'triple', label: 'ثلاث نغمات هادئة' },
];
