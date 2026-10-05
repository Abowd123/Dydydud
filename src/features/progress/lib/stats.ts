import type { WorkoutSession } from '@/types/workout';
import { oneRepMax } from '@/lib/calculations';
import { addDays, dateKey } from '@/lib/date';

export interface BodyMetric {
  date: string; // YYYY-MM-DD (مفتاح)
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  hipCm?: number;
  neckCm?: number;
  updatedAt: number;
}

/** متوسط متحرك (أيام) يخفف تذبذب الوزن اليومي (ماء، ملح...) */
export function movingAverage(points: { date: string; value: number }[], days = 7) {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((p) => {
    const from = dateKey(addDays(new Date(p.date + 'T00:00:00'), -(days - 1)));
    const win = sorted.filter((x) => x.date >= from && x.date <= p.date);
    return { ...p, avg: Math.round((win.reduce((s, x) => s + x.value, 0) / win.length) * 10) / 10 };
  });
}

/** معدل التغير بالأسبوع (انحدار خطي بسيط) */
export function weeklyTrend(points: { date: string; value: number }[]): number | null {
  if (points.length < 2) return null;
  const t0 = Date.parse(points[0].date);
  const xs = points.map((p) => (Date.parse(p.date) - t0) / 86400000);
  const ys = points.map((p) => p.value);
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  if (den === 0) return null;
  const slope = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / den;
  return Math.round(slope * 7 * 100) / 100;
}

/** بداية الأسبوع (السبت) */
export function weekStart(d: Date, startDay = 6) {
  const diff = (d.getDay() - startDay + 7) % 7;
  return dateKey(addDays(d, -diff));
}

const volumeOf = (s: WorkoutSession) =>
  s.exercises.reduce((v, e) => v + e.sets.filter((x) => x.done && !/ث|sec/.test(e.target.reps)).reduce((a, x) => a + x.weight * x.reps, 0), 0);

/** الحجم وعدد الحصص لكل أسبوع (آخر N أسابيع) */
export function weeklyVolume(sessions: WorkoutSession[], weeks = 8, today = new Date()) {
  const keys = Array.from({ length: weeks }, (_, i) => weekStart(addDays(today, -7 * (weeks - 1 - i))));
  const map = new Map(keys.map((k) => [k, { week: k, volume: 0, workouts: 0 }]));
  for (const s of sessions) {
    if (s.status !== 'finished') continue;
    const k = weekStart(new Date(s.date + 'T00:00:00'));
    const row = map.get(k);
    if (row) { row.volume += Math.round(volumeOf(s)); row.workouts++; }
  }
  return [...map.values()];
}

/** تطور 1RM التقديري لتمرين مع الوقت */
export function strengthSeries(sessions: WorkoutSession[], exerciseId: string) {
  return sessions
    .filter((s) => s.status === 'finished')
    .flatMap((s) => {
      const e = s.exercises.find((x) => x.exerciseId === exerciseId);
      const best = Math.max(0, ...(e?.sets.filter((x) => x.done && x.weight > 0).map((x) => oneRepMax(x.weight, Math.min(x.reps, 12))) ?? []));
      return best > 0 ? [{ date: s.date, est1RM: best, at: s.startedAt }] : [];
    })
    .sort((a, b) => a.at - b.at);
}

/** التمارين اللي لها سجل بأوزان، مرتبة بعدد المرات */
export function trackedExercises(sessions: WorkoutSession[]) {
  const count = new Map<string, number>();
  for (const s of sessions) if (s.status === 'finished')
    for (const e of s.exercises) if (e.sets.some((x) => x.done && x.weight > 0)) count.set(e.exerciseId, (count.get(e.exerciseId) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** خريطة الالتزام: آخر N أسبوع × 7 أيام */
export function consistencyGrid(sessions: WorkoutSession[], weeks = 12, today = new Date()) {
  const done = new Set(sessions.filter((s) => s.status === 'finished').map((s) => s.date));
  const start = addDays(new Date(weekStart(today) + 'T00:00:00'), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = addDays(start, w * 7 + d);
      const key = dateKey(day);
      return { date: key, trained: done.has(key), future: day > today };
    })
  );
}

export function totals(sessions: WorkoutSession[]) {
  const fin = sessions.filter((s) => s.status === 'finished');
  return {
    workouts: fin.length,
    volumeKg: Math.round(fin.reduce((v, s) => v + volumeOf(s), 0)),
    minutes: Math.round(fin.reduce((m, s) => m + ((s.finishedAt ?? s.startedAt) - s.startedAt) / 60000, 0))
  };
}
