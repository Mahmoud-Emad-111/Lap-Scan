export type ApiPage<T> = {
    data: T[];
    links: {
        next: string | null;
        prev: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
};
