import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { Exercise } from '@/types/exercise';
import { useSettings } from '@/store/settings';
import { ExerciseMedia } from './ExerciseMedia';
import { DifficultyDots } from './DifficultyDots';

interface Props { exercise: Exercise; fav: boolean; onFav: () => void; index?: number }

export function ExerciseCard({ exercise: e, fav, onFav, index = 0 }: Props) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.03 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <Link to={`/exercises/${e.id}`} className="block">
        <ExerciseMedia exercise={e} className="aspect-[4/3]" />
        <div className="p-3">
          <h3 className="line-clamp-1 font-bold">{e.name[lang]}</h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="line-clamp-1 text-xs text-muted">{e.primaryMuscles.map((m) => t(`muscles.${m}`)).join(' • ')}</span>
            <DifficultyDots level={e.difficulty} />
          </div>
        </div>
      </Link>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={onFav}
        aria-label="favorite"
        aria-pressed={fav}
        className="glass absolute end-2 top-2 grid h-9 w-9 place-items-center rounded-full"
      >
        <Heart size={18} className={cn(fav ? 'fill-danger text-danger' : 'text-white')} />
      </motion.button>
    </motion.div>
  );
}
