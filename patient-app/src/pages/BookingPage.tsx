import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Clock3, MapPin, Plus, ShieldCheck, TicketPercent } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState } from '@/components/Feedback';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import { createAddress, createHomeCollection, getAddresses, getBranches, getOffers, getPatientPortalSettings, getTests } from '@/features/patient/api';
import { ApiError } from '@/lib/api-client';
import { formatPrice, localDateTimeInputValue } from '@/lib/format';
import type { Branch, LabTest, PatientAddress, PatientPromotion } from '@/types/api';

type BookingRouteState = { testIds?: number[]; promotionId?: number };

export function BookingPage() {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const initialTestIds = (location.state as BookingRouteState | null)?.testIds ?? [];
    const initialPromotionId = (location.state as BookingRouteState | null)?.promotionId;
    const [tests, setTests] = useState<LabTest[]>([]);
    const [offers, setOffers] = useState<PatientPromotion[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [addresses, setAddresses] = useState<PatientAddress[]>([]);
    const [homeCollectionEnabled, setHomeCollectionEnabled] = useState<boolean | null>(null);
    const [selectedTests, setSelectedTests] = useState<number[]>(initialTestIds);
    const [promotionId, setPromotionId] = useState(initialPromotionId ? String(initialPromotionId) : '');
    const [couponCode, setCouponCode] = useState('');
    const [addressId, setAddressId] = useState('');
    const [branchId, setBranchId] = useState('');
    const [requestedAt, setRequestedAt] = useState('');
    const [notes, setNotes] = useState('');
    const [addressFormOpen, setAddressFormOpen] = useState(false);
    const [addressLabel, setAddressLabel] = useState('البيت');
    const [addressText, setAddressText] = useState('');
    const [addressInstructions, setAddressInstructions] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [offerError, setOfferError] = useState('');
    const [reload, setReload] = useState(0);

    useEffect(() => {
        if (!token) return;
        let current = true;
        setLoading(true);
        void (async () => {
            try {
                const settings = await getPatientPortalSettings(token);
                if (!current) return;

                setHomeCollectionEnabled(settings.data.home_collection_enabled);
                if (!settings.data.home_collection_enabled) return;

                const [testsPage, branchesPage, addressesPage] = await Promise.all([
                    getTests(token),
                    getBranches(token),
                    getAddresses(token),
                ]);
                if (!current) return;

                setTests(testsPage.data);
                setBranches(branchesPage.data);
                setAddresses(addressesPage.data);
                setBranchId((value) => value || String(branchesPage.data.find((branch) => branch.is_default)?.id ?? branchesPage.data[0]?.id ?? ''));
                setAddressId((value) => value || String(addressesPage.data.find((address) => address.is_default)?.id ?? addressesPage.data[0]?.id ?? ''));
                setAddressFormOpen(addressesPage.data.length === 0);
            } catch (requestError: unknown) {
                if (current) {
                    setError(requestError instanceof ApiError ? requestError.message : 'مش قادرين نجهّز الطلب دلوقتي.');
                }
            } finally {
                if (current) setLoading(false);
            }
        })();
        return () => { current = false; };
    }, [token, reload]);

    useEffect(() => {
        if (!token) return;
        let current = true;
        void getOffers(token)
            .then((response) => {
                if (current) setOffers(response.data);
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

    const chosenTests = useMemo(() => tests.filter((test) => selectedTests.includes(test.id)), [tests, selectedTests]);
    const subtotal = chosenTests.reduce((sum, test) => sum + Number(test.price), 0);
    const selectedOffer = offers.find((offer) => String(offer.id) === promotionId) ?? null;
    const minimumDateTime = localDateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000));

    function toggleTest(id: number) {
        setPromotionId('');
        setSelectedTests((current) => current.includes(id) ? current.filter((testId) => testId !== id) : [...current, id]);
    }

    function selectOffer(value: string) {
        const offer = offers.find((item) => String(item.id) === value);
        setPromotionId(value);
        setCouponCode('');
        if (offer) {
            setSelectedTests(offer.tests.map((test) => test.id));
        }
    }

    async function addAddress() {
        if (!token || !addressText.trim()) return;
        setBusy(true);
        setError('');
        try {
            const response = await createAddress(token, {
                label: addressLabel.trim() || 'عنوان جديد',
                address: addressText.trim(),
                instructions: addressInstructions.trim() || null,
                is_default: addresses.length === 0,
            });
            setAddresses((current) => [response.data, ...current]);
            setAddressId(String(response.data.id));
            setAddressText('');
            setAddressInstructions('');
            setAddressFormOpen(false);
        } catch (requestError) {
            setError(requestError instanceof ApiError ? requestError.message : 'تعذّر حفظ العنوان.');
        } finally {
            setBusy(false);
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        setBusy(true);
        setError('');
        try {
            const response = await createHomeCollection(token, {
                address_id: Number(addressId),
                branch_id: Number(branchId),
                test_ids: selectedTests,
                collection_requested_at: new Date(requestedAt).toISOString(),
                notes: notes.trim(),
                ...(promotionId ? { promotion_id: Number(promotionId) } : {}),
                ...(couponCode.trim() ? { coupon_code: couponCode.trim() } : {}),
            });
            navigate('/bookings', { state: { createdOrder: response.data.order_number } });
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.validationErrors.test_ids) {
                setError('في تحليل بقى مش متاح بالسعر الحالي. راجع اختياراتك وحاول تاني.');
            } else {
                setError(requestError instanceof ApiError ? requestError.message : 'تعذّر إرسال طلبك.');
            }
        } finally {
            setBusy(false);
        }
    }

    if (loading) return <LoadingState />;

    if (homeCollectionEnabled !== true) {
        return (
            <div className="page-stack">
                <Link to="/tests" className="back-link"><ArrowRight size={16} /> رجوع للتحاليل</Link>
                <PageHeader eyebrow="طلب جديد" title="سحب عينة من البيت" description="الخدمات المتاحة بتتحدث حسب إعدادات المختبر." />
                {homeCollectionEnabled === false ? (
                    <section className="form-section" role="status">
                        <h2>خدمة السحب المنزلي غير متاحة حالياً</h2>
                        <p>تقدر تتابع طلباتك ونتايجك من التطبيق، أو تتواصل مع المختبر لمعرفة البدائل المتاحة.</p>
                    </section>
                ) : (
                    <ErrorState
                        message={error || 'مش قادرين نتحقق من توفر الخدمة حالياً.'}
                        onRetry={() => setReload((value) => value + 1)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="page-stack">
            <Link to="/tests" className="back-link"><ArrowRight size={16} /> رجوع للتحاليل</Link>
            <PageHeader eyebrow="طلب جديد" title="سحب عينة من البيت" description="اختار التحاليل والعنوان والميعاد المفضّل ليك." />
            {error && <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />}
            <form className="booking-layout" onSubmit={(event) => void submit(event)}>
                <div className="booking-main">
                    <section className="form-section">
                        <div className="form-section-title"><span>١</span><div><h2>التحاليل المطلوبة</h2><p>الأسعار معتمدة من كتالوج المختبر.</p></div></div>
                        <div className="booking-test-list">
                            {tests.map((test) => {
                                const checked = selectedTests.includes(test.id);
                                return (
                                    <button key={test.id} type="button" className={`booking-test ${checked ? 'booking-test-selected' : ''}`} onClick={() => toggleTest(test.id)} aria-pressed={checked}>
                                        <span className="check-box">{checked && <Check size={14} />}</span>
                                        <span className="booking-test-name"><strong>{test.name}</strong><small>{test.specimen_type} · {test.code}</small></span>
                                        <strong>{formatPrice(test.price)}</strong>
                                    </button>
                                );
                            })}
                            {tests.length === 0 && <p className="inline-empty">مفيش تحاليل نشطة متاحة دلوقتي.</p>}
                        </div>
                    </section>

                    <section className="form-section">
                        <div className="form-section-title"><span><TicketPercent size={17} /></span><div><h2>العروض وكوبونات الخصم</h2><p>اختار باقة متاحة أو اكتب كود خصم.</p></div></div>
                        {offerError && <p className="form-error" role="alert">{offerError}</p>}
                        {offers.length > 0 && (
                            <label className="field">
                                <span>باقة المختبر</span>
                                <select value={promotionId} onChange={(event) => selectOffer(event.target.value)} disabled={busy}>
                                    <option value="">من غير باقة</option>
                                    {offers.map((offer) => (
                                        <option key={offer.id} value={offer.id}>
                                            {offer.name} · {offer.discount_type === 'percentage' ? `${Number(offer.discount_value)}٪ خصم` : `${formatPrice(offer.discount_value)} خصم`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        {selectedOffer && (
                            <div className="schedule-note">
                                <TicketPercent size={16} />
                                <span>{selectedOffer.description ?? 'اختيارات التحاليل اتظبطت تلقائيًا على مكونات الباقة.'}</span>
                            </div>
                        )}
                        <label className="field">
                            <span>كود الخصم</span>
                            <input
                                value={couponCode}
                                onChange={(event) => {
                                    setCouponCode(event.target.value);
                                    if (event.target.value) setPromotionId('');
                                }}
                                placeholder="مثال: FRIEND-123"
                                autoCapitalize="characters"
                                disabled={busy || Boolean(promotionId)}
                                maxLength={40}
                            />
                        </label>
                        <p className="secure-caption">السعر والخصم النهائي بيتأكدوا على الخادم قبل تسجيل الطلب.</p>
                    </section>

                    <section className="form-section">
                        <div className="form-section-title"><span>٢</span><div><h2>مكان الزيارة</h2><p>اختار عنوان محفوظ أو أضف عنوان جديد.</p></div></div>
                        {addresses.length > 0 && (
                            <div className="address-choice-list">
                                {addresses.map((address) => (
                                    <label key={address.id} className={`address-choice ${String(address.id) === addressId ? 'address-choice-active' : ''}`}>
                                        <input type="radio" name="address" checked={String(address.id) === addressId} onChange={() => setAddressId(String(address.id))} />
                                        <MapPin size={18} />
                                        <span><strong>{address.label}{address.is_default && <small className="default-tag">الأساسي</small>}</strong><small>{address.address}</small></span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {!addressFormOpen ? (
                            <button type="button" className="add-address-button" onClick={() => setAddressFormOpen(true)}><Plus size={16} /> أضف عنوان جديد</button>
                        ) : (
                            <div className="address-form">
                                <label className="field"><span>اسم العنوان</span><input value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} required /></label>
                                <label className="field"><span>العنوان بالتفصيل</span><textarea rows={3} value={addressText} onChange={(event) => setAddressText(event.target.value)} placeholder="المنطقة، الشارع، رقم العمارة والشقة" required /></label>
                                <label className="field"><span>علامة مميزة (اختياري)</span><input value={addressInstructions} onChange={(event) => setAddressInstructions(event.target.value)} placeholder="مثال: الدور التاني، جنب الصيدلية" /></label>
                                <div className="inline-actions"><button type="button" className="button button-primary button-small" disabled={busy} onClick={() => void addAddress()}>حفظ العنوان</button><button type="button" className="text-button" onClick={() => setAddressFormOpen(false)}>إلغاء</button></div>
                            </div>
                        )}
                    </section>

                    <section className="form-section">
                        <div className="form-section-title"><span>٣</span><div><h2>الميعاد المفضّل</h2><p>المختبر هيأكدلك الموعد بعد مراجعة الطلب.</p></div></div>
                        {branches.length > 1 && <label className="field"><span>فرع المتابعة</span><select value={branchId} onChange={(event) => setBranchId(event.target.value)} required>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}{branch.is_default ? ' · الفرع الرئيسي' : ''}</option>)}</select></label>}
                        <label className="field"><span>اليوم والوقت اللي يناسبك</span><input type="datetime-local" dir="ltr" value={requestedAt} min={minimumDateTime} onChange={(event) => setRequestedAt(event.target.value)} required /></label>
                        <div className="schedule-note"><Clock3 size={16} /><span>ده طلب بميعاد تفضيلي، مش حجز مؤكد. هيوصلك تأكيد من فريق المختبر.</span></div>
                        <label className="field"><span>ملاحظات للمندوب (اختياري)</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="أي تعليمات تساعدنا نوصل لك بسهولة" maxLength={1000} /></label>
                    </section>
                </div>

                <aside className="booking-summary">
                    <div className="summary-card-title"><ShieldCheck size={17} /><strong>مراجعة الطلب</strong></div>
                    <div className="summary-selected">
                        {chosenTests.length ? chosenTests.map((test) => <div key={test.id}><span>{test.name}</span><strong>{formatPrice(test.price)}</strong></div>) : <p>اختار تحليل واحد على الأقل عشان تكمل.</p>}
                    </div>
                    <div className="summary-total"><span>الإجمالي التقديري</span><strong>{formatPrice(subtotal)}</strong></div>
                    <p className="summary-disclaimer">السعر النهائي بيتحسب ويتأكد من الخادم وقت تسجيل الطلب.</p>
                    <button className="button button-primary button-wide" disabled={busy || selectedTests.length === 0 || !addressId || !branchId || !requestedAt || tests.length === 0}>
                        {busy ? 'بنبعت طلبك...' : 'إرسال طلب الزيارة'}<ArrowRight size={16} />
                    </button>
                    <p className="secure-caption"><ShieldCheck size={14} /> بياناتك مش بتتشارك مع أي جهة خارج المختبر.</p>
                </aside>
            </form>
            {branches.length === 0 && <ErrorState message="مفيش فروع نشطة متاحة لطلبات السحب المنزلي حاليًا." />}
        </div>
    );
}
