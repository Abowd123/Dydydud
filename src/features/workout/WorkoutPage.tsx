import { motion } from 'framer-motion';
import { BatteryLow, Clock, Dumbbell, Flame, History, Home, Play, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { prefetchWeekMedia } from '@/lib/prefetchMedia';
import { useSettings } from '@/store/settings';
import type { DayKey } from '@/types/program';
import { todayWeekday, usePlan } from '@/features/plan/lib/usePlan';
import { WorkoutDayList } from '@/features/plan/components/WorkoutDayList';
import { startSession, useActiveSession, useHistory, useStreak } from './lib/useWorkout';
import { useWeekPlan } from '@/features/plan/reschedule/useWeekPlan';
import { summarize } from './lib/session';
import { unlockAudio } from './lib/feedback';
import { COOLDOWN, WARMUP, routineMinutes } from './lib/routines';
import { adjustmentFor, isDeloadWeek, programWeek, readinessLevel } from './lib/progression';
import { levelOf, useTodayCheckin } from './lib/useCheckin';
import { ReadinessSheet } from './components/ReadinessSheet';
import { buildDay } from '@/features/plan/engine/engine';
import { dateKey } from '@/lib/date';

export function WorkoutPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const lang = useSettings((s) => s.lang);
  const warmupPref = useSettings((s) => s.warmup);
  const { program, profile, loading } = usePlan();
  const homeModeDate = useSettings((s) => s.homeMode);
  const setHomeMode = useSettings((s) => s.setHomeMode);
  const homeMode = homeModeDate === dateKey();
  const checkin = useTodayCheckin();
  const [askReady, setAskReady] = useState(false);
  const active = useActiveSession();
  const history = useHistory();
  const streak = useStreak();
  const weekPlan = useWeekPlan();
  const todaySlot = program?.week.find((w) => w.weekday === todayWeekday());
  const smartKey = weekPlan?.today.dayKey ?? (todaySlot?.type === 'train' ? todaySlot.dayKey : null);
  const defaultKey = (smartKey ?? Object.keys(program?.days ?? {})[0]) as DayKey | undefined;
  const comeback = !!weekPlan?.comeback;
  const [picked, setPicked] = useState<DayKey | undefined>();
  const key = picked ?? defaultKey;
  const planned = key ? program?.days[key] : undefined;
  // وضع البيت: نفس اليوم بتمارين بدون معدات
  const day = planned && homeMode && profile ? buildDay(planned.key, { ...profile, equipment: 'home' }) : planned;
  const week = program ? programWeek(program.createdAt) : 1;
  const deload = isDeloadWeek(week);

  useEffect(() => {
    if (program) void prefetchWeekMedia(program).catch(() => undefined);
  }, [program]);

  if (loading || active === undefined) return <PageTransition><Skeleton className="h-72" /></PageTransition>;
  if (!program || !day)
    return (
      <PageTransition>
        <TopBar title={t('nav.workout')} />
        <EmptyState icon={Zap} title={t('schedule.noPlan')} />
        <Button fullWidth onClick={() => nav('/onboarding')}>{t('schedule.create')}</Button>
      </PageTransition>
    );

  const go = async (score?: number) => {
    unlockAudio();
    const level = score != null ? readinessLevel(score) : levelOf(checkin);
    await startSession(day, !warmupPref, adjustmentFor(level, deload, comeback));
    nav('/workout/live');
  };
  const begin = () => (checkin ? go() : setAskReady(true));
  const adj = adjustmentFor(levelOf(checkin), deload, comeback);

  return (
    <PageTransition>
      <TopBar title={t('nav.workout')} right={<Badge tone="accent" className="text-sm"><Flame size={14} /> {streak}</Badge>} />

      {active && (
        <Card variant="hero" className="mb-4 border-accent/40">
          <p className="mb-1 font-bold">{t('live.resumeTitle')}</p>
          <p className="mb-3 text-sm text-muted">{t(`days.${active.dayKey}`)}</p>
          <Button variant="accent" fullWidth onClick={() => { unlockAudio(); nav('/workout/live'); }}><Play size={18} fill="currentColor" /> {t('live.resume')}</Button>
        </Card>
      )}

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {Object.values(program.days).map((d) => (
          <button key={d!.key} onClick={() => setPicked(d!.key)}
            className={cn('h-10 shrink-0 rounded-full border px-4 text-sm font-bold', key === d!.key ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-surface text-muted')}>
            {t(`days.${d!.key}`)}{todaySlot?.type === 'train' && todaySlot.dayKey === d!.key ? ` • ${t('schedule.today')}` : ''}
          </button>
        ))}
      </div>

      {deload && (
        <Card className="mb-3 flex gap-3 border-water/40">
          <BatteryLow className="shrink-0 text-water" />
          <div><p className="font-bold">{t('prog.deloadTitle', { w: week })}</p><p className="text-xs text-muted">{t('prog.deloadDesc')}</p></div>
        </Card>
      )}
      {!deload && adj.reason !== 'none' && (
        <Card className="mb-3 flex gap-3 border-accent/40">
          <BatteryLow className="shrink-0 text-accent" />
          {adj.reason === 'comeback'
            ? <div><p className="font-bold">{t('resched.comebackT', { d: weekPlan?.daysSinceLast })}</p><p className="text-xs text-muted">{t('resched.comebackD')}</p></div>
            : <div><p className="font-bold">{t('prog.lightTitle', { s: checkin?.score })}</p><p className="text-xs text-muted">{t('prog.lightDesc')}</p></div>}
        </Card>
      )}
      <button onClick={() => setHomeMode(homeMode ? null : dateKey())}
        className={cn('mb-3 flex w-full items-center gap-3 rounded-3xl border p-3 text-start transition', homeMode ? 'border-water bg-water/10' : 'border-border bg-surface')}>
        <Home className={homeMode ? 'text-water' : 'text-muted'} />
        <span className="flex-1"><span className="block font-bold">{t('prog.homeMode')}</span><span className="block text-xs text-muted">{t('prog.homeModeD')}</span></span>
        <span className={cn('relative h-7 w-12 rounded-full transition', homeMode ? 'bg-water' : 'bg-border')}>
          <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white transition-all', homeMode ? 'end-1' : 'start-1')} />
        </span>
      </button>

      <Card variant="hero" className="mb-4">
        <h2 className="font-display text-5xl tracking-wide">{t(`days.${day.key}`)}</h2>
        <p className="mb-3 text-sm text-muted">{day.focus.map((m) => t(`muscles.${m}`)).join(' • ')}</p>
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted">
          <span className="flex items-center gap-1"><Dumbbell size={16} /> {day.exercises.length} {t('ready.ex')}</span>
          <span className="flex items-center gap-1"><Clock size={16} /> ~{day.estimatedMinutes + (warmupPref ? routineMinutes(WARMUP) + routineMinutes(COOLDOWN) : 0)} {t('q.min')}</span>
        </div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button size="lg" fullWidth disabled={!!active} onClick={begin}><Play size={22} fill="currentColor" /> {t('home.start')}</Button>
        </motion.div>
      </Card>

      <WorkoutDayList day={day} />
      <ReadinessSheet open={askReady} onClose={() => setAskReady(false)} onDone={(r) => { setAskReady(false); void go(r.score); }} />

      {history.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-2 flex items-center gap-2 font-bold"><History size={18} /> {t('live.recent')}</h3>
          <div className="flex flex-col gap-2">
            {history.slice(0, 5).map((s) => {
              const sum = summarize(s, history);
              return (
                <button key={s.id} onClick={() => nav(`/workout/summary/${s.id}`)} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3 text-start">
                  <div>
                    <p className="font-bold">{t(`days.${s.dayKey}`)}</p>
                    <p className="text-xs text-muted">{new Date(s.startedAt).toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </div>
                  <div className="text-end text-xs text-muted">
                    <p><b className="text-text">{sum.volumeKg.toLocaleString()}</b> kg</p>
                    <p>{sum.durationMin} {t('q.min')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
