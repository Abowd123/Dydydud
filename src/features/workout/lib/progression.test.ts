import { describe, expect, it } from 'vitest';
import type { WorkoutDay } from '@/types/program';
import type { WorkoutSession } from '@/types/workout';
import { createSession } from './session';
import { adjustmentFor, applyAdjustment, detectStall, isDeloadWeek, nextReps, programWeek, readinessLevel, readinessScore } from './progression';

const day: WorkoutDay = { key: 'fullBodyA', focus: ['quads'], estimatedMinutes: 40, exercises: [{ exerciseId: 'back-squat', sets: 4, reps: '6-10', restSec: 120 }] };
const fin = (w: number, reps: number[], t: number): WorkoutSession => {
  const s = createSession(day, [], '2026-12-01', t);
  s.exercises[0].sets = reps.map((r) => ({ weight: w, reps: r, done: true }));
  return { ...s, status: 'finished' };
};

describe('readiness', () => {
  it('scores 0..100', () => {
    expect(readinessScore({ sleepH: 8, energy: 5, soreness: 1 })).toBe(100);
    expect(readinessScore({ sleepH: 4, energy: 1, soreness: 5 })).toBe(0);
    expect(readinessScore({ sleepH: 6, energy: 3, soreness: 3 })).toBe(50);
  });
  it('levels', () => {
    expect(readinessLevel(80)).toBe('high');
    expect(readinessLevel(55)).toBe('normal');
    expect(readinessLevel(35)).toBe('low');
    expect(readinessLevel(10)).toBe('veryLow');
  });
  it('low readiness cuts a set and 5% weight (rounded to plates)', () => {
    let s = createSession(day, [], '2026-12-02');
    s = { ...s, exercises: s.exercises.map((e) => ({ ...e, suggestedWeight: 100, sets: e.sets.map((x) => ({ ...x, weight: 100 })) })) };
    const a = applyAdjustment(s, adjustmentFor('low', false));
    expect(a.exercises[0].sets).toHaveLength(3);
    expect(a.exercises[0].sets[0].weight).toBe(95);
    expect(a.exercises[0].suggestedWeight).toBe(95);
  });
  it('never goes below 2 sets', () => {
    const s = createSession({ ...day, exercises: [{ ...day.exercises[0], sets: 2 }] }, [], '2026-12-02');
    expect(applyAdjustment(s, adjustmentFor('veryLow', false)).exercises[0].sets).toHaveLength(2);
  });
  it('high readiness changes nothing', () => {
    const s = createSession(day, [], '2026-12-02');
    expect(applyAdjustment(s, adjustmentFor('high', false))).toBe(s);
  });
});

describe('deload & plateau', () => {
  it('program week & deload every 7 weeks', () => {
    expect(programWeek(0, 6 * 86400000)).toBe(1);
    expect(programWeek(0, 7 * 86400000)).toBe(2);
    expect(isDeloadWeek(7)).toBe(true);
    expect(isDeloadWeek(6)).toBe(false);
    expect(adjustmentFor('high', true).reason).toBe('deload');
  });
  it('detects stall after 3 identical sessions', () => {
    expect(detectStall([fin(80, [8, 8, 7], 1), fin(80, [8, 8, 7], 2), fin(80, [8, 7, 7], 3)], 'back-squat')).toBe(true);
  });
  it('no stall when reps improve or weight changes', () => {
    expect(detectStall([fin(80, [7, 7, 7], 1), fin(80, [8, 8, 7], 2), fin(80, [9, 8, 8], 3)], 'back-squat')).toBe(false);
    expect(detectStall([fin(75, [8, 8, 8], 1), fin(80, [8, 8, 8], 2), fin(80, [8, 8, 8], 3)], 'back-squat')).toBe(false);
    expect(detectStall([fin(80, [8, 8, 8], 1)], 'back-squat')).toBe(false);
  });
  it('double progression reps', () => {
    expect(nextReps(7, 6, 10)).toBe(8);
    expect(nextReps(10, 6, 10)).toBe(10);
    expect(nextReps(3, 6, 10)).toBe(6);
  });
});
