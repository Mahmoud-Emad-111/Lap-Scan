import type { ReactNode } from 'react';
import { displayStatus } from '@/components/laboratory/workflow-types';

export function StatusBadge({ status }: { status: string | undefined }) {
    const tone =
        status === 'approved' ||
        status === 'completed' ||
        status === 'collected'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : status === 'cancelled'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : status === 'processing'
                ? 'border-sky-200 bg-sky-50 text-sky-700'
                : 'border-amber-200 bg-amber-50 text-amber-700';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}
        >
            <span className="size-1.5 rounded-full bg-current opacity-70" />
            {displayStatus(status)}
        </span>
    );
}

export function PageShell({
    children,
    title,
    description,
    action,
}: {
    children: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <section className="grid gap-6">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-700">
                        <span className="size-1.5 rounded-full bg-brand-500" />
                        إدارة المختبر
                    </div>
                    <div className="grid gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-ink-950">
                            {title}
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>
                {action}
            </header>
            {children}
        </section>
    );
}

export function DataTable({
    headings,
    children,
}: {
    headings: string[];
    children: ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_-22px_rgba(20,54,49,0.5)]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-right text-sm">
                    <thead className="bg-[#f7f9f8] text-[11px] font-bold text-slate-500">
                        <tr>
                            {headings.map((heading) => (
                                <th
                                    key={heading}
                                    className="border-b border-slate-200/70 px-5 py-4.5 whitespace-nowrap"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-[#f8fbfa]">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TableCell({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <td
            className={`px-5 py-4.5 text-[13px] leading-5 text-slate-600 ${className}`}
        >
            {children}
        </td>
    );
}

export function PrimaryButton({
    children,
    onClick,
    disabled = false,
    type = 'button',
}: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm shadow-brand-700/15 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
            {children}
        </button>
    );
}
