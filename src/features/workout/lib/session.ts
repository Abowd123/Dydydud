import type { Equipment, Exercise } from '@/types/exercise';
import type { DayKey, WorkoutDay } from '@/types/program';
import type { Feel, PersonalRecord, SessionExercise, SessionSummary, SetLog, WorkoutSession } from '@/types/workout';
import { getExercise } from '@/features/exercises/lib/repository';
import { oneRepMax } from '@/lib/calculations';

export interface RepTarget { min: number; max: number; unit: 'reps' | 'sec'; perSide: boolean }

/** "6-10" | "10/رجل" | "30-60 ث" | "20" */
export function parseReps(reps: string): RepTarget {
  const unit = /ث|sec|s$/i.test(reps) ? 'sec' : 'reps';
  const perSide = /\/|رجل|جهة|side|leg/i.test(reps);
  const nums = (reps.match(/\d+/g) ?? ['10']).map(Number);
  return { min: nums[0], max: nums[1] ?? nums[0], unit, perSide };
}

export const WEIGHT_STEP: Record<Equipment, number> = { barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 2.5 };
export const usesWeight = (e: Exercise) => e.equipment !== 'bodyweight';

export interface LastPerformance { date: string; weight: number; sets: SetLog[] }

/** آخر أداء مسجل لتمرين (من الحصص المكتملة، الأحدث أول) */
export function lastPerformance(history: WorkoutSession[], exerciseId: string): LastPerformance | null {
  const sorted = history.filter((s) => s.status === 'finished').sort((a, b) => b.startedAt - a.startedAt);
  for (const s of sorted) {
    const ex = s.exercises.find((x) => x.exerciseId === exerciseId);
    const done = ex?.sets.filter((x) => x.done) ?? [];
    if (done.length) return { date: s.date, weight: Math.max(...done.map((d) => d.weight)), sets: done };
  }
  return null;
}

/**
 * اقتراح الوزن (Progressive Overload مبسط):
 * - كل الجولات وصلت أعلى التكرار وما كانت "صعبة" ← زِد الوزن
 * - أغلب الجولات تحت أقل تكرار ← نزّل الوزن
 * - غير كذا ← نفس الوزن
 */
export function suggestWeight(exercise: Exercise, targetReps: string, targetSets: number, history: WorkoutSession[]): number | null {
  const last = lastPerformance(history, exercise.id);
  if (!last) return null;
  if (!usesWeight(exercise)) return last.weight;
  const { min, max } = parseReps(targetReps);
  const step = WEIGHT_STEP[exercise.equipment];
  const top = last.sets.filter((s) => s.weight === last.weight);
  const allTop = top.length >= targetSets && top.every((s) => s.reps >= max && s.feel !== 'hard');
  const mostlyFailed = top.filter((s) => s.reps < min).length > top.length / 2;
  if (allTop) return last.weight + step;
  if (mostlyFailed) return Math.max(0, last.weight - step);
  // متوقف 3 مرات: نخفف 10% ونبني من جديد (Deload للتمرين)
  if (stalled(history, exercise.id)) return Math.max(0, Math.round((last.weight * 0.9) / step) * step);
  return last.weight;
}

export function createSession(day: WorkoutDay, history: WorkoutSession[], date: string, now = Date.now()): WorkoutSession {
  const exercises = day.exercises.map((p): SessionExercise => buildExercise(p.exerciseId, p, history));
  return {
    id: `${date}-${day.key}-${now}`,
    date,
    dayKey: day.key as DayKey,
    status: 'active',
    phase: 'warmup',
    startedAt: now,
    exercises,
    current: { ex: 0, set: 0 },
    exerciseIds: exercises.map((e) => e.exerciseId)
  };
}

function buildExercise(exerciseId: string, target: { sets: number; reps: string; restSec: number }, history: WorkoutSession[]): SessionExercise {
  const e = getExercise(exerciseId)!;
  const suggested = suggestWeight(e, target.reps, target.sets, history);
  const last = lastPerformance(history, exerciseId);
  const { min, max, unit } = parseReps(target.reps);
  // التقدم المزدوج: لو نفس الوزن، هدفك تكرار زيادة عن آخر مرة
  const sameWeight = last && suggested === last.weight;
  const lastReps = last?.sets[0]?.reps ?? min;
  const reps = unit === 'sec' ? min : last ? Math.min(max, Math.max(min, sameWeight ? lastReps + 1 : lastReps)) : min;
  return {
    exerciseId,
    target: { sets: target.sets, reps: target.reps, restSec: target.restSec },
    suggestedWeight: suggested,
    sets: Array.from({ length: target.sets }, () => ({ weight: suggested ?? 0, reps, done: false }))
  };
}

/** التوقف عن التقدم: آخر 3 مرات نفس الوزن وما زادت التكرارات */
export function stalled(history: WorkoutSession[], exerciseId: string, n = 3): boolean {
  const perf = history
    .filter((s) => s.status === 'finished')
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((s) => s.exercises.find((e) => e.exerciseId === exerciseId)?.sets.filter((x) => x.done) ?? [])
    .filter((sets) => sets.length)
    .slice(0, n);
  if (perf.length < n) return false;
  const top = perf.map((sets) => Math.max(...sets.map((x) => x.weight)));
  if (top.some((w) => w !== top[0]) || top[0] === 0) return false;
  const reps = perf.map((sets) => sets.reduce((a, x) => a + x.reps, 0));
  return reps[0] <= reps[n - 1];
}

