import { motion } from 'framer-motion';
import { Camera, MoonStar, Salad } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Button, Card, EmptyState, ProgressRing, SegmentedControl, Skeleton } from '@/components/ui';
import { todayWeekday, usePlan } from '@/features/plan/lib/usePlan';
import { MealCard } from './components/MealCard';
import { WaterTracker } from './components/WaterTracker';
import { ShoppingList } from './components/ShoppingList';
import { SupplementsGuide } from './components/SupplementsGuide';
import { dailyMacros, useMealPlan, useWater } from './lib/useNutrition';
import { roundMacros } from './lib/foods';
import { ramadanSoon } from './lib/ramadan';
import { useSettings } from '@/store/settings';
import { useWeekPlan } from '@/features/plan/reschedule/useWeekPlan';
import { PhotoMealSheet } from './photo/PhotoMealSheet';
import { FoodLogList } from './photo/FoodLogList';

type Tab = 'meals' | 'water' | 'shopping' | 'supps';

export function NutritionPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('meals');
  const [photoOpen, setPhotoOpen] = useState(false);
  const { plan, targets, profile, consumed, toggleEaten, swap, loading } = useMealPlan();
  const water = useWater();
  const { program } = usePlan();
  const weekPlan = useWeekPlan();
  const ramadan = useSettings((s) => s.ramadan);
  const setRamadan = useSettings((s) => s.setRamadan);

  if (loading && !targets) return <PageTransition><Skeleton className="h-40" /><Skeleton className="mt-4 h-96" /></PageTransition>;
  if (!targets || !profile)
    return (
      <PageTransition>
        <TopBar title={t('nav.nutrition')} />
        <EmptyState icon={Salad} title={t('home.noPlan')} description={t('home.noPlanD')} />
        <Button fullWidth onClick={() => nav('/onboarding')}>{t('schedule.create')}</Button>
      </PageTransition>
    );

  const isTraining = weekPlan ? !!weekPlan.today.dayKey : program?.week.find((w) => w.weekday === todayWeekday())?.type === 'train';
  const waterTarget = isTraining ? targets.waterTrainingMl : targets.waterMl;
  const c = roundMacros(consumed);

  return (
    <PageTransition>
      <TopBar title={t('nav.nutrition')} />
      <Card variant="hero" className="mb-4 flex items-center justify-around">
        <ProgressRing value={c.kcal / targets.calories} size={100} label={c.kcal.toLocaleString()} sublabel={`/ ${targets.calories} kcal`} />
        <div className="flex flex-col gap-2 text-sm">
          {[
            { l: t('macros.protein'), v: c.protein, tg: targets.proteinG, col: '#E0823F' },
            { l: t('macros.carbs'), v: c.carbs, tg: targets.carbsG, col: '#D4AF6A' },
            { l: t('macros.fat'), v: c.fat, tg: targets.fatG, col: '#A9B98A' }
          ].map((x) => (
            <div key={x.l} className="w-36">
              <div className="mb-0.5 flex justify-between text-xs"><span className="text-muted">{x.l}</span><b>{x.v}/{x.tg}g</b></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                <motion.div className="h-full rounded-full" style={{ background: x.col }} animate={{ width: `${Math.min(100, (x.v / x.tg) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(ramadan || ramadanSoon()) && (
        <Card className="mb-4 flex items-center gap-3 border-accent/40">
          <MoonStar className="shrink-0 text-accent" />
          <div className="flex-1">
            <p className="font-bold">{ramadan ? t('ramadan.on') : t('ramadan.soon')}</p>
            <p className="text-xs text-muted">{t('ramadan.tip')}</p>
          </div>
          <Button size="sm" variant={ramadan ? 'secondary' : 'accent'} onClick={() => setRamadan(!ramadan)}>{ramadan ? t('ramadan.off') : t('ramadan.enable')}</Button>
        </Card>
      )}

      <div className="mb-4">
        <SegmentedControl<Tab> id="nutri-tab" value={tab} onChange={setTab}
          options={[{ value: 'meals', label: t('nutri.meals') }, { value: 'water', label: t('nutri.water') }, { value: 'shopping', label: t('nutri.shopping') }, { value: 'supps', label: t('nutri.supps') }]} />
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'meals' && (
          <div className="flex flex-col gap-3">
            <button onClick={() => setPhotoOpen(true)} className="btn-gold flex h-14 items-center justify-center gap-2 rounded-2xl font-semibold text-ink shadow-glow">
              <Camera size={20} /> {t('photo.cta')}
            </button>
            <FoodLogList />
            {!plan ? <Skeleton className="h-64" /> : plan.meals.map((m, i) => (
              <MealCard key={m.type} meal={m} onToggle={() => toggleEaten(i)} onSwap={() => swap(i)} />
            ))}
            <p className="text-center text-xs text-muted">{t('meals.note', { diet: t(`diets.${profile.diet}`) })}</p>
          </div>
        )}
        {tab === 'water' && <WaterTracker total={water.total} target={waterTarget} logs={water.logs} onAdd={water.add} onUndo={water.undo} />}
        {tab === 'shopping' && <ShoppingList daily={dailyMacros(targets)} diet={profile.diet} />}
        {tab === 'supps' && <SupplementsGuide />}
      </motion.div>
      <PhotoMealSheet open={photoOpen} onClose={() => setPhotoOpen(false)} />
    </PageTransition>
  );
}
