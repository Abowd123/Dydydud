import { useMemo } from 'react';
import { usePlan } from '@/features/plan/lib/usePlan';
import { useHistory } from '@/features/workout/lib/useWorkout';
import { useSettings } from '@/store/settings';
import { planWeek, type WeekPlan } from './reschedule';

/** الأسبوع الفعلي بعد إعادة الجدولة (أو الأصلي لو المستخدم طفّاها) */
export function useWeekPlan(now = new Date()): WeekPlan | undefined {
  const { program } = usePlan();
  const history = useHistory();
  const enabled = useSettings((s) => s.smartReschedule);
  const today = now.toDateString();
  return useMemo(() => {
    if (!program) return undefined;
    const done = (history ?? []).map((h) => ({ date: h.date, dayKey: h.dayKey }));
    return planWeek(program, done, new Date(), 6, enabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, history, enabled, today]);
}
