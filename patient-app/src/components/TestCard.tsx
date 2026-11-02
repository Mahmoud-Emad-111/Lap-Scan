import { ArrowLeft, Clock3, FlaskConical } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { LabTest } from '@/types/api';

export function TestCard({ test, onSelect }: { test: LabTest; onSelect: () => void }) {
    return (
        <article className="test-card">
            <span className="test-icon"><FlaskConical size={20} /></span>
            <div className="test-card-main">
                <span className="test-code">{test.code}</span>
                <h3>{test.name}</h3>
                {test.description && <p>{test.description}</p>}
                <div className="test-meta">
                    <span><Clock3 size={14} /> {test.turnaround_time_minutes < 60
                        ? `${test.turnaround_time_minutes} دقيقة`
                        : `${Math.ceil(test.turnaround_time_minutes / 60)} ساعة`}</span>
                    <span>{test.specimen_type}</span>
                </div>
            </div>
            <div className="test-card-action">
                <strong>{formatPrice(test.price)}</strong>
                <button className="icon-action" onClick={onSelect} aria-label={`طلب ${test.name}`}>
                    <ArrowLeft size={17} />
                </button>
            </div>
        </article>
    );
}
