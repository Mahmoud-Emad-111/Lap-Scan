import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, FileHeart, FlaskConical, ShieldCheck, Sparkles, TicketPercent } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, LoadingState } from '@/components/Feedback';
import { PageHeader } from '@/components/PageHeader';
import { StatusPill } from '@/components/StatusPill';
import { useAuth } from '@/features/auth/AuthProvider';
import { getOffers, getOrders, getPatientPortalSettings, getResults, getTests } from '@/features/patient/api';
import { formatDate, formatPrice } from '@/lib/format';
import type { LabTest, PatientOrder, PatientPromotion, PatientResult } from '@/types/api';
import { ApiError } from '@/lib/api-client';
import { PATIENT_PORTAL_UPDATE_EVENT } from '@/lib/patient-realtime';

export function HomePage() {
    const { token, profile } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<PatientOrder[]>([]);
    const [results, setResults] = useState<PatientResult[]>([]);
    const [tests, setTests] = useState<LabTest[]>([]);
    const [offers, setOffers] = useState<PatientPromotion[]>([]);
    const [homeCollectionEnabled, setHomeCollectionEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [offerError, setOfferError] = useState('');
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
        setError('');
        void Promise.all([
            getOrders(token),
            getResults(token),
            getTests(token),
            getPatientPortalSettings(token),
        ])
            .then(([ordersPage, resultsPage, testsPage, settings]) => {
                if (!current) return;
                setOrders(ordersPage.data);
                setResults(resultsPage.data);
                setTests(testsPage.data);
                setHomeCollectionEnabled(settings.data.home_collection_enabled);
            })
            .catch((requestError: unknown) => {
                if (current) setError(requestError instanceof ApiError ? requestError.message : 'مش قادرين نحمّل بياناتك.');
            })
            .finally(() => {
                if (current) setLoading(false);
            });
        return () => { current = false; };
    }, [token, reload]);

    useEffect(() => {
        if (!token) return;
        let current = true;
        void getOffers(token)
            .then((response) => {
                if (current) {
                    setOffers(response.data);
                    setOfferError('');
                }
            })
            .catch((requestError: unknown) => {
                if (current) {
                    setOfferError(requestError instanceof ApiError
                        ? requestError.message
                        : 'مش قادرين نحمّل العروض دلوقتي.');
                }
            });
        return () => { current = false; };
    }, [token]);

    const activeOrder = orders.find((order) => !['completed', 'cancelled'].includes(order.status));

    return (
        <div className="page-stack">
            <PageHeader eyebrow="مساحتك الصحية" title={`صباح الخير، ${profile?.full_name.split(' ')[0] ?? 'بيك'} 👋`} description="كل اللي يخص تحاليلك ومواعيدك في مكان واحد." />
            <section className="home-hero">
                <div className="hero-copy">
                    <span className="hero-kicker"><Sparkles size={14} /> {homeCollectionEnabled === false ? 'خدمة السحب المنزلي غير متاحة حالياً' : homeCollectionEnabled ? 'خدمة سحب العينات من البيت' : 'بنتأكد من توافر الخدمة'}</span>
                    <h2>{homeCollectionEnabled === false ? <>طلباتك ونتايجك،<br />كلها في مكان واحد.</> : <>خليك في راحتك،<br />والعينة تيجي لحد عندك.</>}</h2>
                    <p>{homeCollectionEnabled === true ? 'اختار التحاليل والعنوان والوقت المناسب ليك. هنبعتلك تأكيد الطلب من المختبر.' : homeCollectionEnabled === false ? 'الخدمة متوقفة مؤقتاً. تقدر تتابع طلباتك ونتايجك من التطبيق.' : 'بنحمّل حالة خدمة السحب المنزلي.'}</p>
                    {homeCollectionEnabled ? (
                        <Link to="/booking" className="button button-light">اطلب زيارة منزلية <ArrowLeft size={16} /></Link>
                    ) : (
                        <p className="schedule-note" role="status">{homeCollectionEnabled === false ? 'خدمة السحب المنزلي غير متاحة حالياً.' : 'جارٍ التحقق من توافر الخدمة...'}</p>
                    )}
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="hero-disc"><FlaskConical size={48} strokeWidth={1.2} /></div>
                    <span className="hero-orbit orbit-a" />
                    <span className="hero-orbit orbit-b" />
                    <span className="hero-art-caption">رعاية<br />على بابك</span>
                </div>
            </section>

            {offers.length > 0 && (
                <section className="section-block">
                    <div className="section-heading">
                        <div><span className="section-overline">متاح لفترة محدودة</span><h2>عروض وباقات المختبر</h2></div>
                        <TicketPercent size={20} aria-hidden="true" />
                    </div>
                    <div className="home-test-list">
                        {offers.slice(0, 3).map((offer) => (
                            <article key={offer.id} className="home-test-row offer-row">
                                <span className="test-mini-icon"><TicketPercent size={16} /></span>
                                <span className="home-test-name">
                                    <strong>{offer.name}</strong>
                                    <small>
                                        {offer.discount_type === 'percentage'
                                            ? `خصم ${Number(offer.discount_value)}٪`
                                            : `خصم ${formatPrice(offer.discount_value)}`}
                                        {offer.valid_until ? ` · لحد ${formatDate(offer.valid_until)}` : ''}
                                    </small>
                                </span>
                                <button
                                    type="button"
                                    className="text-button"
                                    onClick={() => navigate('/booking', {
                                        state: {
                                            testIds: offer.tests.map((test) => test.id),
                                            promotionId: offer.id,
                                        },
                                    })}
                                >
                                    استخدم العرض
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            )}
            {offerError && <p className="form-error" role="alert">{offerError}</p>}

            {error && <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />}

            <section className="summary-grid" aria-label="ملخص حسابك">
                <Link to="/bookings" className="summary-tile">
                    <span className="summary-icon tone-mint"><CalendarDays size={19} /></span>
                    <span><small>طلباتي</small><strong>{loading ? '—' : orders.length}</strong></span>
                    <ArrowLeft className="summary-arrow" size={15} />
                </Link>
                <Link to="/results" className="summary-tile">
                    <span className="summary-icon tone-lilac"><FileHeart size={19} /></span>
                    <span><small>نتايج جاهزة</small><strong>{loading ? '—' : results.length}</strong></span>
                    <ArrowLeft className="summary-arrow" size={15} />
                </Link>
            </section>

            <section className="section-block">
                <div className="section-heading">
                    <div><span className="section-overline">متابعة</span><h2>آخر طلب ليك</h2></div>
                    {orders.length > 0 && <Link to="/bookings" className="subtle-link">كل الطلبات <ArrowLeft size={14} /></Link>}
                </div>
                {loading ? <LoadingState /> : activeOrder ? (
                    <article className="active-order">
                        <div className="active-order-top">
                            <span className="order-reference">طلب <bdi dir="ltr">{activeOrder.order_number}</bdi></span>
                            <StatusPill status={activeOrder.items.some((item) => item.sample?.status === 'pending_collection') ? 'pending_collection' : activeOrder.status} />
                        </div>
                        <h3>{activeOrder.items.map((item) => item.test_name).join('، ')}</h3>
                        <div className="active-order-info">
                            <span><CalendarDays size={15} /> {activeOrder.collection_requested_at ? formatDate(activeOrder.collection_requested_at, { timeStyle: 'short' }) : formatDate(activeOrder.created_at)}</span>
                            <span>{formatPrice(activeOrder.total)}</span>
                        </div>
                        <div className="order-progress" aria-label="حالة الطلب">
                            {['تم التسجيل', 'سحب العينة', 'المعمل', 'النتيجة'].map((step, index) => {
                                const progress = activeOrder.status === 'completed' ? 3
                                    : activeOrder.status === 'processing' ? 2
                                      : activeOrder.items.every((item) => item.sample?.status === 'collected') ? 1 : 0;
                                return <div key={step} className={`progress-step ${index <= progress ? 'step-done' : ''}`}><i /><span>{step}</span></div>;
                            })}
                        </div>
                    </article>
                ) : (
                    <EmptyState title="لسه مفيش طلبات" description="لما تطلب تحليل أو سحب منزلي، هتلاقي حالة الطلب هنا." action={{ label: 'اختار تحاليلك', to: '/tests' }} icon={<CalendarDays size={24} />} />
                )}
            </section>

            <section className="section-block">
                <div className="section-heading">
                    <div><span className="section-overline">كتالوج المختبر</span><h2>تحاليل متاحة</h2></div>
                    <Link to="/tests" className="subtle-link">عرض الكل <ArrowLeft size={14} /></Link>
                </div>
                {loading ? <LoadingState /> : tests.length ? (
                    <div className="home-test-list">
                        {tests.slice(0, 3).map((test) => (
                            <button key={test.id} className="home-test-row" onClick={() => navigate('/booking', { state: { testIds: [test.id] } })}>
                                <span className="test-mini-icon"><FlaskConical size={16} /></span>
                                <span className="home-test-name"><strong>{test.name}</strong><small>{test.code}</small></span>
                                <strong>{formatPrice(test.price)}</strong><ArrowLeft size={15} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <EmptyState title="كتالوج التحاليل مش متاح دلوقتي" description="جرّب تاني بعد شوية أو تواصل مع المختبر." />
                )}
            </section>

            <div className="privacy-banner"><ShieldCheck size={18} /><p><strong>بياناتك الطبية أمانة</strong><span>النتايج المعتمدة بس هي اللي بتظهر في حسابك.</span></p></div>
        </div>
    );
}
