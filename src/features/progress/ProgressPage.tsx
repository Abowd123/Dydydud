import { motion } from 'framer-motion';
import { Clock, Dumbbell, Flame, RefreshCw, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Button, Card } from '@/components/ui';
import { usePlan, saveProfileAndGenerate } from '@/features/plan/lib/usePlan';
import { profileSchema } from '@/features/plan/lib/schema';
import { useHistory, useStreak } from '@/features/workout/lib/useWorkout';
import { totals } from './lib/stats';
import { useMetrics } from './lib/useProgress';
import { WeightCard } from './components/WeightCard';
import { MeasurementsCard } from './components/MeasurementsCard';
import { StrengthCard } from './components/StrengthCard';
import { VolumeCard } from './components/VolumeCard';
import { ConsistencyCard } from './components/ConsistencyCard';
import { PhotosCard } from './components/PhotosCard';
import { MetricSheet } from './components/MetricSheet';

export function ProgressPage() {
  const { t } = useTranslation();
  const { profile } = usePlan();
  const sessions = useHistory();
  const streak = useStreak();
  const metrics = useMetrics();
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const tot = totals(sessions);
  const lastWeight = [...metrics].reverse().find((m) => m.weightKg)?.weightKg;
  const drift = profile && lastWeight ? Math.abs(lastWeight - profile.weightKg) >= 1 : false;

  const updatePlan = async () => {
    if (!profile || !lastWeight) return;
    setUpdating(true);
    const parsed = profileSchema.safeParse({ ...profile, weightKg: lastWeight });
    if (parsed.success) await saveProfileAndGenerate(parsed.data);
    setUpdating(false);
  };

  const stats = [
    { icon: Trophy, v: tot.workouts, l: t('progress.workouts'), c: 'text-accent' },
    { icon: Flame, v: streak, l: t('home.streak'), c: 'text-accent' },
    { icon: Dumbbell, v: tot.volumeKg >= 1000 ? `${(tot.volumeKg / 1000).toFixed(1)}t` : tot.volumeKg, l: t('progress.totalVolume'), c: 'text-primary' },
    { icon: Clock, v: Math.round(tot.minutes / 60), l: t('progress.hours'), c: 'text-water' }
  ];

  return (
    <PageTransition>
      <TopBar back title={t('pages.progress')} />
      <div className="mb-4 grid grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, v, l, c }, i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="flex flex-col items-center gap-0.5 p-2.5 text-center">
              <Icon size={16} className={c} />
              <span className="text-lg font-extrabold">{v}</span>
              <span className="text-xs leading-tight text-muted">{l}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {drift && (
        <Card variant="hero" className="mb-4 flex items-center gap-3">
          <p className="flex-1 text-sm">{t('progress.driftMsg', { w: lastWeight })}</p>
          <Button size="sm" loading={updating} onClick={updatePlan}><RefreshCw size={16} /> {t('progress.updatePlan')}</Button>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <WeightCard metrics={metrics} goal={profile?.goal} onAdd={() => setOpen(true)} />
        <StrengthCard sessions={sessions} />
        <VolumeCard sessions={sessions} />
        <ConsistencyCard sessions={sessions} />
        <MeasurementsCard metrics={metrics} profile={profile} />
        <PhotosCard />
      </div>
      <MetricSheet open={open} onClose={() => setOpen(false)} lastWeight={lastWeight ?? profile?.weightKg} />
    </PageTransition>
  );
}
