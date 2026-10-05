import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { usePlan } from '@/features/plan/lib/usePlan';
import type { NutritionTargets } from '@/types/program';
import type { Macros, MealPlan } from '@/types/nutrition';
import type { Profile } from '@/types/profile';
import { useSettings } from '@/store/settings';
import { mealMacros, sumMacros, ZERO } from './foods';
import { generateDay, swapMeal } from './generator';
import { useFoodLog } from '../photo/useFoodLog';

export const dailyMacros = (t: NutritionTargets): Macros => ({ kcal: t.calories, protein: t.proteinG, carbs: t.carbsG, fat: t.fatG });

export function buildPlan(profile: Profile, targets: NutritionTargets, date: string, mode: 'normal' | 'ramadan' = 'normal'): MealPlan {
  return { date, meals: generateDay(dailyMacros(targets), profile.diet, date, mode), profileVersion: profile.updatedAt, createdAt: Date.now(), mode };
}

export function useMealPlan(date = dateKey()) {
  const { profile, targets, loading: planLoading } = usePlan();
  const plan = useLiveQuery(async () => (await db.mealPlans.get(date)) ?? null, [date]);
  const mode = useSettings((s) => (s.ramadan ? 'ramadan' : 'normal'));

  // نولّد خطة اليوم لو ما فيه، أو لو تغيّر الملف الشخصي وما أكلت شي لسه
  useEffect(() => {
    if (!profile || !targets || plan === undefined) return;
    const changed = plan && (plan.profileVersion !== profile.updatedAt || (plan.mode ?? 'normal') !== mode);
    const stale = changed && !plan.meals.some((m) => m.eaten);
    if (!plan || stale) void db.mealPlans.put(buildPlan(profile, targets, date, mode));
  }, [profile, targets, plan, date, mode]);

  // الوجبات اللي أكلها من الخطة + أي أكل سجله بالصورة أو يدوي
  const extra = useFoodLog(date).total;
  const consumed: Macros = sumMacros([plan ? sumMacros(plan.meals.filter((m) => m.eaten).map((m) => mealMacros(m.items))) : ZERO, extra]);
  const planned: Macros = plan ? sumMacros(plan.meals.map((m) => mealMacros(m.items))) : ZERO;

  const toggleEaten = async (i: number) => {
    if (!plan) return;
    const meals = plan.meals.map((m, k) => (k === i ? { ...m, eaten: !m.eaten } : m));
    await db.mealPlans.put({ ...plan, meals });
  };

  const swap = async (i: number) => {
    if (!plan || !profile) return;
    const m = plan.meals[i];
    const next = swapMeal(m, profile.diet, date, (m.seed % 1000) + 1 + Math.floor(Math.random() * 1000));
    await db.mealPlans.put({ ...plan, meals: plan.meals.map((x, k) => (k === i ? next : x)) });
  };

  return { plan: plan ?? undefined, targets, profile, consumed, planned, toggleEaten, swap, loading: planLoading || plan === undefined };
}

export function useWater(date = dateKey()) {
  const logs = useLiveQuery(() => db.water.where('date').equals(date).sortBy('at'), [date], []);
  const total = logs.reduce((s, l) => s + l.ml, 0);
  const add = (ml: number) => db.water.add({ id: crypto.randomUUID(), date, ml, at: Date.now() });
  const undo = async () => {
    const last = logs[logs.length - 1];
    if (last) await db.water.delete(last.id);
  };
  return { logs, total, add, undo };
}
