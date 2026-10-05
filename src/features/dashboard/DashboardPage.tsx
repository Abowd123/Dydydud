import { motion } from 'framer-motion';
import { Bed, Bot, CalendarDays, ChevronLeft, ChevronRight, Clock, Dumbbell, Flame, Footprints, GlassWater, Play, Sparkles } from 'lucide-react';
import { LevelCard } from '@/features/gamification/LevelCard';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { Badge, Button, Card, ProgressRing, Skeleton } from '@/components/ui';
import { todayWeekday, usePlan } from '@/features/plan/lib/usePlan';
import { getExercise } from '@/features/exercises/lib/repository';
import { useSettings } from '@/store/settings';
import { useMealPlan, useWater } from '@/features/nutrition/lib/useNutrition';
import { useStreak } from '@/features/workout/lib/useWorkout';
import { useWeekPlan } from '@/features/plan/reschedule/useWeekPlan';
import { RescheduleBanner } from '@/features/plan/reschedule/RescheduleBanner';

export function DashboardPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const lang = useSettings((s) => s.lang);
  const { program, targets, loading } = usePlan();
  const { consumed } = useMealPlan();
  const waterLog = useWater();
  const streak = useStreak();
  const weekPlan = useWeekPlan();

  if (loading) return <PageTransition><Skeleton className="mb-4 h-12 w-2/3" /><Skeleton className="h-64" /></PageTransition>;

  const today = todayWeekday();
  const slot = program?.week.find((w) => w.weekday === today);
  // الجدولة الذكية: لو فاتته حصة ننقلها لليوم
  const todayKey = weekPlan ? weekPlan.today.dayKey : slot?.type === 'train' ? slot.dayKey : null;
  const day = todayKey ? program?.days[todayKey] : undefined;
  const nextTrain = program && !day
    ? [1, 2, 3, 4, 5, 6].map((o) => program.week.find((w) => w.weekday === (today + o) % 7)!).find((w) => w.type === 'train')
    : undefined;
  const water = targets ? (day ? targets.waterTrainingMl : targets.waterMl) : 0;

  return (
    <PageTransition>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="h-title">{t('home.greeting')}</h1>
        </div>
        <div className="surface-lux flex items-center gap-1.5 rounded-2xl px-3.5 py-2" title={t('home.streak')}>
          <Flame className="animate-flame text-accent" size={22} fill="currentColor" />
          <span className="font-display text-2xl font-semibold leading-none text-accent">{streak}</span>
        </div>
      </div>

      {weekPlan && !weekPlan.today.done && <RescheduleBanner plan={weekPlan} />}

      {!program ? (
        <Card variant="hero" className="mb-4 text-center">
          <Sparkles className="mx-auto mb-2 text-primary" size={36} />
          <h2 className="mb-1 text-xl font-extrabold">{t('home.noPlan')}</h2>
          <p className="mb-4 text-sm text-muted">{t('home.noPlanD')}</p>
          <Button fullWidth onClick={() => nav('/onboarding')}>{t('schedule.create')}</Button>
        </Card>
      ) : day ? (
        <Card variant="hero" className="mb-4">
          <Badge tone="primary" className="mb-3">{t('home.today')}</Badge>
          <h2 className="mb-1 font-display text-6xl font-semibold leading-none tracking-wide text-gradient">{t(`days.${day.key}`)}</h2>
          <p className="mb-3 text-sm text-muted">{day.focus.map((m) => t(`muscles.${m}`)).join(' • ')}</p>
          <div className="mb-4 flex gap-4 text-sm text-muted">
            <span className="flex items-center gap-1"><Dumbbell size={16} /> {day.exercises.length} {t('ready.ex')}</span>
            <span className="flex items-center gap-1"><Clock size={16} /> {day.estimatedMinutes} {t('q.min')}</span>
          </div>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {day.exercises.slice(0, 4).map((x) => (
              <span key={x.exerciseId} className="rounded-full bg-elevated px-2.5 py-1 text-xs">{getExercise(x.exerciseId)?.name[lang]}</span>
            ))}
            {day.exercises.length > 4 && <span className="rounded-full bg-elevated px-2.5 py-1 text-xs">+{day.exercises.length - 4}</span>}
          </div>
          <Button size="lg" fullWidth onClick={() => nav('/workout')}>
            <Play size={20} fill="currentColor" /> {t('home.start')}
          </Button>
          <Dumbbell className="pointer-events-none absolute -bottom-8 -end-8 text-gold/[0.07]" size={170} strokeWidth={1} />
        </Card>
      ) : (
        <Card variant="hero" className="mb-4">
          {slot?.type === 'cardio' ? <Footprints className="mb-2 text-water" size={36} /> : <Bed className="mb-2 text-muted" size={36} />}
          <h2 className="mb-1 text-2xl font-extrabold">{slot?.type === 'cardio' ? t('schedule.cardio', { m: slot.minutes }) : t('schedule.restDay')}</h2>
          <p className="mb-4 text-sm text-muted">{slot?.type === 'cardio' ? t('schedule.cardioD') : t('schedule.restD')}</p>
          {nextTrain?.type === 'train' && (
            <p className="text-sm">{t('home.next')}: <b>{t(`days.${nextTrain.dayKey}`)}</b> • {t(`weekdays.${nextTrain.weekday}`)}</p>
          )}
        </Card>
      )}

      {targets && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { color: '#D4AF6A', v: consumed.kcal / targets.calories, label: Math.round(consumed.kcal).toLocaleString(), sub: `/ ${targets.calories}` },
            { color: '#E0823F', v: consumed.protein / targets.proteinG, label: `${Math.round(consumed.protein)}g`, sub: `/ ${targets.proteinG}g` },
            { color: '#7DB4D6', v: waterLog.total / water, label: `${(waterLog.total / 1000).toFixed(1)}L`, sub: `/ ${(water / 1000).toFixed(1)}L` }
          ].map((r, k) => (
            <motion.div key={k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * k }}>
              <button className="w-full" onClick={() => nav('/nutrition')}>
                <Card className="flex justify-center p-3">
                  <ProgressRing value={r.v} color={r.color} size={92} label={r.label} sublabel={r.sub} />
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}
      {targets && (
        <Button variant="secondary" fullWidth className="mt-3" onClick={() => waterLog.add(250)}>
          <GlassWater size={18} className="text-water" /> {t('home.addWater')}
        </Button>
      )}

      <button onClick={() => nav('/coach')} className="mt-4 flex w-full items-center gap-3 rounded-3xl border border-border bg-surface p-3 text-start">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-grad-energy text-ink"><Bot size={22} /></span>
        <span className="flex-1"><span className="block font-bold">{t('coach.cta')}</span><span className="block text-xs text-muted">{t('coach.ctaD')}</span></span>
        {lang === 'ar' ? <ChevronLeft className="text-muted" /> : <ChevronRight className="text-muted" />}
      </button>
      <div className="mt-3"><LevelCard compact /></div>

      {program && (
        <Button variant="secondary" fullWidth className="mt-4" onClick={() => nav('/schedule')}>
          <CalendarDays size={18} /> {t('home.viewWeek')}
        </Button>
      )}
      <p className="mt-6 text-center text-xs text-muted">{t('disclaimer')}</p>
    </PageTransition>
  );
}
