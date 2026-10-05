import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { WorkoutDay } from '@/types/program';
import { getExercise } from '@/features/exercises/lib/repository';
import { ExerciseMedia } from '@/features/exercises/components/ExerciseMedia';
import { useSettings } from '@/store/settings';

export function WorkoutDayList({ day }: { day: WorkoutDay }) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const Fwd = lang === 'ar' ? ChevronLeft : ChevronRight;
  return (
    <div className="flex flex-col gap-2">
      {day.exercises.map((x, i) => {
        const e = getExercise(x.exerciseId);
        if (!e) return null;
        return (
          <motion.div key={x.exerciseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={`/exercises/${e.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 transition-colors hover:bg-elevated">
              <span className="w-5 text-center text-sm font-extrabold text-muted">{i + 1}</span>
              <ExerciseMedia exercise={e} className="h-14 w-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{e.name[lang]}</p>
                <p className="text-xs text-muted">
                  <span className="font-bold text-primary">{x.sets} × {x.reps}</span> • {t('schedule.rest', { s: x.restSec })}
                </p>
              </div>
              <Fwd size={18} className="text-muted" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
