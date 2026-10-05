import type { Program } from '@/types/program';
import type { WorkoutSession } from '@/types/workout';
import { addDays, dateKey } from '@/lib/date';

/**
 * السلسلة = عدد الحصص المكتملة على التوالي بدون ما تفوّت يوم تمرين مجدول.
 * أيام الراحة والكارديو ما تكسر السلسلة. اليوم الحالي ما يكسرها لو لسه ما تمرنت.
 */
export function computeStreak(sessions: WorkoutSession[], program: Program | undefined, today = new Date()): number {
  const finishedDates = new Set(sessions.filter((s) => s.status === 'finished').map((s) => s.date));
  if (!program) return 0;
  const firstDate = [...finishedDates].sort()[0];
  if (!firstDate) return 0;
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = addDays(today, -i);
    const key = dateKey(d);
    if (key < firstDate) break;
    const slot = program.week.find((w) => w.weekday === d.getDay());
    const trained = finishedDates.has(key);
    if (trained) streak++;
    else if (slot?.type === 'train' && i > 0) break;
  }
  return streak;
}
