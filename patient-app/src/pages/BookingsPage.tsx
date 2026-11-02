import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, LoadingState } from '@/components/Feedback';
import { PageHeader } from '@/components/PageHeader';
import { StatusPill } from '@/components/StatusPill';
import { useAuth } from '@/features/auth/AuthProvider';
import { getOrders } from '@/features/patient/api';
import { ApiError } from '@/lib/api-client';
import { formatDate, formatPrice } from '@/lib/format';
import { PATIENT_PORTAL_UPDATE_EVENT } from '@/lib/patient-realtime';
import type { PatientOrder } from '@/types/api';

export function BookingsPage() {
    const { token } = useAuth();
    const location = useLocation();
    const createdOrder = (location.state as { createdOrder?: string } | null)?.createdOrder;
    const [orders, setOrders] = useState<PatientOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const refreshAfterUpdate = () => setReload((value) => value + 1);
        window.addEventListener(PATIENT_PORTAL_UPDATE_EVENT, refreshAfterUpdate);
        return () => window.removeEventListener(PATIENT_PORTAL_UPDATE_EVENT, refreshAfterUpdate);
    }, []);

    useEffect(() => {
        if (!token) return;
        let current = true;
        setLoading(true);
        void getOrders(token)
            .then((response) => { if (current) setOrders(response.data); })
            .catch((requestError: unknown) => { if (current) setError(requestError instanceof ApiError ? requestError.message : 'مش قادرين نحمّل طلباتك.'); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [token, reload]);

    return (
        <div className="page-stack">
            <PageHeader eyebrow="رحلتك مع المختبر" title="طلباتي" description="تابع حالة الطلب والعينة والميعاد اللي طلبته." action={<Link to="/booking" className="button button-primary button-small">طلب جديد <ArrowLeft size={15} /></Link>} />
            {createdOrder && <div className="success-banner" role="status"><span>✓</span><p><strong>طلبك اتسجل بنجاح</strong><small>رقم الطلب <bdi dir="ltr">{createdOrder}</bdi> — الميعاد المطلوب هيتأكد من المختبر.</small></p></div>}
            {error && <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />}
            {loading ? <LoadingState /> : orders.length ? (
                <div className="order-list">
                    {orders.map((order) => {
                        const pending = order.items.some((item) => item.sample?.status === 'pending_collection');
                        return (
                            <article key={order.id} className="order-card">
                                <div className="order-card-head">
                                    <div><span className="order-reference">رقم الطلب</span><strong className="order-number" dir="ltr">{order.order_number}</strong></div>
                                    <StatusPill status={pending ? 'pending_collection' : order.status} />
                                </div>
                                <div className="order-test-chips">{order.items.map((item) => <span key={item.id}>{item.test_name}</span>)}</div>
                                {order.collection_requested_at && <div className="order-detail-line"><CalendarDays size={15} /><span>الميعاد المطلوب: {formatDate(order.collection_requested_at, { timeStyle: 'short' })}</span></div>}
                                {order.collection_address && <div className="order-detail-line"><MapPin size={15} /><span>{order.collection_address}</span></div>}
                                {order.expected_result_at && <div className="order-detail-line"><CalendarDays size={15} /><span>الوقت المتوقع للنتيجة: {formatDate(order.expected_result_at, { timeStyle: 'short' })}</span></div>}
                                <div className="order-card-foot"><span>اتسجل {formatDate(order.created_at)}</span><strong>{formatPrice(order.total)}</strong></div>
                                <div className="sample-status-list">{order.items.map((item) => <div key={item.id}><span>{item.test_name}</span><StatusPill status={item.sample?.status ?? 'pending_collection'} /></div>)}</div>
                            </article>
                        );
                    })}
                </div>
            ) : <EmptyState title="مفيش طلبات لسه" description="لما تبعت طلب جديد، هتتابع تفاصيله وحالة كل عينة من هنا." action={{ label: 'ابدأ طلبك', to: '/booking' }} />}
        </div>
    );
}
