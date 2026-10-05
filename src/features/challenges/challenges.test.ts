import { describe, expect, it } from 'vitest';
import { generateProgram } from '@/features/plan/engine/engine';
import { challengeSummary, getChallenge, toggleManual, type ChallengeState } from './challenges';

const program = generateProgram({ goal: 'fitness', level: 'beginner', equipment: 'gym', injuries: [], trainingDays: [0, 2, 4], sessionMinutes: 60 });
const st = (id: string, manual: string[] = []): ChallengeState => ({ id, startDate: '2026-12-13', manualDone: manual, status: 'active', updatedAt: 0 });
const data = { waterByDate: { '2026-12-13': 3000, '2026-12-14': 1000 }, waterTargetMl: 2800, trainedDates: new Set(['2026-12-13']), program };
const today = new Date(2026, 11, 15); // الثلاثاء

describe('30-day challenges', () => {
  it('water: counts goal days and misses', () => {
    const s = challengeSummary(getChallenge('water30')!, st('water30'), data, today);
    expect(s.done).toBe(1);
    expect(s.missed).toBe(1);
    expect(s.today?.status).toBe('today');
    expect(s.days).toHaveLength(30);
  });
  it('consistency: rest days count, training days need a workout', () => {
    // 13 الأحد تمرين ✓، 14 الاثنين راحة ✓، 15 الثلاثاء اليوم (تمرين، لسه)
    const s = challengeSummary(getChallenge('consistency30')!, st('consistency30'), data, today);
    expect(s.done).toBe(2);
    expect(s.today?.status).toBe('today');
  });
  it('manual with growing daily target', () => {
    const def = getChallenge('plank30')!;
    let state = st('plank30');
    state = toggleManual(state, '2026-12-13');
    const s = challengeSummary(def, state, data, today);
    expect(s.done).toBe(1);
    expect(s.days[0].target).toBe(20);
    expect(s.days[29].target).toBe(136);
    expect(toggleManual(state, '2026-12-13').manualDone).toEqual([]);
  });
  it('completes after 30 days', () => {
    const all = Array.from({ length: 30 }, (_, i) => { const d = new Date(2026, 11, 13 + i); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
    expect(challengeSummary(getChallenge('pushups30')!, st('pushups30', all), data, new Date(2027, 0, 20)).completed).toBe(true);
  });
});
