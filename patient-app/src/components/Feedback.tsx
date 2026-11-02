import { AlertCircle, RefreshCw } from 'lucide-react';

export function FullPageLoader({ label }: { label: string }) {
    return (
        <main className="full-loader" role="status">
            <span className="loader-mark" />
            <span>{label}</span>
        </main>
    );
}

export function LoadingState({ label = 'ثواني وبنحمّل بياناتك...' }: { label?: string }) {
    return (
        <div className="loading-state" role="status">
            <span className="loader-mark loader-small" />
            <span>{label}</span>
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="error-state" role="alert">
            <span className="error-icon"><AlertCircle size={20} /></span>
            <div className="error-copy">
                <strong>حصلت مشكلة في تحميل البيانات</strong>
                <p>{message}</p>
                {onRetry && (
                    <button className="text-button" onClick={onRetry}>
                        <RefreshCw size={14} /> جرّب تاني
                    </button>
                )}
            </div>
        </div>
    );
}
