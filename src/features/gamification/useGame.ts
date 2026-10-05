import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { usePlan } from '@/features/plan/lib/usePlan';
import { useStreak } from '@/features/workout/lib/useWorkout';
import { computeBadges, computeXP, levelFromXP, titleFor, type GameInput } from './engine';

export function useGameInput(): GameInput | undefined {
  const { targets } = usePlan();
  const streak = useStreak();
  const data = useLiveQuery(async () => {
    const [sessions, mealPlans, water, metricsCount, photosCount, challenges] = await Promise.all([
      db.sessions.where('status').equals('finished').toArray(),
      db.mealPlans.toArray(),
      db.water.toArray(),
      db.bodyMetrics.count(),
      db.photos.count(),
      db.challenges.toArray()
    ]);
    const waterByDate: Record<string, number> = {};
    for (const w of water) waterByDate[w.date] = (waterByDate[w.date] ?? 0) + w.ml;
    return { sessions, mealPlans, waterByDate, metricsCount, photosCount, challengesCompleted: challenges.filter((c) => c.status === 'completed').length };
  }, []);
  if (!data) return undefined;
  return { ...data, streak, waterTargetMl: targets?.waterMl ?? 2500 };
}

export function useGame() {
  const input = useGameInput();
  if (!input) return undefined;
  const xp = computeXP(input);
  const lvl = levelFromXP(xp.total);
  return { input, xp, ...lvl, title: titleFor(lvl.level), badges: computeBadges(input) };
}
