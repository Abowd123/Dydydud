import { motion } from 'framer-motion';
import { Check, Share2, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button, Card, ProgressRing } from '@/components/ui';
import { cn } from '@/lib/cn';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { shareAchievement } from '@/lib/shareImage';
import { useSettings } from '@/store/settings';
import { usePlan } from '@/features/plan/lib/usePlan';
import { CHALLENGES, challengeSummary, getChallenge, toggleManual, type ChallengeData, type ChallengeState } from './challenges';

function useChallengeData(): ChallengeData | undefined {
  const { program, targets } = usePlan();
  const raw = useLiveQuery(async () => {
    const [water, sessions] = await Promise.all([db.water.toArray(), db.sessions.where('status').equals('finished').toArray()]);
    const waterByDate: Record<string, number> = {};
    for (const w of water) waterByDate[w.date] = (waterByDate[w.date] ?? 0) + w.ml;
    return { waterByDate, trainedDates: new Set(sessions.map((s) => s.date)) };
  }, []);
  return useMemo(() => (raw ? { ...raw, waterTargetMl: targets?.waterMl ?? 2500, program } : undefined), [raw, targets, program]);
}

export function ChallengesPage() {
  const { t } = useTranslation();
  const rtl = useSettings((s) => s.lang) === 'ar';
  const states = useLiveQuery(() => db.challenges.toArray(), [], [] as ChallengeState[]);
  const data = useChallengeData();
  const today = dateKey();

  // تحديث الحالة لما يكتمل التحدي
  useEffect(() => {
    if (!data) return;
    for (const st of states) {
      const def = getChallenge(st.id);
      if (def && st.status === 'active' && challengeSummary(def, st, data).completed) void db.challenges.put({ ...st, status: 'completed', updatedAt: Date.now() });
    }
  }, [states, data]);

  const join = (id: string) => db.challenges.put({ id, startDate: today, manualDone: [], status: 'active', updatedAt: Date.now() });
  const quit = (id: string) => db.challenges.delete(id);

  return (
    <PageTransition>
      <TopBar back title={t('ch.title')} />
      <p className="mb-4 text-sm text-muted">{t('ch.intro')}</p>
      <div className="flex flex-col gap-4">
        {CHALLENGES.map((def) => {
          const st = states.find((s) => s.id === def.id);
          const sum = st && data ? challengeSummary(def, st, data) : null;
          return (
            <Card key={def.id} className={cn(st?.status === 'completed' && 'border-primary/50 bg-grad-hero')}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: `${def.color}22` }}>{def.emoji}</span>
                <div className="flex-1">
                  <p className="font-extrabold">{t(`ch.${def.id}.name`)}</p>
                  <p className="text-xs text-muted">{t(`ch.${def.id}.desc`)}</p>
                </div>
                {sum && <ProgressRing value={sum.progress} size={56} stroke={6} color={def.color} label={<span className="text-sm">{sum.done}</span>} />}
              </div>

              {!st && <Button className="mt-3" fullWidth variant="secondary" onClick={() => join(def.id)}>{t('ch.join')}</Button>}

              {st && sum && (
                <>
                  <div className="mt-3 grid grid-cols-10 gap-1">
                    {sum.days.map((d) => (
                      <span key={d.date} title={`${t('ch.day')} ${d.day}`} className={cn('grid aspect-square place-items-center rounded-md text-xs font-bold',
                        d.status === 'done' ? 'text-white' : d.status === 'missed' ? 'bg-danger/15 text-danger' : d.status === 'today' ? 'bg-elevated ring-2 ring-accent' : 'bg-elevated text-muted')}
                        style={d.status === 'done' ? { background: def.color } : undefined}>{d.day}</span>
                    ))}
                  </div>
                  {st.status === 'completed' ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge tone="primary" className="flex-1 justify-center py-2 text-sm">🏆 {t('ch.completed')}</Badge>
                      <Button size="sm" variant="secondary" onClick={() => shareAchievement({ title: t(`ch.${def.id}.name`), subtitle: t('ch.completed'), emoji: def.emoji, rtl, stats: [{ label: t('ch.days'), value: '30/30' }] })}>
                        <Share2 size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      {def.kind === 'manual' && sum.today ? (
                        <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                          <Button fullWidth variant={sum.today.status === 'done' ? 'primary' : 'secondary'} onClick={() => db.challenges.put(toggleManual(st, today))}>
                            <Check size={18} /> {t(`ch.unit.${def.unit}`, { n: sum.today.target?.toLocaleString() })} {sum.today.status === 'done' ? '✓' : ''}
                          </Button>
                        </motion.div>
                      ) : (
                        <p className="flex-1 text-xs text-muted">{t(`ch.auto.${def.kind}`)}</p>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => quit(def.id)} aria-label={t('ch.quit')}><X size={18} /></Button>
                    </div>
                  )}
                  {sum.missed > 0 && st.status === 'active' && <p className="mt-2 text-xs text-muted">{t('ch.missedNote', { n: sum.missed })}</p>}
                </>
              )}
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
}
