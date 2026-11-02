import { useEffect, useState } from 'react';
import { Download, FileHeart, ShieldCheck } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, LoadingState } from '@/components/Feedback';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import { downloadResult, getResults } from '@/features/patient/api';
import { ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import { PATIENT_PORTAL_UPDATE_EVENT } from '@/lib/patient-realtime';
import type { PatientResult } from '@/types/api';

export function ResultsPage() {
    const { token } = useAuth();
    const [results, setResults] = useState<PatientResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState<number | null>(null);
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
        void getResults(token)
            .then((response) => { if (current) setResults(response.data); })
            .catch((requestError: unknown) => { if (current) setError(requestError instanceof ApiError ? requestError.message : 'مش قادرين نحمّل نتايجك.'); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [token, reload]);

    async function handleDownload(result: PatientResult) {
        if (!token) return;
        setDownloading(result.id);
        setError('');
        try {
            await downloadResult(token, result.id);
        } catch (requestError) {
            setError(requestError instanceof ApiError ? requestError.message : 'تعذّر تحميل التقرير.');
        } finally {
            setDownloading(null);
        }
    }

    return (
        <div className="page-stack">
            <PageHeader eyebrow="ملفك الصحي" title="نتايجي" description="النتايج هنا بتظهر بعد مراجعتها واعتمادها من المختبر." />
            <div className="results-privacy"><ShieldCheck size={17} /><span>النتايج محمية، والتحميل متاح لصاحب الحساب بس.</span></div>
            {error && <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />}
            {loading ? <LoadingState /> : results.length ? (
                <div className="result-list">
                    {results.map((result) => (
                        <article key={result.id} className="result-card">
                            <span className="result-icon"><FileHeart size={21} /></span>
                            <div className="result-content">
                                <div className="result-title"><strong>{result.test_name}</strong><span>معتمدة</span></div>
                                <div className="result-value">{result.value} <small>{result.unit ?? ''}</small></div>
                                {result.reference_range && <p className="reference-text">النطاق المرجعي: {result.reference_range}</p>}
                                <div className="result-meta">طلب <bdi dir="ltr">{result.order_number}</bdi> · {formatDate(result.approved_at)}</div>
                            </div>
                            {result.has_pdf && (
                                <button className="download-button" disabled={downloading === result.id} onClick={() => void handleDownload(result)} aria-label={`تنزيل تقرير ${result.test_name}`}>
                                    <Download size={17} /><span>{downloading === result.id ? 'بيتحمّل...' : 'PDF'}</span>
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            ) : <EmptyState title="مفيش نتايج معتمدة لحد دلوقتي" description="أول ما المختبر يعتمد نتيجة، هتظهر هنا وتقدر تنزّل التقرير لو متاح." />}
        </div>
    );
}
