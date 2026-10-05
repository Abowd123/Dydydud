import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardTitle } from '@/components/ui';
import { oneRepMax } from '@/lib/calculations';
import { useSettings } from '@/store/settings';
import type { Exercise } from '@/types/exercise';
import { useExerciseHistory } from '../lib/useWorkout';
import { usesWeight } from '../lib/session';

export function ExerciseHistory({ exercise }: { exercise: Exercise }) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const sessions = useExerciseHistory(exercise.id);
  if (!sessions.length) return null;
  const rows = sessions.slice(0, 5).map((s) => {
    const sets = s.exercises.find((e) => e.exerciseId === exercise.id)?.sets.filter((x) => x.done) ?? [];
    return { s, sets, best: Math.max(0, ...sets.map((x) => oneRepMax(x.weight, Math.min(x.reps, 12)))) };
  });
  const allBest = Math.max(...rows.map((r) => r.best));
  return (
    <Card>
      <CardTitle className="mb-2 flex items-center gap-2"><History size={18} /> {t('live.yourHistory')}</CardTitle>
      {usesWeight(exercise) && allBest > 0 && <p className="mb-2 text-sm text-muted">{t('live.best1rm')}: <b className="text-accent">{allBest}kg</b></p>}
      <div className="flex flex-col gap-1.5">
        {rows.map(({ s, sets }) => (
          <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted">{new Date(s.startedAt).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</span>
            <span className="font-semibold" dir="ltr">{sets.map((x) => (usesWeight(exercise) ? `${x.weight}×${x.reps}` : x.reps)).join(' • ')}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
