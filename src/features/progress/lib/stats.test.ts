import { describe, expect, it } from 'vitest';
import type { WorkoutSession } from '@/types/workout';
import { consistencyGrid, movingAverage, strengthSeries, totals, trackedExercises, weeklyTrend, weeklyVolume, weekStart } from './stats';

const session = (date: string, weight: number, reps = 10, id = date): WorkoutSession => ({
  id, date, dayKey: 'fullBodyA', status: 'finished', phase: 'main', startedAt: Date.parse(date), finishedAt: Date.parse(date) + 3_600_000,
  current: { ex: 0, set: 0 }, exerciseIds: ['back-squat'],
  exercises: [{ exerciseId: 'back-squat', target: { sets: 2, reps: '6-10', restSec: 90 }, suggestedWeight: null, sets: [{ weight, reps, done: true }, { weight, reps, done: true }] }]
});

describe('progress stats', () => {
  it('7-day moving average', () => {
    const r = movingAverage([{ date: '2026-12-01', value: 80 }, { date: '2026-12-02', value: 82 }, { date: '2026-12-10', value: 79 }]);
    expect(r[1].avg).toBe(81);
    expect(r[2].avg).toBe(79);
  });
  it('weekly trend (-0.5 kg/week)', () => {
    const pts = Array.from({ length: 5 }, (_, i) => ({ date: `2026-12-${String(1 + i * 7).padStart(2, '0')}`, value: 80 - i * 0.5 }));
    expect(weeklyTrend(pts)).toBe(-0.5);
    expect(weeklyTrend([pts[0]])).toBeNull();
  });
  it('week starts on Saturday', () => {
    expect(weekStart(new Date(2026, 11, 16))).toBe('2026-12-12'); // Wed -> Sat
    expect(weekStart(new Date(2026, 11, 12))).toBe('2026-12-12');
  });
  it('weekly volume buckets', () => {
    const w = weeklyVolume([session('2026-12-13', 50), session('2026-12-15', 60)], 2, new Date(2026, 11, 16));
    expect(w).toHaveLength(2);
    expect(w[1]).toEqual({ week: '2026-12-12', volume: 2200, workouts: 2 });
  });
  it('strength series sorted by time', () => {
    const s = strengthSeries([session('2026-12-15', 60), session('2026-12-13', 50)], 'back-squat');
    expect(s.map((x) => x.date)).toEqual(['2026-12-13', '2026-12-15']);
    expect(s[1].est1RM).toBe(80);
  });
  it('tracked exercises and totals', () => {
    const all = [session('2026-12-13', 50), session('2026-12-15', 60)];
    expect(trackedExercises(all)).toEqual(['back-squat']);
    expect(totals(all)).toEqual({ workouts: 2, volumeKg: 2200, minutes: 120 });
  });
  it('consistency grid 12x7', () => {
    const g = consistencyGrid([session('2026-12-13', 50)], 12, new Date(2026, 11, 16));
    expect(g).toHaveLength(12);
    expect(g.flat().find((c) => c.date === '2026-12-13')!.trained).toBe(true);
    expect(g[11][6].future).toBe(true);
  });
});
