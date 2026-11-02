import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Welcome from '@/pages/welcome';
import { NotificationProvider } from '@/components/ui/notification-provider';
import './styles/app.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('The frontend root element is missing.');
}

createRoot(rootElement).render(
    <BrowserRouter>
        <NotificationProvider>
            <Welcome />
        </NotificationProvider>
    </BrowserRouter>,
);
