import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/i18n';
import './styles.css';
import App from './app/App';
import { seedDatabase } from '@/lib/db';
import { useSettings } from '@/store/settings';

// روابط مثل /?lang=en من صفحة الهبوط أو المتجر
const qLang = new URLSearchParams(location.search).get('lang');
if (qLang === 'en' || qLang === 'ar') useSettings.getState().setLang(qLang);

import { startSync } from '@/lib/sync/engine';
import { startLocalReminders } from '@/features/reminders/reminders';

void seedDatabase().catch((err) => console.error('DB seed failed', err));
startSync();
startLocalReminders();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
