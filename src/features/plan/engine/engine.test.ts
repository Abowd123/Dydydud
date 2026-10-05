import { describe, expect, it } from 'vitest';
import { getExercise } from '@/features/exercises/lib/repository';
import { CONTRAINDICATED } from './templates';
import { EQUIPMENT_ACCESS, generateProgram } from './engine';
import type { Profile } from '@/types/profile';

const base: Pick<Profile, 'goal' | 'level' | 'equipment' | 'injuries' | 'trainingDays' | 'sessionMinutes'> = {
  goal: 'bulk', level: 'beginner', equipment: 'gym', injuries: [], trainingDays: [0, 2, 4], sessionMinutes: 60
};

describe('plan engine', () => {
  it('picks split by number of days', () => {
    expect(generateProgram({ ...base, trainingDays: [0, 3] }).split).toBe('fullBody');
    expect(generateProgram(base).split).toBe('fullBody');
    expect(generateProgram({ ...base, trainingDays: [0, 1, 3, 4] }).split).toBe('upperLower');
    expect(generateProgram({ ...base, trainingDays: [0, 1, 2, 3, 4] }).split).toBe('pplUl');
    expect(generateProgram({ ...base, trainingDays: [0, 1, 2, 3, 4, 5] }).split).toBe('ppl');
  });

  it('week has 7 slots and exact training days', () => {
    const p = generateProgram({ ...base, trainingDays: [6, 1, 3] });
    expect(p.week).toHaveLength(7);
    expect(p.week.filter((w) => w.type === 'train').map((w) => w.weekday)).toEqual([1, 3, 6]);
  });

  it('alternates full body A/B', () => {
    const p = generateProgram(base);
    const keys = p.week.flatMap((w) => (w.type === 'train' ? [w.dayKey] : []));
    expect(keys).toEqual(['fullBodyA', 'fullBodyB', 'fullBodyA']);
  });

  it.each(['gym', 'dumbbells', 'home'] as const)('respects equipment: %s', (equipment) => {
    const p = generateProgram({ ...base, equipment, trainingDays: [0, 1, 3, 4] });
    Object.values(p.days).forEach((d) => {
      expect(d!.exercises.length).toBeGreaterThanOrEqual(3);
      d!.exercises.forEach((x) => expect(EQUIPMENT_ACCESS[equipment]).toContain(getExercise(x.exerciseId)!.equipment));
    });
  });

  it('never includes contraindicated exercises', () => {
    const p = generateProgram({ ...base, injuries: ['knee', 'back', 'shoulder'], trainingDays: [0, 1, 2, 3, 4, 5] });
    const banned = new Set(Object.values(CONTRAINDICATED).flat());
    Object.values(p.days).forEach((d) => d!.exercises.forEach((x) => expect(banned.has(x.exerciseId)).toBe(false)));
  });

  it('no duplicate exercise inside a day', () => {
    const p = generateProgram({ ...base, trainingDays: [0, 1, 2, 3, 4] });
    Object.values(p.days).forEach((d) => {
      const ids = d!.exercises.map((x) => x.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('respects session length', () => {
    const p = generateProgram({ ...base, sessionMinutes: 45 });
    Object.values(p.days).forEach((d) => expect(d!.exercises.length).toBeLessThanOrEqual(5));
  });

  it('strength goal uses low reps on compounds', () => {
    const p = generateProgram({ ...base, goal: 'strength' });
    expect(p.days.fullBodyA!.exercises[0].reps).toBe('4-6');
  });

  it('cut goal adds cardio but keeps at least one full rest day', () => {
    const p = generateProgram({ ...base, goal: 'cut' });
    expect(p.week.some((w) => w.type === 'cardio')).toBe(true);
    expect(p.week.some((w) => w.type === 'rest')).toBe(true);
  });

  it('rejects invalid day counts', () => {
    expect(() => generateProgram({ ...base, trainingDays: [1] })).toThrow();
  });
});
