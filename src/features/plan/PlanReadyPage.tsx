import { motion } from 'framer-motion';
import { CalendarCheck, Droplets, Flame, PartyPopper } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, CardTitle, Skeleton } from '@/components/ui';
import { MacroBar } from './components/MacroBar';
import { usePlan } from './lib/usePlan';

/** شاشة "خطتك جاهزة" بعد الاستبيان */
export function PlanReadyPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { profile, program, targets, loading } = usePlan();
  if (loading) return <div className="page"><Skeleton className="h-96" /></div>;
  if (!profile || !program || !targets) return <Navigate to="/onboarding" replace />;
  const trainDays = program.week.filter((w) => w.type === 'train').length;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pb-8 pt-8">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-grad-energy shadow-glow">
        <PartyPopper size={44} className="text-ink" />
      </motion.div>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">{t('ready.title')}</h1>
        <p className="text-muted">{t('ready.subtitle')}</p>
      </div>

      <Card variant="hero">
        <div className="mb-1 flex items-center gap-2 text-sm text-muted"><Flame size={16} className="text-accent" /> {t('ready.calories')}</div>
        <p className="mb-1 font-display text-6xl tracking-wide">{targets.calories.toLocaleString()}</p>
        <p className="mb-4 text-xs text-muted">BMR {targets.bmr} • TDEE {targets.tdee} • BMI {targets.bmi}</p>
        <MacroBar proteinG={targets.proteinG} carbsG={targets.carbsG} fatG={targets.fatG} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1">
          <Droplets className="text-water" />
          <p className="text-2xl font-extrabold">{(targets.waterMl / 1000).toFixed(1)}L</p>
          <p className="text-xs text-muted">{t('ready.water', { l: (targets.waterTrainingMl / 1000).toFixed(1) })}</p>
        </Card>
        <Card className="flex flex-col gap-1">
          <CalendarCheck className="text-primary" />
          <p className="text-2xl font-extrabold">{trainDays} {t('ready.days')}</p>
          <p className="text-xs text-muted">{t(`splits.${program.split}`)}</p>
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-2">{t('ready.yourDays')}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {Object.values(program.days).map((d) => (
            <Badge key={d!.key} tone="primary">{t(`days.${d!.key}`)} • {d!.exercises.length} {t('ready.ex')}</Badge>
          ))}
        </div>
      </Card>

      <Button size="lg" fullWidth className="mt-auto" onClick={() => nav('/schedule', { replace: true })}>{t('ready.cta')}</Button>
      <p className="text-center text-xs text-muted">{t('disclaimer')}</p>
    </div>
  );
}
