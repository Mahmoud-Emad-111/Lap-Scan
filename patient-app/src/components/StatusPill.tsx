const statusNames: Record<string, string> = {
    registered: 'تم تسجيل الطلب',
    processing: 'العينة في المعمل',
    completed: 'الطلب مكتمل',
    cancelled: 'الطلب ملغي',
    pending_collection: 'بانتظار سحب العينة',
    collected: 'تم سحب العينة',
};

export function StatusPill({ status }: { status: string }) {
    const tone = status === 'completed' || status === 'collected'
        ? 'positive'
        : status === 'cancelled'
          ? 'negative'
          : status === 'processing'
            ? 'active'
            : 'waiting';

    return <span className={`status-pill status-${tone}`}><i />{statusNames[status] ?? status}</span>;
}
