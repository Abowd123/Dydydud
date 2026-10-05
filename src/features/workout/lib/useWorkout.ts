import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/date';
import type { WorkoutDay } from '@/types/program';
import type { WorkoutSession } from '@/types/workout';
import { usePlan } from '@/features/plan/lib/usePlan';
import { createSession } from './session';
import { applyAdjustment, type Adjustment } from './progression';
import { computeStreak } from './streak';

export const useActiveSession = () =>
  useLiveQuery(async () => (await db.sessions.where('status').equals('active').first()) ?? null, []);

export const useHistory = () =>
  useLiveQuery(() => db.sessions.where('status').equals('finished').reverse().sortBy('startedAt'), [], [] as WorkoutSession[]);

export const useExerciseHistory = (exerciseId: string) =>
  useLiveQuery(
    () => db.sessions.where('exerciseIds').equals(exerciseId).filter((s) => s.status === 'finished').reverse().sortBy('startedAt'),
    [exerciseId],
    [] as WorkoutSession[]
  );

export function useStreak() {
  const history = useHistory();
  const { program } = usePlan();
  return computeStreak(history, program);
}

export async function startSession(day: WorkoutDay, skipWarmup: boolean, adjustment?: Adjustment) {
  const active = await db.sessions.where('status').equals('active').first();
  if (active) return active;
  const history = await db.sessions.where('status').equals('finished').toArray();
  let s = createSession(day, history, dateKey());
  if (adjustment) s = applyAdjustment(s, adjustment);
  if (skipWarmup) s.phase = 'main';
  await db.sessions.put(s);
  return s;
}

export const saveSession = (s: WorkoutSession) => db.sessions.put(s);

export async function finishSession(s: WorkoutSession) {
  const done = { ...s, status: 'finished' as const, finishedAt: Date.now() };
  await db.sessions.put(done);
  return done;
}

export async function abandonSession(s: WorkoutSession) {
  const anyDone = s.exercises.some((e) => e.sets.some((x) => x.done));
  if (anyDone) return finishSession(s);
  await db.sessions.delete(s.id);
  return null;
}

export const getFinishedHistory = () => db.sessions.where('status').equals('finished').toArray();
