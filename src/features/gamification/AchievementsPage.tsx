import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardTitle, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { XP } from './engine';
import { useGame } from './useGame';
import { LevelCard } from './LevelCard';

export function AchievementsPage() {
  const { t } = useTranslation();
  const g = useGame();
  if (!g) return <PageTransition><Skeleton className="h-96" /></PageTransition>;
  const parts = Object.entries(g.xp.parts).filter(([, v]) => v > 0);
  return (
    <PageTransition>
      <TopBar back title={t('game.page')} />
      <div className="flex flex-col gap-4">
        <LevelCard />
        <Card>
          <CardTitle className="mb-1">{t('game.total', { xp: g.xp.total.toLocaleString() })}</CardTitle>
          {parts.length ? (
            <div className="mt-2 flex flex-col gap-1.5">
              {parts.map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-muted">{t(`game.parts.${k}`)}</span><b>+{v.toLocaleString()}</b></div>
              ))}
            </div>
          ) : <p className="text-sm text-muted">{t('game.howTo')}</p>}
          <p className="mt-3 text-xs text-muted">{t('game.rules', XP)}</p>
        </Card>
        <section>
          <h2 className="mb-2 font-bold">{t('game.badges')}</h2>
          <div className="grid grid-cols-3 gap-2">
            {g.badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                className={cn('flex flex-col items-center gap-1 rounded-3xl border p-3 text-center', b.unlocked ? 'border-accent/40 bg-grad-hero' : 'border-border bg-surface')}>
                <span className={cn('text-4xl', !b.unlocked && 'opacity-30 grayscale')}>{b.emoji}</span>
                <span className="text-xs font-bold leading-tight">{t(`game.badge.${b.id}`)}</span>
                {!b.unlocked && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                    <div className="h-full bg-accent" style={{ width: `${(b.value / b.target) * 100}%` }} />
                  </div>
                )}
                <span className="text-xs text-muted">{b.unlocked ? '✓' : `${b.value.toLocaleString()}/${b.target.toLocaleString()}`}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
