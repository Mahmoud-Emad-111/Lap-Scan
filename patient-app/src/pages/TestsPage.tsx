import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState, LoadingState } from '@/components/Feedback';
import { PageHeader } from '@/components/PageHeader';
import { TestCard } from '@/components/TestCard';
import { useAuth } from '@/features/auth/AuthProvider';
import { getTests } from '@/features/patient/api';
import { ApiError } from '@/lib/api-client';
import type { LabTest } from '@/types/api';

export function TestsPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState<LabTest[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);

    useEffect(() => {
        if (!token) return;
        let current = true;
        setLoading(true);
        void getTests(token)
            .then((response) => { if (current) setTests(response.data); })
            .catch((requestError: unknown) => { if (current) setError(requestError instanceof ApiError ? requestError.message : 'مش قادرين نحمّل التحاليل.'); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [token, reload]);

    const filteredTests = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('ar');
        return tests.filter((test) => `${test.name} ${test.code} ${test.description ?? ''}`.toLocaleLowerCase('ar').includes(query));
    }, [tests, search]);

    return (
        <div className="page-stack">
            <PageHeader eyebrow="كتالوج المختبر" title="اختار تحاليلك" description="الأسعار ومدة النتيجة المعروضة جاية من بيانات المختبر مباشرة." />
            <label className="search-field">
                <Search size={18} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="دوّر باسم التحليل أو الكود" />
                {search && <button type="button" onClick={() => setSearch('')}>مسح</button>}
            </label>
            {error && <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />}
            {loading ? <LoadingState /> : filteredTests.length ? (
                <div className="test-list">{filteredTests.map((test) => (
                    <TestCard key={test.id} test={test} onSelect={() => navigate('/booking', { state: { testIds: [test.id] } })} />
                ))}</div>
            ) : (
                <EmptyState title={search ? 'ملقيناش تحليل بالاسم ده' : 'مفيش تحاليل متاحة دلوقتي'} description={search ? 'جرّب كلمة تانية أو امسح البحث.' : 'كتالوج المختبر مفيهوش تحاليل نشطة حاليًا.'} />
            )}
            {!loading && filteredTests.length > 0 && (
                <div className="catalog-footer"><span>{filteredTests.length} تحليل</span><button className="button button-primary" onClick={() => navigate('/booking')}>كمّل طلب سحب منزلي</button></div>
            )}
        </div>
    );
}
