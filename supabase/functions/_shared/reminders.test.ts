import { describe, expect, it } from 'vitest';
import { dueReminders, localParts, type ReminderPrefs } from './reminders';

const base: ReminderPrefs = { tz: 'Asia/Riyadh', lang: 'ar', workout_time: '18:30', training_days: [0, 2, 4], water_interval_h: 2, water_start: 9, water_end: 21, last_sent: {} };
// 2026-12-13 الأحد. الرياض UTC+3
const at = (iso: string) => new Date(iso);

describe('reminders', () => {
  it('converts to local time', () => {
    expect(localParts(at('2026-12-13T15:35:00Z'), 'Asia/Riyadh')).toEqual({ date: '2026-12-13', hour: 18, minute: 35, weekday: 0 });
  });
  it('sends workout reminder on a training day inside the window', () => {
    const r = dueReminders(base, at('2026-12-13T15:35:00Z'));
    expect(r.map((x) => x.kind)).toContain('workout');
  });
  it('not on rest days', () => {
    expect(dueReminders(base, at('2026-12-14T15:35:00Z')).some((x) => x.kind === 'workout')).toBe(false);
  });
  it('not twice the same day', () => {
    expect(dueReminders({ ...base, last_sent: { workout: '2026-12-13' } }, at('2026-12-13T15:40:00Z')).some((x) => x.kind === 'workout')).toBe(false);
  });
  it('water every 2h from 9 to 21', () => {
    expect(dueReminders(base, at('2026-12-14T08:05:00Z')).map((x) => x.key)).toEqual(['2026-12-14T11']); // 11:05 local
    expect(dueReminders(base, at('2026-12-14T09:05:00Z'))).toHaveLength(0); // 12:05 local
    expect(dueReminders(base, at('2026-12-14T19:05:00Z'))).toHaveLength(0); // 22:05 local
  });
  it('english text', () => {
    expect(dueReminders({ ...base, lang: 'en' }, at('2026-12-13T15:35:00Z'))[0].title).toContain('Workout');
  });
});
