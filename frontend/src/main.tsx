import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Welcome from '@/pages/welcome';
import './styles/app.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('The frontend root element is missing.');
}

createRoot(rootElement).render(
    <BrowserRouter>
        <Welcome />
    </BrowserRouter>,
);
