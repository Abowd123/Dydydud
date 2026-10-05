import { describe, expect, it } from 'vitest';
import { getExercise } from '@/features/exercises/lib/repository';
import type { WorkoutDay } from '@/types/program';
import type { WorkoutSession } from '@/types/workout';
import { addSet, completeSet, createSession, nextPosition, parseReps, removeSet, sessionProgress, suggestWeight, summarize, swapExercise, updateSet } from './session';
import { computeStreak } from './streak';
import { generateProgram } from '@/features/plan/engine/engine';

const day: WorkoutDay = {
  key: 'fullBodyA', focus: ['quads'], estimatedMinutes: 40,
  exercises: [
    { exerciseId: 'back-squat', sets: 3, reps: '6-10', restSec: 120 },
    { exerciseId: 'plank', sets: 2, reps: '30-60 ث', restSec: 45 }
  ]
};

function finished(weight: number, reps: number[], feel?: 'hard', date = '2026-11-01', startedAt = 1): WorkoutSession {
  const s = createSession(day, [], date, startedAt);
  s.exercises[0].sets = reps.map((r) => ({ weight, reps: r, done: true, feel }));
  return { ...s, status: 'finished', finishedAt: startedAt + 3_000_000 };
}

describe('parseReps', () => {
  it('parses ranges, time and per-side', () => {
    expect(parseReps('6-10')).toEqual({ min: 6, max: 10, unit: 'reps', perSide: false });
    expect(parseReps('30-60 ث')).toEqual({ min: 30, max: 60, unit: 'sec', perSide: false });
    expect(parseReps('10/رجل')).toEqual({ min: 10, max: 10, unit: 'reps', perSide: true });
  });
});

describe('suggestWeight (progressive overload)', () => {
  const squat = getExercise('back-squat')!;
  it('null on first time', () => expect(suggestWeight(squat, '6-10', 3, [])).toBeNull());
  it('adds 2.5kg when all sets hit top reps', () => expect(suggestWeight(squat, '6-10', 3, [finished(60, [10, 10, 10])])).toBe(62.5));
  it('keeps weight when in range', () => expect(suggestWeight(squat, '6-10', 3, [finished(60, [10, 8, 7])])).toBe(60));
  it('keeps weight if top reps but felt hard', () => expect(suggestWeight(squat, '6-10', 3, [finished(60, [10, 10, 10], 'hard')])).toBe(60));
  it('drops weight when most sets failed', () => expect(suggestWeight(squat, '6-10', 3, [finished(60, [5, 4, 6])])).toBe(57.5));
  it('uses the most recent session', () => {
    const old = finished(50, [10, 10, 10], undefined, '2026-10-01', 1);
    const recent = finished(70, [8, 8, 8], undefined, '2026-11-01', 2);
    expect(suggestWeight(squat, '6-10', 3, [old, recent])).toBe(70);
  });
});

describe('session flow', () => {
  it('creates sets prefilled with suggestion', () => {
    const s = createSession(day, [finished(60, [10, 10, 10])], '2026-11-03');
    expect(s.exercises[0].sets).toHaveLength(3);
    expect(s.exercises[0].sets[0].weight).toBe(62.5);
    expect(s.exercises[1].sets[0].reps).toBe(30);
  });

  it('completes sets, propagates weight and advances', () => {
    let s = createSession(day, [], '2026-11-03');
    s = updateSet(s, 0, 0, { weight: 40, reps: 8 });
    const r = completeSet(s, 0, 0, 'good');
    expect(r.session.exercises[0].sets[1].weight).toBe(40);
    expect(r.session.current).toEqual({ ex: 0, set: 1 });
    expect(r.restSec).toBe(120);
    expect(r.allFinished).toBe(false);
  });

  it('finishes the whole workout', () => {
    let s = createSession(day, [], '2026-11-03');
    let last;
    for (let ex = 0; ex < 2; ex++) for (let set = 0; set < s.exercises[ex].sets.length; set++) {
      last = completeSet(s, ex, set);
      s = last.session;
    }
    expect(last!.allFinished).toBe(true);
    expect(nextPosition(s)).toBeNull();
    expect(sessionProgress(s)).toBe(1);
  });

  it('add / remove sets', () => {
    let s = createSession(day, [], '2026-11-03');
    s = addSet(s, 0);
    expect(s.exercises[0].sets).toHaveLength(4);
    s = removeSet(removeSet(s, 0), 0);
    expect(s.exercises[0].sets).toHaveLength(2);
  });

  it('swaps an exercise and keeps the target', () => {
    const s = swapExercise(createSession(day, [], '2026-11-03'), 0, 'leg-press', []);
    expect(s.exercises[0].exerciseId).toBe('leg-press');
    expect(s.exercises[0].swappedFrom).toBe('back-squat');
    expect(s.exerciseIds[0]).toBe('leg-press');
  });

  it('summary: volume, duration and PRs', () => {
    const prev = finished(60, [8, 8, 8]);
    let s = createSession(day, [prev], '2026-11-03', 10_000_000);
    s = updateSet(s, 0, 0, { weight: 70, reps: 8 });
    s = completeSet(s, 0, 0).session;
    const sum = summarize({ ...s, finishedAt: 10_000_000 + 45 * 60000 }, [prev]);
    expect(sum.durationMin).toBe(45);
    expect(sum.volumeKg).toBe(560);
    expect(sum.setsDone).toBe(1);
    expect(sum.prs.map((p) => p.exerciseId)).toEqual(['back-squat']);
  });
});

describe('streak', () => {
  const program = generateProgram({ goal: 'bulk', level: 'beginner', equipment: 'gym', injuries: [], trainingDays: [0, 2, 4], sessionMinutes: 60 });
  const done = (date: string): WorkoutSession => ({ ...createSession(day, [], date), status: 'finished' });
  // 2026-11-01 = Sunday(0), 11-03 = Tue(2), 11-05 = Thu(4)
  it('counts consecutive scheduled workouts', () => {
    expect(computeStreak([done('2026-11-01'), done('2026-11-03'), done('2026-11-05')], program, new Date(2026, 10, 6))).toBe(3);
  });
  it('breaks on a missed training day', () => {
    expect(computeStreak([done('2026-11-01'), done('2026-11-05')], program, new Date(2026, 10, 6))).toBe(1);
  });
  it('today not trained yet does not break it', () => {
    expect(computeStreak([done('2026-11-01'), done('2026-11-03')], program, new Date(2026, 10, 5))).toBe(2);
  });
  it('zero with no sessions', () => expect(computeStreak([], program)).toBe(0));
});
