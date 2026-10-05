import { Award, Bell, Bot, ChevronLeft, ChevronRight, Cloud, Dumbbell, LineChart, Palette, Settings, ShieldCheck, Target } from 'lucide-react';
import { LevelCard } from '@/features/gamification/LevelCard';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui';
import { useSettings } from '@/store/settings';

export function MorePage() {
  const { t } = useTranslation();
  const rtl = useSettings((s) => s.lang) === 'ar';
  const Chev = rtl ? ChevronLeft : ChevronRight;
  const links = [
    { to: '/coach', icon: Bot, label: t('pages.coach'), color: 'text-accent' },
    { to: '/challenges', icon: Target, label: t('ch.title'), color: 'text-primary' },
    { to: '/achievements', icon: Award, label: t('game.page'), color: 'text-accent' },
    { to: '/exercises', icon: Dumbbell, label: t('nav.exercises'), color: 'text-primary' },
    { to: '/progress', icon: LineChart, label: t('pages.progress'), color: 'text-water' },
    { to: '/account', icon: Cloud, label: t('account.title'), color: 'text-water' },
    { to: '/reminders', icon: Bell, label: t('rem.title'), color: 'text-accent' },
    { to: '/profile', icon: Settings, label: t('pages.profile'), color: 'text-muted' },
    { to: '/data', icon: ShieldCheck, label: t('data.title'), color: 'text-primary' },
    ...(import.meta.env.DEV ? [{ to: '/ui-kit', icon: Palette, label: t('pages.uikit'), color: 'text-primary' }] : [])
  ];
  return (
    <PageTransition>
      <TopBar title={t('nav.more')} />
      <div className="mb-4"><LevelCard /></div>
      <Card className="divide-y divide-border p-0">
        {links.map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-elevated">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-elevated"><Icon size={20} className={color} /></span>
            <span className="flex-1 font-bold">{label}</span>
            <Chev size={18} className="text-muted" />
          </Link>
        ))}
      </Card>
      <p className="mt-6 text-center text-xs text-muted">
        <Link to="/privacy" className="underline-offset-4 hover:underline">{t('legal.privacy')}</Link> · <Link to="/terms" className="underline-offset-4 hover:underline">{t('legal.terms')}</Link> · <span dir="ltr">v{__APP_VERSION__}</span>
      </p>
    </PageTransition>
  );
}
