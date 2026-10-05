import { motion } from 'framer-motion';
import { Bed, CalendarDays, Check, Clock, Footprints, Pencil, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import type { Weekday } from '@/types/profile';
import { WorkoutDayList } from '@/features/plan/components/WorkoutDayList';
import { regenerateProgram, todayWeekday, usePlan, weekOrder } from '@/features/plan/lib/usePlan';
import { useWeekPlan } from '@/features/plan/reschedule/useWeekPlan';
import { dateKey } from '@/lib/date';

export function SchedulePage() {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const { program, targets, loading } = usePlan();
  const nav = useNavigate();
  const today = todayWeekday();
  const [sel, setSel] = useState<Weekday>(today);
  const [busy, setBusy] = useState(false);
  const weekPlan = useWeekPlan();
  const smart = useSettings((s) => s.smartReschedule);
  const setPref = useSettings((s) => s.setPref);
  const todayIso = dateKey();

  if (loading) return <PageTransition><Skeleton className="h-24" /><Skeleton className="mt-4 h-80" /></PageTransition>;
  if (!program)
    return (
      <PageTransition>
        <TopBar title={t('nav.schedule')} />
        <EmptyState icon={CalendarDays} title={t('schedule.noPlan')} />
        <Button fullWidth onClick={() => nav('/onboarding')}>{t('schedule.create')}</Button>
      </PageTransition>
    );

  const slot = program.week.find((w) => w.weekday === sel)!;
  // الجدولة الذكية: الأيام الجاية تعرض الترتيب بعد نقل الحصص الفايتة
  const effKey = (wd: number) => {
    const s0 = program.week.find((w) => w.weekday === wd)!;
    const pd = weekPlan?.days.find((d) => d.weekday === wd);
    if (!pd || (pd.date < todayIso && !pd.done)) return s0.type === 'train' ? s0.dayKey : null;
    return pd.dayKey;
  };
  const selKey = effKey(sel);
  const day = selKey ? program.days[selKey] : undefined;
  const selPd = weekPlan?.days.find((d) => d.weekday === sel);

  return (
    <PageTransition>
      <TopBar
        title={t('nav.schedule')}
        right={
          <div className="flex gap-2">
            <Button size="icon" variant="secondary" aria-label={t('schedule.edit')} onClick={() => nav('/onboarding')}><Pencil size={18} /></Button>
            <Button size="icon" variant="secondary" aria-label={t('schedule.regenerate')} loading={busy}
              onClick={async () => { setBusy(true); await regenerateProgram(); setBusy(false); }}>
              {!busy && <RefreshCw size={18} />}
            </Button>
          </div>
        }
      />
      <div className="mb-2 flex items-center justify-between">
        <Badge tone="accent">{t('schedule.week', { n: program.weekNumber })}</Badge>
        <span className="text-xs text-muted">{t(`splits.${program.split}`)}</span>
      </div>

      <label className="mb-3 flex items-center justify-between gap-3 rounded-2xl border hairline bg-surface px-4 py-3">
        <span><span className="block text-sm font-semibold">{t('resched.toggle')}</span><span className="block text-xs text-muted">{t('resched.toggleD')}</span></span>
        <input type="checkbox" className="h-5 w-5 accent-[#D4AF6A]" checked={smart} onChange={(e) => setPref('smartReschedule', e.target.checked)} />
      </label>

      <div className="mb-5 grid grid-cols-7 gap-1.5">
        {weekOrder(lang).map((wd) => {
          const s = program.week.find((w) => w.weekday === wd)!;
          const pd = weekPlan?.days.find((d) => d.weekday === wd);
          const k = effKey(wd);
          const active = wd === sel;
          return (
            <button key={wd} onClick={() => setSel(wd)} className={cn('relative flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition', active ? 'border-primary bg-primary/10' : 'border-border bg-surface')}>
              {active && <motion.span layoutId="week-sel" className="absolute inset-0 rounded-2xl ring-2 ring-primary" />}
              <span className={cn(wd === today ? 'text-accent' : 'text-muted')}>{t(`weekdaysShort.${wd}`)}</span>
              <span className={cn('grid h-7 w-7 place-items-center rounded-full', pd?.done ? 'bg-success/20 text-success' : k ? 'bg-grad-primary text-ink' : s.type === 'cardio' ? 'bg-water/20 text-water' : 'bg-elevated text-muted')}>
                {pd?.done ? <Check size={14} /> : k ? '💪' : s.type === 'cardio' ? <Footprints size={14} /> : <Bed size={14} />}
              </span>
              {pd?.movedFrom !== undefined && !pd.done && <span className="absolute top-1.5 end-1.5 h-1.5 w-1.5 rounded-full bg-accent" aria-label={t('resched.moved')} />}
            </button>
          );
        })}
      </div>

      <motion.div key={sel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="mb-1 text-sm text-muted">{t(`weekdays.${sel}`)}{sel === today && ` • ${t('schedule.today')}`}
          {selPd?.movedFrom !== undefined && !selPd.done && <span className="text-accent"> • {t('resched.movedFromDay', { d: t(`weekdays.${selPd.movedFrom}`) })}</span>}</p>
        {day ? (
          <>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="font-display text-4xl tracking-wide">{t(`days.${day.key}`)}</h2>
                <p className="text-sm text-muted">{day.focus.map((m) => t(`muscles.${m}`)).join(' • ')}</p>
              </div>
              <span className="flex items-center gap-1 text-sm text-muted"><Clock size={16} /> {day.estimatedMinutes} {t('q.min')}</span>
            </div>
            <WorkoutDayList day={day} />
          </>
        ) : slot.type === 'cardio' ? (
          <Card className="border-water/30">
            <Footprints className="mb-2 text-water" size={32} />
            <h2 className="text-2xl font-extrabold">{t('schedule.cardio', { m: slot.minutes })}</h2>
            <p className="text-sm text-muted">{t('schedule.cardioD')}</p>
          </Card>
        ) : (
          <Card>
            <Bed className="mb-2 text-muted" size={32} />
            <h2 className="text-2xl font-extrabold">{t('schedule.restDay')}</h2>
            <p className="text-sm text-muted">{t('schedule.restD')}</p>
          </Card>
        )}
        {targets && (
          <Card className="mt-4 flex justify-around text-center">
            <div><p className="font-extrabold">{targets.calories}</p><p className="text-xs text-muted">kcal</p></div>
            <div><p className="font-extrabold text-accent">{targets.proteinG}g</p><p className="text-xs text-muted">{t('macros.protein')}</p></div>
            <div><p className="font-extrabold text-water">{((slot.type === 'train' ? targets.waterTrainingMl : targets.waterMl) / 1000).toFixed(1)}L</p><p className="text-xs text-muted">{t('home.water')}</p></div>
          </Card>
        )}
      </motion.div>
    </PageTransition>
  );
}
