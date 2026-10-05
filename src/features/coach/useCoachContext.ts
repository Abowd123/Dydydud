import { useTranslation } from 'react-i18next';
import { useSettings } from '@/store/settings';
import { usePlan, todayWeekday } from '@/features/plan/lib/usePlan';
import { useHistory } from '@/features/workout/lib/useWorkout';
import { useTodayCheckin } from '@/features/workout/lib/useCheckin';
import { summarize } from '@/features/workout/lib/session';
import { getExercise } from '@/features/exercises/lib/repository';
import type { CoachContext } from '../../../supabase/functions/_shared/coach';

/** السياق اللي يشوفه المدرب: بياناتك وتمرين اليوم وآخر الحصص */
export function useCoachContext(): CoachContext {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const ramadan = useSettings((s) => s.ramadan);
  const { profile, program, targets } = usePlan();
  const history = useHistory();
  const checkin = useTodayCheckin();
  const slot = program?.week.find((w) => w.weekday === todayWeekday());
  const day = slot?.type === 'train' ? program?.days[slot.dayKey] : undefined;
  return {
    lang,
    ramadan,
    readiness: checkin?.score ?? null,
    profile: profile && {
      gender: profile.gender, age: profile.age, heightCm: profile.heightCm, weightKg: profile.weightKg, goal: profile.goal, level: profile.level,
      equipment: profile.equipment, injuries: profile.injuries, diet: profile.diet, trainingDays: profile.trainingDays.length
    },
    targets: targets && { calories: targets.calories, proteinG: targets.proteinG, carbsG: targets.carbsG, fatG: targets.fatG, waterMl: targets.waterMl },
    today: day ? `${t(`days.${day.key}`)}: ${day.exercises.map((x) => `${getExercise(x.exerciseId)?.name[lang]} ${x.sets}x${x.reps}`).join(', ')}` : slot?.type,
    recent: history.slice(0, 5).map((s) => {
      const sum = summarize(s, history);
      return `${s.date} ${t(`days.${s.dayKey}`)} ${sum.volumeKg}kg ${sum.setsDone}/${sum.totalSets} sets${sum.prs.length ? ` ${sum.prs.length} PR` : ''}`;
    })
  };
}
