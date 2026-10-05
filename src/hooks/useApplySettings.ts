import { useEffect } from 'react';
import i18n from '@/i18n';
import { useSettings } from '@/store/settings';

/** يطبق الثيم واللغة واتجاه الصفحة (RTL/LTR) على <html> */
export function useApplySettings() {
  const { theme, lang } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      root.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0E0D0B' : '#F2EEE6');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    void i18n.changeLanguage(lang);
  }, [lang]);
}
