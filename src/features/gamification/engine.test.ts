import { describe, expect, it } from 'vitest';
import type { WorkoutDay } from '@/types/program';
import type { WorkoutSession } from '@/types/workout';
import { createSession } from '@/features/workout/lib/session';
import { computeBadges, computeXP, levelFromXP, newlyUnlocked, titleFor, xpForLevel, type GameInput } from './engine';

const day: WorkoutDay = { key: 'fullBodyA', focus: ['quads'], estimatedMinutes: 40, exercises: [{ exerciseId: 'back-squat', sets: 2, reps: '6-10', restSec: 90 }] };
const fin = (w: number, t: number): WorkoutSession => {
  const s = createSession(day, [], '2026-12-01', t);
  s.exercises[0].sets = [{ weight: w, reps: 8, done: true }, { weight: w, reps: 8, done: true }];
  return { ...s, status: 'finished' };
};
const base: GameInput = { sessions: [], mealPlans: [], waterByDate: {}, waterTargetMl: 2500, metricsCount: 0, photosCount: 0, streak: 0, challengesCompleted: 0 };

describe('gamification', () => {
  it('XP from workouts, sets and PRs', () => {
    const x = computeXP({ ...base, sessions: [fin(60, 1), fin(70, 2)] });
    expect(x.prs).toBe(1);
    expect(x.total).toBe(2 * 100 + 4 * 2 + 50);
  });
  it('water goal days', () => {
    expect(computeXP({ ...base, waterByDate: { a: 2600, b: 1000 } }).waterDays).toBe(1);
  });
  it('levels curve', () => {
    expect(xpForLevel(2)).toBe(100);
    expect(levelFromXP(0).level).toBe(1);
    expect(levelFromXP(99).level).toBe(1);
    expect(levelFromXP(100).level).toBe(2);
    expect(levelFromXP(450)).toEqual({ level: 3, current: 150, needed: 300, progress: 0.5 });
  });
  it('titles', () => {
    expect(titleFor(1)).toBe('rookie');
    expect(titleFor(4)).toBe('starter');
    expect(titleFor(40)).toBe('legend');
  });
  it('badges unlock and report progress', () => {
    const b = computeBadges({ ...base, sessions: [fin(60, 1)], streak: 3 });
    expect(b.find((x) => x.id === 'firstWorkout')!.unlocked).toBe(true);
    expect(b.find((x) => x.id === 'streak3')!.unlocked).toBe(true);
    const w10 = b.find((x) => x.id === 'workouts10')!;
    expect([w10.value, w10.target, w10.unlocked]).toEqual([1, 10, false]);
  });
  it('newly unlocked diff', () => {
    const before = computeBadges(base);
    const after = computeBadges({ ...base, sessions: [fin(60, 1)] });
    expect(newlyUnlocked(before, after).map((b) => b.id)).toEqual(['firstWorkout']);
  });
});
