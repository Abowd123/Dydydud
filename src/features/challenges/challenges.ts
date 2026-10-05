import { addDays, dateKey } from '@/lib/date';
import type { Program } from '@/types/program';

export type ChallengeKind = 'water' | 'workouts' | 'manual';
export interface ChallengeDef { id: string; emoji: string; kind: ChallengeKind; days: number; color: string; dailyTarget?: (day: number) => number; unit?: 'sec' | 'reps' | 'steps' }

export const CHALLENGES: ChallengeDef[] = [
  { id: 'consistency30', emoji: '🔥', kind: 'workouts', days: 30, color: '#E0823F' },
  { id: 'water30', emoji: '💧', kind: 'water', days: 30, color: '#7DB4D6' },
  { id: 'plank30', emoji: '🧱', kind: 'manual', days: 30, color: '#D4AF6A', unit: 'sec', dailyTarget: (d) => 20 + (d - 1) * 4 },
  { id: 'pushups30', emoji: '💪', kind: 'manual', days: 30, color: '#A9B98A', unit: 'reps', dailyTarget: (d) => 5 + (d - 1) },
  { id: 'steps30', emoji: '🚶', kind: 'manual', days: 30, color: '#B49CD6', unit: 'steps', dailyTarget: () => 8000 }
];
export const getChallenge = (id: string) => CHALLENGES.find((c) => c.id === id);

export interface ChallengeState { id: string; startDate: string; manualDone: string[]; status: 'active' | 'completed' | 'quit'; updatedAt: number }

export interface ChallengeData {
  waterByDate: Record<string, number>;
  waterTargetMl: number;
  trainedDates: Set<string>;
  program?: Program;
}

export type DayStatus = 'done' | 'missed' | 'today' | 'future';

/** حالة كل يوم من أيام التحدي */
export function challengeDays(def: ChallengeDef, st: ChallengeState, data: ChallengeData, today = new Date()) {
  const todayKey = dateKey(today);
  const start = new Date(st.startDate + 'T00:00:00');
  const manual = new Set(st.manualDone);
  return Array.from({ length: def.days }, (_, i) => {
    const d = addDays(start, i);
    const key = dateKey(d);
    let done = false;
    if (def.kind === 'manual') done = manual.has(key);
    else if (def.kind === 'water') done = (data.waterByDate[key] ?? 0) >= data.waterTargetMl;
    else {
      // الالتزام: يوم تمرين مجدول لازم تتمرن فيه، والراحة تحسب تلقائياً
      const slot = data.program?.week.find((w) => w.weekday === d.getDay());
      done = data.trainedDates.has(key) || (slot?.type !== 'train' && key < todayKey);
    }
    const status: DayStatus = done ? 'done' : key > todayKey ? 'future' : key === todayKey ? 'today' : 'missed';
    return { day: i + 1, date: key, status, target: def.dailyTarget?.(i + 1) };
  });
}

export function challengeSummary(def: ChallengeDef, st: ChallengeState, data: ChallengeData, today = new Date()) {
  const days = challengeDays(def, st, data, today);
  const done = days.filter((d) => d.status === 'done').length;
  const missed = days.filter((d) => d.status === 'missed').length;
  const todayItem = days.find((d) => d.date === dateKey(today));
  return { days, done, missed, progress: done / def.days, completed: done >= def.days, today: todayItem, ended: days[days.length - 1].date < dateKey(today) };
}

export const toggleManual = (st: ChallengeState, date: string): ChallengeState => ({
  ...st,
  manualDone: st.manualDone.includes(date) ? st.manualDone.filter((d) => d !== date) : [...st.manualDone, date],
  updatedAt: Date.now()
});
