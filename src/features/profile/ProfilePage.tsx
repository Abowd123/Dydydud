import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Button, Card, CardTitle, SegmentedControl } from '@/components/ui';
import { useSettings, type Lang, type Theme } from '@/store/settings';

export function ProfilePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { theme, lang, setTheme, setLang, setOnboarded, sound, vibrate, warmup, setPref, ramadan, setRamadan } = useSettings();
  return (
    <PageTransition>
      <TopBar back title={t('pages.profile')} />
      <div className="flex flex-col gap-4">
        <Card>
          <CardTitle className="mb-3">{t('settings.theme')}</CardTitle>
          <SegmentedControl<Theme>
            id="theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: t('settings.dark') },
              { value: 'light', label: t('settings.light') },
              { value: 'system', label: t('settings.system') }
            ]}
          />
        </Card>
        <Card>
          <CardTitle className="mb-3">{t('settings.language')}</CardTitle>
          <SegmentedControl<Lang>
            id="lang"
            value={lang}
            onChange={setLang}
            options={[
              { value: 'ar', label: 'العربية' },
              { value: 'en', label: 'English' }
            ]}
          />
        </Card>
        <Card className="flex flex-col divide-y divide-border p-0">
          {([['sound', sound], ['vibrate', vibrate], ['warmup', warmup]] as const).map(([k, v]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between px-4 py-4">
              <span className="font-bold">{t(`settings.${k}`)}</span>
              <input type="checkbox" checked={v} onChange={(e) => setPref(k, e.target.checked)} className="peer sr-only" />
              <span className="relative h-7 w-12 rounded-full bg-border transition peer-checked:bg-primary after:absolute after:start-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
            </label>
          ))}
          <label className="flex cursor-pointer items-center justify-between px-4 py-4">
            <span><span className="block font-bold">🌙 {t('ramadan.mode')}</span><span className="block text-xs text-muted">{t('ramadan.modeD')}</span></span>
            <input type="checkbox" checked={ramadan} onChange={(e) => setRamadan(e.target.checked)} className="peer sr-only" />
            <span className="relative h-7 w-12 shrink-0 rounded-full bg-border transition peer-checked:bg-accent after:absolute after:start-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
          </label>
        </Card>
        <Button onClick={() => nav('/onboarding')}>{t('schedule.edit')}</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setOnboarded(false);
            nav('/welcome');
          }}
        >
          {t('settings.reset')}
        </Button>
      </div>
    </PageTransition>
  );
}
