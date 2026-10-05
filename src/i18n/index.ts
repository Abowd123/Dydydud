import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

const stored = (() => {
  try {
    return JSON.parse(localStorage.getItem('gymmate-settings') || '{}')?.state?.lang;
  } catch {
    return undefined;
  }
})();

void i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: stored ?? 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false }
});

export default i18n;
