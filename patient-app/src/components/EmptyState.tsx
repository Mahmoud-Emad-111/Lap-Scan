import type { ReactNode } from 'react';
import { ArrowLeft, FileHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({
    title,
    description,
    action,
    icon,
}: {
    title: string;
    description: string;
    action?: { label: string; to: string };
    icon?: ReactNode;
}) {
    return (
        <section className="empty-state">
            <span className="empty-illustration">{icon ?? <FileHeart size={25} />}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            {action && (
                <Link to={action.to} className="text-button">
                    {action.label}<ArrowLeft size={15} />
                </Link>
            )}
        </section>
    );
}
