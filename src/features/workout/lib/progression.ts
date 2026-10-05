import type { WorkoutSession } from '@/types/workout';
import type { Equipment } from '@/types/exercise';
import { getExercise } from '@/features/exercises/lib/repository';
import { WEIGHT_STEP } from './session';

/* ================= الجاهزية (النوم والإرهاق) ================= */
export interface Readiness { sleepH: number; energy: 1 | 2 | 3 | 4 | 5; soreness: 1 | 2 | 3 | 4 | 5 }
export type ReadinessLevel = 'high' | 'normal' | 'low' | 'veryLow';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 0 إلى 100: النوم 40%، الطاقة 35%، قلة الألم العضلي 25% */
export function readinessScore(r: Readiness): number {
  return Math.round(clamp01((r.sleepH - 4) / 4) * 40 + ((r.energy - 1) / 4) * 35 + ((5 - r.soreness) / 4) * 25);
}
export const readinessLevel = (score: number): ReadinessLevel => (score >= 75 ? 'high' : score >= 50 ? 'normal' : score >= 30 ? 'low' : 'veryLow');

export interface Adjustment { setsDelta: number; weightFactor: number; reason: 'none' | 'lowReadiness' | 'veryLowReadiness' | 'deload' | 'comeback' }

export function adjustmentFor(level: ReadinessLevel | null, deload: boolean, comeback = false): Adjustment {
  if (deload) return { setsDelta: -1, weightFactor: 0.9, reason: 'deload' };
  // رجعة بعد غياب 10 أيام أو أكثر: نخفف 10% أو أكثر لو مرهق
  if (comeback) return { setsDelta: -1, weightFactor: level === 'veryLow' ? 0.85 : 0.9, reason: 'comeback' };
  if (level === 'veryLow') return { setsDelta: -1, weightFactor: 0.85, reason: 'veryLowReadiness' };
  if (level === 'low') return { setsDelta: -1, weightFactor: 0.95, reason: 'lowReadiness' };
  return { setsDelta: 0, weightFactor: 1, reason: 'none' };
}

export const roundToStep = (w: number, eq: Equipment) => {
  const step = WEIGHT_STEP[eq];
  return Math.max(0, Math.round(w / step) * step);
};

/** يطبق التخفيف على حصة جديدة (قبل ما تبدأ) */
export function applyAdjustment(s: WorkoutSession, adj: Adjustment): WorkoutSession {
  if (adj.reason === 'none') return s;
  return {
    ...s,
    exercises: s.exercises.map((e) => {
      const ex = getExercise(e.exerciseId);
      const keep = Math.max(2, e.sets.length + adj.setsDelta);
      return {
        ...e,
        suggestedWeight: e.suggestedWeight !== null && ex ? roundToStep(e.suggestedWeight * adj.weightFactor, ex.equipment) : e.suggestedWeight,
        sets: e.sets.slice(0, keep).map((x) => ({ ...x, weight: ex ? roundToStep(x.weight * adj.weightFactor, ex.equipment) : x.weight }))
      };
    })
  };
}

/* ================= أسبوع التخفيف (Deload) ================= */
export const DELOAD_EVERY = 7;
export const programWeek = (createdAt: number, now = Date.now()) => Math.floor((now - createdAt) / (7 * 86400000)) + 1;
export const isDeloadWeek = (week: number, every = DELOAD_EVERY) => week > 0 && week % every === 0;

/* ================= التوقف عن التقدم (Plateau) ================= */
export { stalled as detectStall } from './session';

/** التقدم المزدوج: نفس الوزن ← حاول تزيد تكرار وحد لين توصل الحد الأعلى */
export const nextReps = (lastReps: number, min: number, max: number) => Math.min(max, Math.max(min, lastReps + 1));