const clone = (s: WorkoutSession): WorkoutSession => ({ ...s, exercises: s.exercises.map((e) => ({ ...e, sets: e.sets.map((x) => ({ ...x })) })) });

export function updateSet(s: WorkoutSession, ex: number, set: number, patch: Partial<SetLog>): WorkoutSession {
  const next = clone(s);
  Object.assign(next.exercises[ex].sets[set], patch);
  return next;
}

/** أول جولة ما خلصت (بعد الموضع الحالي، ثم من البداية) */
export function nextPosition(s: WorkoutSession, from = s.current): { ex: number; set: number } | null {
  const flat: { ex: number; set: number }[] = [];
  s.exercises.forEach((e, ex) => e.sets.forEach((_, set) => flat.push({ ex, set })));
  const idx = flat.findIndex((p) => p.ex === from.ex && p.set === from.set);
  const ordered = [...flat.slice(idx + 1), ...flat.slice(0, idx + 1)];
  return ordered.find((p) => !s.exercises[p.ex].sets[p.set].done) ?? null;
}

export interface CompleteResult { session: WorkoutSession; restSec: number; exerciseFinished: boolean; allFinished: boolean }

export function completeSet(s: WorkoutSession, ex: number, set: number, feel?: Feel, now = Date.now()): CompleteResult {
  const next = clone(s);
  const e = next.exercises[ex];
  const cur = e.sets[set];
  Object.assign(cur, { done: true, feel, at: now });
  // لو غيّرت الوزن، نطبقه على الجولات الجاية اللي ما خلصت
  e.sets.forEach((x, i) => {
    if (i > set && !x.done) {
      x.weight = cur.weight;
      if (feel === 'hard' && parseReps(e.target.reps).unit === 'reps') x.reps = Math.max(1, Math.min(x.reps, cur.reps));
    }
  });
  const exerciseFinished = e.sets.every((x) => x.done);
  const pos = nextPosition(next, { ex, set });
  if (pos) next.current = pos;
  const allFinished = !pos;
  return { session: next, restSec: exerciseFinished ? Math.min(e.target.restSec + 30, 180) : e.target.restSec, exerciseFinished, allFinished };
}

export function addSet(s: WorkoutSession, ex: number): WorkoutSession {
  const next = clone(s);
  const sets = next.exercises[ex].sets;
  const last = sets[sets.length - 1];
  sets.push({ weight: last?.weight ?? 0, reps: last?.reps ?? 10, done: false });
  return next;
}

export function removeSet(s: WorkoutSession, ex: number): WorkoutSession {
  const next = clone(s);
  const sets = next.exercises[ex].sets;
  const i = sets.map((x) => x.done).lastIndexOf(false);
  if (sets.length > 1 && i >= 0) sets.splice(i, 1);
  return next;
}

export function swapExercise(s: WorkoutSession, ex: number, newId: string, history: WorkoutSession[]): WorkoutSession {
  const next = clone(s);
  const old = next.exercises[ex];
  next.exercises[ex] = { ...buildExercise(newId, old.target, history), swappedFrom: old.swappedFrom ?? old.exerciseId };
  next.exerciseIds = next.exercises.map((e) => e.exerciseId);
  if (next.current.ex === ex) next.current = { ex, set: 0 };
  return next;
}

const best1RM = (sets: SetLog[]) =>
  Math.max(0, ...sets.filter((x) => x.done && x.weight > 0 && x.reps > 0).map((x) => oneRepMax(x.weight, Math.min(x.reps, 12))));

export function summarize(s: WorkoutSession, history: WorkoutSession[], end = s.finishedAt ?? Date.now()): SessionSummary {
  let setsDone = 0, totalSets = 0, reps = 0, volumeKg = 0, exercisesDone = 0;
  const prs: PersonalRecord[] = [];
  const past = history.filter((h) => h.id !== s.id && h.status === 'finished');
  for (const e of s.exercises) {
    const timed = parseReps(e.target.reps).unit === 'sec';
    const done = e.sets.filter((x) => x.done);
    totalSets += e.sets.length;
    setsDone += done.length;
    if (done.length) exercisesDone++;
    if (!timed) {
      reps += done.reduce((a, x) => a + x.reps, 0);
      volumeKg += done.reduce((a, x) => a + x.weight * x.reps, 0);
    }
    const now1 = best1RM(e.sets);
    const prev = Math.max(0, ...past.flatMap((h) => h.exercises.filter((x) => x.exerciseId === e.exerciseId).map((x) => best1RM(x.sets))));
    if (now1 > 0 && prev > 0 && now1 > prev) prs.push({ exerciseId: e.exerciseId, est1RM: now1, previous: prev });
  }
  return { durationMin: Math.max(1, Math.round((end - s.startedAt) / 60000)), setsDone, totalSets, reps, volumeKg: Math.round(volumeKg), exercisesDone, prs };
}

export const sessionProgress = (s: WorkoutSession) => {
  const total = s.exercises.reduce((a, e) => a + e.sets.length, 0);
  const done = s.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
  return total ? done / total : 0;
};
