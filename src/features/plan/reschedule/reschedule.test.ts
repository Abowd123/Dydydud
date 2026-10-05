import { describe, expect, it } from 'vitest';
import type { WeekSlot } from '@/types/program';
import { planWeek, startOfWeek, toKey } from './reschedule';

// أسبوع PPL: السبت Push، الأحد Pull، الاثنين Legs، الثلاثاء راحة، الأربعاء Push، الخميس Pull، الجمعة راحة
const week: WeekSlot[] = [
  { weekday: 0, type: 'train', dayKey: 'pull' },
  { weekday: 1, type: 'train', dayKey: 'legs' },
  { weekday: 2, type: 'rest' },
  { weekday: 3, type: 'train', dayKey: 'push' },
  { weekday: 4, type: 'train', dayKey: 'pull' },
  { weekday: 5, type: 'rest' },
  { weekday: 6, type: 'train', dayKey: 'push' }
];
const P = { week };
// السبت 3 أكتوبر 2026
const sat = new Date(2026, 9, 3);
const day = (n: number) => new Date(2026, 9, 3 + n);

describe('reschedule', () => {
  it('week starts on Saturday', () => {
    expect(toKey(startOfWeek(day(3)))).toBe('2026-10-03');
  });

  it('keeps the plan when nothing was missed', () => {
    const r = planWeek(P, [{ date: '2026-10-03', dayKey: 'push' }], day(1));
    expect(r.moved).toHaveLength(0);
    expect(r.today.dayKey).toBe('pull');
  });

  it('moves a missed workout to today and keeps the order', () => {
    // فاته الأحد (Pull). اليوم الاثنين: يسوي Pull بدل Legs
    const r = planWeek(P, [{ date: '2026-10-03', dayKey: 'push' }], day(2));
    expect(r.today.dayKey).toBe('pull');
    expect(r.today.movedFrom).toBe(0);
    expect(r.moved).toHaveLength(1);
    // Legs تنزل للثلاثاء (يوم راحة) لأننا متأخرين
    expect(r.days[3].dayKey).toBe('legs');
  });

  it('never trains more than 2 days in a row', () => {
    const r = planWeek(P, [{ date: '2026-10-03', dayKey: 'push' }], day(2));
    let run = 0, maxRun = 0;
    for (const d of r.days) { run = d.dayKey ? run + 1 : 0; maxRun = Math.max(maxRun, run); }
    expect(maxRun).toBeLessThanOrEqual(2);
  });

  it('drops what cannot fit this week, gently', () => {
    // ما تمرن من السبت للأربعاء
    const r = planWeek(P, [], day(4));
    expect(r.dropped.length).toBeGreaterThan(0);
    expect(r.today.dayKey).toBe('push');
  });

  it('counts a workout done on another day', () => {
    // سوى Pull يوم السبت بدل Push: Push هو اللي فات
    const r = planWeek(P, [{ date: '2026-10-03', dayKey: 'pull' }], day(1));
    expect(r.today.dayKey).toBe('push');
  });

  it('flags a comeback after a long break', () => {
    const r = planWeek(P, [{ date: '2026-09-15', dayKey: 'legs' }], sat);
    expect(r.comeback).toBe(true);
    expect(r.daysSinceLast).toBe(18);
  });

  it('can be turned off', () => {
    const r = planWeek(P, [{ date: '2026-10-03', dayKey: 'push' }], day(2), 6, false);
    expect(r.today.dayKey).toBe('legs');
    expect(r.moved).toHaveLength(0);
  });
});
