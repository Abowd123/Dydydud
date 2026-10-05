import type { WorkoutSession } from '@/types/workout';
import type { MealPlan } from '@/types/nutrition';
import { summarize } from '@/features/workout/lib/session';

/** كل الإنجازات محسوبة من بياناتك (ما تنحفظ)، فما تضيع ولا تتلخبط مع المزامنة */
export interface GameInput {
  sessions: WorkoutSession[];
  mealPlans: MealPlan[];
  waterByDate: Record<string, number>;
  waterTargetMl: number;
  metricsCount: number;
  photosCount: number;
  streak: number;
  challengesCompleted: number;
}

export const XP = { workout: 100, set: 2, pr: 50, meal: 10, waterGoal: 20, metric: 15, photo: 25, challenge: 300 } as const;

export function computeXP(i: GameInput) {
  const fin = i.sessions.filter((s) => s.status === 'finished');
  const sets = fin.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets.filter((x) => x.done).length, 0), 0);
  const prs = countPRs(fin);
  const meals = i.mealPlans.reduce((a, p) => a + p.meals.filter((m) => m.eaten).length, 0);
  const waterDays = Object.values(i.waterByDate).filter((v) => v >= i.waterTargetMl).length;
  const parts = {
    workouts: fin.length * XP.workout, sets: sets * XP.set, prs: prs * XP.pr, meals: meals * XP.meal,
    water: waterDays * XP.waterGoal, metrics: i.metricsCount * XP.metric, photos: i.photosCount * XP.photo, challenges: i.challengesCompleted * XP.challenge
  };
  return { total: Object.values(parts).reduce((a, b) => a + b, 0), parts, prs, waterDays, sets };
}

/** عدد الأرقام القياسية عبر التاريخ (كل حصة مقارنة باللي قبلها) */
export function countPRs(finished: WorkoutSession[]) {
  const sorted = [...finished].sort((a, b) => a.startedAt - b.startedAt);
  return sorted.reduce((n, s, i) => n + summarize(s, sorted.slice(0, i)).prs.length, 0);
}

/** المستوى L يحتاج 50 × L × (L-1) نقطة: 2=100، 3=300، 4=600، 5=1000 ... */
export const xpForLevel = (l: number) => 50 * l * (l - 1);
export function levelFromXP(xp: number) {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  const cur = xpForLevel(l), next = xpForLevel(l + 1);
  return { level: l, current: xp - cur, needed: next - cur, progress: (xp - cur) / (next - cur) };
}
export const TITLES = ['rookie', 'starter', 'committed', 'athlete', 'beast', 'legend'] as const;
export const titleFor = (level: number) => TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 3))];

export interface Badge { id: string; emoji: string; value: number; target: number; unlocked: boolean }

export function computeBadges(i: GameInput): Badge[] {
  const fin = i.sessions.filter((s) => s.status === 'finished');
  const { prs, waterDays } = computeXP(i);
  const volume = fin.reduce((v, s) => v + summarize(s, []).volumeKg, 0);
  const early = fin.filter((s) => new Date(s.startedAt).getHours() < 8).length;
  const late = fin.filter((s) => new Date(s.startedAt).getHours() >= 21).length;
  const defs: [string, string, number, number][] = [
    ['firstWorkout', '🎯', fin.length, 1],
    ['workouts10', '💪', fin.length, 10],
    ['workouts50', '🏋️', fin.length, 50],
    ['workouts100', '👑', fin.length, 100],
    ['streak3', '🔥', i.streak, 3],
    ['streak7', '⚡', i.streak, 7],
    ['streak30', '🌋', i.streak, 30],
    ['firstPR', '🥇', prs, 1],
    ['prs10', '🏆', prs, 10],
    ['volume10t', '🪨', volume, 10_000],
    ['volume100t', '⛰️', volume, 100_000],
    ['water7', '💧', waterDays, 7],
    ['water30', '🌊', waterDays, 30],
    ['earlyBird', '🌅', early, 5],
    ['nightOwl', '🦉', late, 5],
    ['firstPhoto', '📸', i.photosCount, 1],
    ['tracker', '📏', i.metricsCount, 10],
    ['challenger', '🎖️', i.challengesCompleted, 1]
  ];
  return defs.map(([id, emoji, value, target]) => ({ id, emoji, value: Math.min(value, target), target, unlocked: value >= target }));
}

/** الشارات الجديدة بين حالتين (لعرض "فتحت شارة!") */
export const newlyUnlocked = (before: Badge[], after: Badge[]) => after.filter((b) => b.unlocked && !before.find((x) => x.id === b.id)?.unlocked);
