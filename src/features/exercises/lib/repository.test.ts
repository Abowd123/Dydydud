import { describe, expect, it } from 'vitest';
import { exercises, filterExercises, getExercise } from './repository';

describe('exercise repository', () => {
  it('has 151 exercises with unique ids', () => {
    expect(exercises).toHaveLength(151);
    expect(new Set(exercises.map((e) => e.id)).size).toBe(151);
  });
  it('every alternative points to a real exercise', () => {
    exercises.forEach((e) => e.alternatives.forEach((a) => expect(getExercise(a)).toBeDefined()));
  });
  it('searches Arabic ignoring hamza/taa marbuta', () => {
    expect(filterExercises(exercises, { query: 'سكوات' }).length).toBeGreaterThan(0);
    expect(filterExercises(exercises, { query: 'اكتاف' }).length).toBeGreaterThan(0);
  });
  it('searches English', () => {
    expect(filterExercises(exercises, { query: 'bench' }).map((e) => e.id)).toContain('barbell-bench-press');
  });
  it('filters by muscle and sorts primary first', () => {
    const r = filterExercises(exercises, { muscle: 'triceps' });
    expect(r[0].primaryMuscles).toContain('triceps');
    expect(r.every((e) => [...e.primaryMuscles, ...e.secondaryMuscles].includes('triceps'))).toBe(true);
  });
  it('filters by equipment', () => {
    expect(filterExercises(exercises, { equipment: 'bodyweight' }).every((e) => e.equipment === 'bodyweight')).toBe(true);
  });
});
