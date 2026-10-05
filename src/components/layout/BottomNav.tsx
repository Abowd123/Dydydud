import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Home, LayoutGrid, Salad, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

const items = [
  { to: '/', icon: Home, key: 'home' },
  { to: '/schedule', icon: CalendarDays, key: 'schedule' },
  { to: '/workout', icon: Zap, key: 'workout', fab: true },
  { to: '/nutrition', icon: Salad, key: 'nutrition' },
  { to: '/more', icon: LayoutGrid, key: 'more' }
] as const;

/** شريط زجاجي داكن، والزر الأوسط "عملة" ذهبية محفورة */
export function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[var(--safe-bottom)]">
      <div className="glass mx-auto mb-3 flex max-w-md items-end justify-around rounded-[28px] px-2 pb-2 pt-2.5 shadow-soft md:max-w-2xl">
        {items.map(({ to, icon: Icon, key, ...rest }) =>
          'fab' in rest ? (
            <NavLink key={key} to={to} aria-label={t(`nav.${key}`)} className="-mt-9">
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.92 }}
                  className={cn('btn-gold grid h-[66px] w-[66px] place-items-center rounded-full text-ink shadow-glow ring-[5px] ring-bg', isActive && 'scale-105')}>
                  <span className="absolute inset-[5px] rounded-full border border-ink/15" />
                  <Icon size={28} fill="currentColor" strokeWidth={1.5} />
                </motion.div>
              )}
            </NavLink>
          ) : (
            <NavLink key={key} to={to} end={to === '/'} className="relative flex w-16 flex-col items-center gap-1 pb-0.5 pt-1.5">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-mark" className="absolute -top-2.5 h-[3px] w-7 rounded-full bg-gold shadow-[0_0_12px_rgb(212_175_106/0.9)]" />}
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} className={cn('transition-colors', isActive ? 'text-gold' : 'text-muted')} />
                  <span className={cn('text-[13px] font-semibold', isActive ? 'text-gold' : 'text-muted')}>{t(`nav.${key}`)}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}
