import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy, Gift, MapPin, Plus, Share2, TicketPercent, Trash2, UserRound } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, LoadingState } from '@/components/Feedback';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import { acceptReferral, createAddress, deleteAddress, getAddresses, getReferralCoupons, getReferralSummary, updateAddress } from '@/features/patient/api';
import { ApiError } from '@/lib/api-client';
import { formatDate, formatPrice } from '@/lib/format';
import { PATIENT_PORTAL_UPDATE_EVENT } from '@/lib/patient-realtime';
import type { PatientAddress, PatientPromotion, PatientReferralSummary } from '@/types/api';

export function ProfilePage() {
    const { token, user, profile } = useAuth();
    const [addresses, setAddresses] = useState<PatientAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [address, setAddress] = useState('');
    const [instructions, setInstructions] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [referralSummary, setReferralSummary] = useState<PatientReferralSummary | null>(null);
    const [referralCoupons, setReferralCoupons] = useState<PatientPromotion[]>([]);
    const [referralLoading, setReferralLoading] = useState(true);
    const [referralError, setReferralError] = useState('');
    const [referralNotice, setReferralNotice] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [referralBusy, setReferralBusy] = useState(false);
    const [referralReload, setReferralReload] = useState(0);

    useEffect(() => {
        if (!token) return;
        let current = true;
        setLoading(true);
        void getAddresses(token)
            .then((response) => { if (current) setAddresses(response.data); })
            .catch((requestError: unknown) => { if (current) setError(requestError instanceof ApiError ? requestError.message : 'مش قادرين نحمّل العناوين.'); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [token, reload]);

    useEffect(() => {
        if (!token) return;
        let current = true;
        setReferralLoading(true);
        void Promise.allSettled([getReferralSummary(token), getReferralCoupons(token)])
            .then(([summaryResult, couponsResult]) => {
                if (!current) return;
                const messages: string[] = [];
                if (summaryResult.status === 'fulfilled') {
                    setReferralSummary(summaryResult.value.data);
                } else {
                    messages.push(summaryResult.reason instanceof ApiError
                        ? summaryResult.reason.message
                        : 'مش قادرين نحمّل بيانات الدعوة.');
                }
                if (couponsResult.status === 'fulfilled') {
                    setReferralCoupons(couponsResult.value.data);
                } else {
                    messages.push(couponsResult.reason instanceof ApiError
                        ? couponsResult.reason.message
                        : 'مش قادرين نحمّل كوبوناتك.');
                }
                setReferralError(messages.join(' '));
            })
            .finally(() => { if (current) setReferralLoading(false); });
        return () => { current = false; };
    }, [token, referralReload]);

    useEffect(() => {
        const refreshReferralRewards = () => setReferralReload((value) => value + 1);
        window.addEventListener(PATIENT_PORTAL_UPDATE_EVENT, refreshReferralRewards);
        return () => window.removeEventListener(PATIENT_PORTAL_UPDATE_EVENT, refreshReferralRewards);
    }, []);

    async function addAddress(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        setBusy(true);
        setError('');
        try {
            const response = await createAddress(token, {
                label: label.trim(),
                address: address.trim(),
                instructions: instructions.trim() || null,
                is_default: addresses.length === 0,
            });
            setAddresses((current) => [response.data, ...current]);
            setLabel('');
            setAddress('');
            setInstructions('');
            setFormOpen(false);
        } catch (requestError) {
            setError(requestError instanceof ApiError ? requestError.message : 'تعذّر حفظ العنوان.');
        } finally {
            setBusy(false);
        }
    }

    async function makeDefault(addressId: number) {
        if (!token) return;
        setError('');
        try {
            const response = await updateAddress(token, addressId, { is_default: true });
            setAddresses((current) => current.map((item) => item.id === addressId ? response.data : { ...item, is_default: false }));
        } catch (requestError) {
            setError(requestError instanceof ApiError ? requestError.message : 'تعذّر تحديث العنوان الأساسي.');
        }
    }

    async function removeAddress(addressId: number) {
        if (!token) return;
        setError('');
        try {
            await deleteAddress(token, addressId);
            setAddresses((current) => current.filter((item) => item.id !== addressId));
        } catch (requestError) {
            setError(requestError instanceof ApiError ? requestError.message : 'تعذّر حذف العنوان.');
        }
    }

    async function copyText(value: string, successMessage: string) {
        try {
            await navigator.clipboard.writeText(value);
            setReferralError('');
            setReferralNotice(successMessage);
        } catch {
            setReferralError('ميزة النسخ مش متاحة دلوقتي. تقدر تحدد الكود وتنسخه يدويًا.');
            setReferralNotice('');
        }
    }

    async function shareReferral() {
        if (!referralSummary) return;
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: 'دعوة من معمل',
                    text: `استخدم كود الدعوة ${referralSummary.referral_code} من صفحة حسابك في تطبيق معمل.`,
                });
                setReferralNotice('تم فتح خيارات المشاركة.');
                setReferralError('');
            } catch (shareError) {
                if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
                setReferralError('تعذّرت مشاركة الكود. جرّب نسخه بدل كده.');
            }
            return;
        }
        await copyText(referralSummary.referral_code, 'اتنسخ كود الدعوة.');
    }

    async function submitReferral(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;
        setReferralBusy(true);
        setReferralError('');
        setReferralNotice('');
        try {
            await acceptReferral(token, referralCode.trim());
            setReferralCode('');
            setReferralNotice('اتسجلت دعوتك بنجاح. المكافأة هتوصلك بعد اكتمال أول طلب.');
            setReferralReload((value) => value + 1);
        } catch (requestError) {
            setReferralError(requestError instanceof ApiError
                ? requestError.message
                : 'تعذّر تسجيل كود الدعوة.');
        } finally {
            setReferralBusy(false);
        }
    }

    return (
        <div className="page-stack">
            <PageHeader eyebrow="بياناتك" title="حسابي" description="راجع بيانات حسابك والعناوين المحفوظة." />
            {error && <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />}
            <section className="profile-card">
                <span className="profile-avatar"><UserRound size={23} /></span>
                <div><span className="section-overline">بيانات الحساب</span><h2>{profile?.full_name ?? user?.name}</h2><p>{profile?.phone ?? user?.email}</p>{profile?.email && profile.email !== user?.email && <p>{profile.email}</p>}</div>
                <span className="verified-chip"><Check size={14} /> حساب مريض</span>
            </section>
            <section className="section-block address-section">
                <div className="section-heading">
                    <div><span className="section-overline">للطلبات المنزلية</span><h2>عناويني</h2></div>
                    <button className="button button-secondary button-small" onClick={() => setFormOpen((value) => !value)}><Plus size={15} /> عنوان جديد</button>
                </div>
                {formOpen && (
                    <form className="address-form card-surface" onSubmit={(event) => void addAddress(event)}>
                        <label className="field"><span>اسم العنوان</span><input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="البيت، الشغل..." required maxLength={80} /></label>
                        <label className="field"><span>العنوان بالتفصيل</span><textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} required maxLength={1500} /></label>
                        <label className="field"><span>علامة مميزة (اختياري)</span><input value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={500} /></label>
                        <button className="button button-primary button-small" disabled={busy}>{busy ? 'بيتحفظ...' : 'حفظ العنوان'}</button>
                    </form>
                )}
                {loading ? <LoadingState /> : addresses.length ? (
                    <div className="saved-address-list">
                        {addresses.map((item) => (
                            <article key={item.id} className="saved-address">
                                <span className="address-pin"><MapPin size={18} /></span>
                                <div className="saved-address-copy"><strong>{item.label}{item.is_default && <small className="default-tag">العنوان الأساسي</small>}</strong><p>{item.address}</p>{item.instructions && <small>{item.instructions}</small>}</div>
                                <div className="address-actions">
                                    {!item.is_default && <button className="text-button" onClick={() => void makeDefault(item.id)}>خليه أساسي</button>}
                                    <button className="delete-address" onClick={() => void removeAddress(item.id)} aria-label={`حذف ${item.label}`}><Trash2 size={16} /></button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : <EmptyState title="مفيش عناوين محفوظة" description="ضيف عنوانك مرة واحدة عشان تستخدمه في طلبات السحب المنزلي." />}
            </section>
            <section className="section-block">
                <div className="section-heading">
                    <div><span className="section-overline">شارك الرعاية</span><h2>ادعي أصحابك</h2></div>
                    <Gift size={20} aria-hidden="true" />
                </div>
                {referralError && <p className="form-error" role="alert">{referralError}</p>}
                {referralNotice && <p className="success-message" role="status">{referralNotice}</p>}
                {referralLoading ? <LoadingState /> : referralSummary && (
                    <>
                        <article className="referral-card card-surface">
                            <div>
                                <span className="section-overline">كود الدعوة بتاعك</span>
                                <strong className="referral-code" dir="ltr">{referralSummary.referral_code}</strong>
                                <p>
                                    {referralSummary.enabled
                                        ? 'شارك الكود مع صاحبك اللي عنده حساب في تطبيق معمل. المكافأة ليكم الاتنين بعد ما يكمل أول طلب.'
                                        : 'دعوة الأصدقاء مش متاحة حاليًا، لكن كودك محفوظ لحسابك.'}
                                </p>
                            </div>
                            <div className="inline-actions">
                                <button type="button" className="button button-secondary button-small" onClick={() => void copyText(referralSummary.referral_code, 'اتنسخ كود الدعوة.')}><Copy size={15} /> نسخ</button>
                                {referralSummary.enabled && <button type="button" className="button button-primary button-small" onClick={() => void shareReferral()}><Share2 size={15} /> مشاركة</button>}
                            </div>
                            <div className="referral-stats">
                                <span><strong>{referralSummary.accepted_count}</strong> دعوة اتسجلت</span>
                                <span><strong>{referralSummary.rewarded_count}</strong> مكافأة اتصدرت</span>
                            </div>
                        </article>
                        {!referralSummary.has_been_referred && referralSummary.enabled && (
                            <form className="referral-form card-surface" onSubmit={(event) => void submitReferral(event)}>
                                <label className="field">
                                    <span>معاك كود دعوة من صاحبك؟</span>
                                    <input
                                        value={referralCode}
                                        onChange={(event) => setReferralCode(event.target.value)}
                                        placeholder="اكتب كود الدعوة"
                                        autoCapitalize="characters"
                                        maxLength={24}
                                        required
                                        disabled={referralBusy}
                                    />
                                </label>
                                <button className="button button-secondary button-small" disabled={referralBusy || !referralCode.trim()}>
                                    {referralBusy ? 'بنسجل الدعوة...' : 'تسجيل الكود'}
                                </button>
                            </form>
                        )}
                    </>
                )}
                {referralCoupons.length > 0 && (
                    <div className="saved-address-list referral-coupons">
                        {referralCoupons.map((coupon) => (
                            <article key={coupon.id} className="saved-address">
                                <span className="address-pin"><TicketPercent size={18} /></span>
                                <div className="saved-address-copy">
                                    <strong>{coupon.name}</strong>
                                    <p>
                                        {coupon.discount_type === 'percentage'
                                            ? `خصم ${Number(coupon.discount_value)}٪`
                                            : `خصم ${formatPrice(coupon.discount_value)}`}
                                        {coupon.valid_until ? ` · صالح لحد ${formatDate(coupon.valid_until)}` : ''}
                                    </p>
                                    <small dir="ltr">{coupon.code}</small>
                                </div>
                                <button type="button" className="text-button" onClick={() => coupon.code && void copyText(coupon.code, 'اتنسخ كود الخصم.')}>نسخ الكود</button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            <p className="profile-help">لتعديل الاسم أو رقم الموبايل، تواصل مع المختبر عشان بيانات الحساب مرتبطة بسجلك الطبي.</p>
        </div>
    );
}
