import { Icon, type IconName } from '@/components/ui/icon';

export function EmptyState({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: IconName;
}) {
    return (
        <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="grid justify-items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon name={icon} size={22} />
                </span>
                <div className="grid gap-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="max-w-sm text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function LoadingRows({ label = 'جاري التحميل' }: { label?: string }) {
    return (
        <div className="grid gap-3 p-5" aria-label={label}>
            {[1, 2, 3].map((row) => (
                <div
                    key={row}
                    className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
            ))}
        </div>
    );
}

export function ErrorBanner({
    message,
    onDismiss,
}: {
    message: string;
    onDismiss?: () => void;
}) {
    return (
        <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
        >
            <span>{message}</span>
            {onDismiss && (
                <button
                    type="button"
                    aria-label="إغلاق"
                    onClick={onDismiss}
                    className="shrink-0"
                >
                    <Icon name="close" size={17} />
                </button>
            )}
        </div>
    );
}
