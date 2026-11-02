export function formatPrice(value: string | number): string {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 2,
    }).format(Number(value));
}

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions): string {
    if (!value) {
        return 'لسه مش متحدد';
    }

    return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'medium',
        ...options,
    }).format(new Date(value));
}

export function localDateTimeInputValue(date: Date): string {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 16);
}
