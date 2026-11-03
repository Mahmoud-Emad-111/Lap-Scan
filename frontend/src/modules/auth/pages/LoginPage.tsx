import type { FormEvent } from 'react';
import { Icon } from '@/components/ui/icon';

type LoginPageProps = {
    identifier: string;
    password: string;
    error: string;
    busy: boolean;
    showDemoCredentials: boolean;
    onIdentifierChange: (identifier: string) => void;
    onPasswordChange: (password: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPage({
    identifier,
    password,
    error,
    busy,
    showDemoCredentials,
    onIdentifierChange,
    onPasswordChange,
    onSubmit,
}: LoginPageProps) {
    return (
        <main className="relative grid min-h-screen overflow-hidden bg-[#f3f6f5] px-4 py-7 lg:grid-cols-[1fr_0.9fr] lg:px-0 lg:py-0">
            <div className="pointer-events-none absolute -top-36 -right-28 size-[28rem] rounded-full bg-brand-100/70 blur-3xl" />
            <section className="relative order-2 mx-auto flex w-full max-w-xl flex-col justify-center px-2 py-10 lg:order-1 lg:px-16 xl:px-24">
                <div className="mb-10 flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-[1.15rem] bg-brand-700 text-white shadow-lg shadow-brand-700/20">
                        <Icon name="flask" size={25} />
                    </span>
                    <div>
                        <p className="text-lg font-bold text-ink-950">معمل</p>
                        <p className="text-xs text-slate-500">
                            نظام إدارة المختبر
                        </p>
                    </div>
                </div>

                <div className="mb-8 grid gap-3">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        بوابة المختبر الآمنة
                    </span>
                    <h1 className="text-3xl leading-[1.45] font-bold tracking-tight text-ink-950 sm:text-[2.7rem]">
                        أهلاً بك،
                        <br />
                        <span className="text-brand-600">
                            رعاية أدق تبدأ هنا.
                        </span>
                    </h1>
                    <p className="max-w-md text-[15px] leading-8 text-slate-500">
                        سجّل الدخول لإدارة بيانات المرضى وكتالوج التحاليل والفروع
                        حسب صلاحيات حسابك.
                    </p>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="grid gap-5 rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-[0_28px_90px_-42px_rgba(20,54,49,0.3)] ring-1 ring-slate-900/[0.03] sm:p-8"
                >
                    <div className="grid gap-1">
                        <h2 className="text-xl font-bold text-slate-900">
                            تسجيل الدخول
                        </h2>
                        <p className="text-sm text-slate-500">
                            استخدم بيانات الحساب التي وفرها مسؤول النظام.
                        </p>
                    </div>
                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                        >
                            {error}
                        </div>
                    )}
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                        البريد الإلكتروني أو رقم الهاتف
                        <input
                            type="text"
                            autoComplete="username"
                            placeholder="name@example.com أو 01xxxxxxxxx"
                            value={identifier}
                            onChange={(event) =>
                                onIdentifierChange(event.target.value)
                            }
                            required
                            dir="ltr"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                        كلمة المرور
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder="أدخل كلمة المرور"
                            value={password}
                            onChange={(event) =>
                                onPasswordChange(event.target.value)
                            }
                            required
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={busy}
                        aria-busy={busy}
                        className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-700/15 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                        {busy && (
                            <span
                                aria-hidden="true"
                                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            />
                        )}
                        {busy ? 'جارٍ تسجيل الدخول...' : 'دخول إلى النظام'}
                        {!busy && <Icon name="arrow-left" size={17} />}
                    </button>
                    <p className="text-center text-xs leading-5 text-slate-400">
                        {showDemoCredentials
                            ? 'حساب التطوير: admin@lab.test — كلمة المرور من LAB_DEMO_PASSWORD (الافتراضية: password).'
                            : 'استخدم بيانات الحساب التي وفرها مسؤول النظام.'}
                    </p>
                </form>

                <p className="mt-8 text-center text-xs text-slate-400 lg:text-right">
                    بيانات المرضى محمية ولا تظهر إلا للمستخدمين المخوّلين.
                </p>
            </section>

            <aside className="relative order-1 hidden overflow-hidden bg-[#103c37] p-12 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between xl:p-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(75,190,170,0.28),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(25,117,108,0.65),transparent_42%),linear-gradient(145deg,#103c37,#102e2d)]" />
                <div className="relative flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-wide text-white/75">
                        LABORATORY MANAGEMENT
                    </span>
                    <span className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-white/10">
                        <Icon name="activity" size={22} />
                    </span>
                </div>
                <div className="relative mx-auto grid max-w-lg gap-8">
                    <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="grid gap-1">
                                <span className="text-sm text-white/65">
                                    رعاية متصلة
                                </span>
                                <span className="text-xl font-semibold">
                                    من العينة إلى النتيجة
                                </span>
                            </div>
                            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200">
                                <Icon name="beaker" size={25} />
                            </span>
                        </div>
                        <div className="grid gap-3">
                            {[
                                [
                                    '01',
                                    'بيانات منظمة',
                                    'ملفات المرضى والتحاليل في مكان واحد',
                                ],
                                [
                                    '02',
                                    'صلاحيات واضحة',
                                    'كل مستخدم يرى ما تسمح به صلاحياته',
                                ],
                                [
                                    '03',
                                    'خطوة بخطوة',
                                    'قاعدة جاهزة لتوسيع دورة الطلبات والنتائج',
                                ],
                            ].map(([number, title, description]) => (
                                <div
                                    key={number}
                                    className="flex items-center gap-4 rounded-2xl bg-black/10 p-4"
                                >
                                    <span className="text-xs font-semibold text-emerald-200/75">
                                        {number}
                                    </span>
                                    <div className="grid gap-1">
                                        <span className="text-sm font-semibold">
                                            {title}
                                        </span>
                                        <span className="text-xs text-white/55">
                                            {description}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-center text-sm text-white/55">
                        نظام موحد لمختبر واحد وفروعه.
                    </p>
                </div>
                <p className="relative text-xs text-white/40">
                    واجهة عربية • متوافقة مع الأجهزة المختلفة
                </p>
            </aside>
        </main>
    );
}
