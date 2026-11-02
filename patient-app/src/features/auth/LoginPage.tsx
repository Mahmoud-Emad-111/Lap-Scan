import { useState, type FormEvent } from 'react';
import { Activity, ArrowLeft, FlaskConical, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { ApiError } from '@/lib/api-client';

export function LoginPage() {
    const { signIn } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setBusy(true);
        try {
            await signIn(identifier.trim(), password);
        } catch (requestError) {
            setError(requestError instanceof ApiError
                ? requestError.message
                : 'مقدرناش نسجّل دخولك. راجع البيانات وجرب تاني.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="login-screen">
            <section className="login-card">
                <div className="brand-lockup">
                    <span className="brand-mark"><FlaskConical size={23} /></span>
                    <span><strong>معمل</strong><small>رعاية أقرب ليك</small></span>
                </div>
                <div className="login-intro">
                    <span className="eyebrow"><Activity size={15} /> بوابتك الصحية</span>
                    <h1>تحاليلك ونتايجك،<br /><em>في مكان آمن.</em></h1>
                    <p>تابع طلباتك واطّلع على النتائج المعتمدة من المختبر، واطلب سحب عينة من البيت.</p>
                </div>
                <form className="form-stack" onSubmit={submit}>
                    <label className="field">
                        <span>رقم الموبايل أو البريد الإلكتروني</span>
                        <input
                            autoComplete="username"
                            value={identifier}
                            onChange={(event) => setIdentifier(event.target.value)}
                            placeholder="01xxxxxxxxx"
                            required
                            dir="auto"
                        />
                    </label>
                    <label className="field">
                        <span>كلمة المرور</span>
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="اكتب كلمة المرور"
                            required
                        />
                    </label>
                    {error && <p className="form-error" role="alert">{error}</p>}
                    <button className="button button-primary button-wide" disabled={busy}>
                        {busy ? 'بنسجّل دخولك...' : 'دخول لحسابي'}
                        {!busy && <ArrowLeft size={17} />}
                    </button>
                </form>
                <div className="privacy-note">
                    <ShieldCheck size={18} />
                    <span>نتايجك الطبية خاصة بيك، ومش بتظهر غير بعد تسجيل دخولك.</span>
                </div>
                <p className="login-footnote">لو معندكش حساب، تواصل مع المختبر عشان يفعّل حسابك.</p>
            </section>
            <aside className="login-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="art-copy">
                    <span className="art-symbol"><Activity size={27} /></span>
                    <p>صحتك تستاهل</p>
                    <h2>متابعة أسهل.<br />اطمئنان أكتر.</h2>
                    <span className="art-caption">كل تفاصيل رحلتك مع المختبر في تطبيق واحد.</span>
                </div>
                <div className="art-stamp"><ShieldCheck size={17} /> خصوصية وأمان</div>
            </aside>
        </main>
    );
}
