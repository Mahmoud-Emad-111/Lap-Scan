import type { ReactNode } from 'react';

export type IconName =
    | 'activity'
    | 'arrow-left'
    | 'arrow-right'
    | 'beaker'
    | 'bell'
    | 'branch'
    | 'check'
    | 'chevron-down'
    | 'clock'
    | 'clipboard'
    | 'close'
    | 'dashboard'
    | 'edit'
    | 'file'
    | 'report'
    | 'flask'
    | 'logout'
    | 'menu'
    | 'plus'
    | 'search'
    | 'settings'
    | 'shield'
    | 'users';

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true as const,
    };

    const shapes: Record<IconName, ReactNode> = {
        activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
        'arrow-left': (
            <>
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
            </>
        ),
        'arrow-right': (
            <>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </>
        ),
        beaker: (
            <>
                <path d="M9 3h6" />
                <path d="M10 3v7l-5.3 8.2A2.5 2.5 0 0 0 6.8 22h10.4a2.5 2.5 0 0 0 2.1-3.8L14 10V3" />
                <path d="M8 16h8" />
            </>
        ),
        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
            </>
        ),
        branch: (
            <>
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
                <path d="M7 10v3a3 3 0 0 0 3 3h4" />
                <path d="M17 14v-3a3 3 0 0 0-3-3h-4" />
            </>
        ),
        check: <path d="m5 12 4 4L19 6" />,
        'chevron-down': <path d="m6 9 6 6 6-6" />,
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        clipboard: (
            <>
                <rect x="5" y="4" width="14" height="17" rx="2" />
                <path d="M9 4.5h6a1.5 1.5 0 0 0-3-1.5h0a1.5 1.5 0 0 0-3 1.5ZM8 11h8M8 15h8" />
            </>
        ),
        close: <path d="m18 6-12 12M6 6l12 12" />,
        dashboard: (
            <>
                <rect x="3" y="3" width="8" height="8" rx="2" />
                <rect x="13" y="3" width="8" height="5" rx="2" />
                <rect x="13" y="10" width="8" height="11" rx="2" />
                <rect x="3" y="13" width="8" height="8" rx="2" />
            </>
        ),
        edit: (
            <>
                <path d="m16 4 4 4L9 19l-5 1 1-5L16 4Z" />
                <path d="m14 6 4 4" />
            </>
        ),
        file: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h8" />
            </>
        ),
        report: (
            <>
                <path d="M4 19V5M4 19h17" />
                <path d="m7 15 4-4 3 2 5-7" />
            </>
        ),
        flask: (
            <>
                <path d="M9 3h6M10 3v7l-5.3 8.2A2.5 2.5 0 0 0 6.8 22h10.4a2.5 2.5 0 0 0 2.1-3.8L14 10V3" />
                <path d="M8 16h8" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </>
        ),
        menu: <path d="M4 6h16M4 12h16M4 18h16" />,
        plus: <path d="M12 5v14M5 12h14" />,
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="m9 12 2 2 4-4" />
            </>
        ),
        users: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
            </>
        ),
    };

    return <svg {...common}>{shapes[name]}</svg>;
}
