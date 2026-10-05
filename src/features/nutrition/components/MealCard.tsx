import { AnimatePresence, motion } from 'framer-motion';
import { Check, Coffee, Cookie, Moon, MoonStar, RefreshCw, Sun, Sunrise, Sunset } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import type { Meal, MealType } from '@/types/nutrition';
import { formatServing, itemMacros, mealMacros, roundMacros } from '../lib/foods';
import { getMealFoods } from '../lib/generator';

const ICONS: Record<MealType, typeof Sun> = { breakfast: Coffee, lunch: Sun, snack: Cookie, dinner: Moon, iftar: Sunset, lateSnack: MoonStar, suhoor: Sunrise };
const COLORS: Record<MealType, string> = { breakfast: '#E0823F', lunch: '#D4AF6A', snack: '#A9B98A', dinner: '#9AA5D6', iftar: '#E0823F', lateSnack: '#B49CD6', suhoor: '#7DB4D6' };

interface Props { meal: Meal; onToggle: () => void; onSwap: () => Promise<void> }

export function MealCard({ meal, onToggle, onSwap }: Props) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const [swapping, setSwapping] = useState(false);
  const Icon = ICONS[meal.type];
  const m = roundMacros(mealMacros(meal.items));
  const color = COLORS[meal.type];

  return (
    <motion.div layout className={cn('overflow-hidden rounded-3xl border bg-surface transition-colors', meal.eaten ? 'border-primary/50' : 'border-border')}>
      <div className="flex items-center gap-3 p-4 pb-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${color}22`, color }}><Icon size={22} /></span>
        <div className="flex-1">
          <h3 className="font-bold">{t(`meals.${meal.type}`)}</h3>
          <p className="text-xs text-muted">
            <b className="text-text">{m.kcal}</b> kcal • {t('macros.protein')} {m.protein}g • {t('macros.carbs')} {m.carbs}g • {t('macros.fat')} {m.fat}g
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul key={meal.seed} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-1 px-4 py-2">
          {getMealFoods(meal).map(({ item, food }) => (
            <li key={food.id} className={cn('flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm', meal.eaten && 'opacity-60')}>
              <span className="flex-1">
                <span className="font-semibold">{food.name[lang]}</span>
                <span className="text-muted"> • {formatServing(food, item.servings, lang)}</span>
              </span>
              <span className="text-xs text-muted">{Math.round(itemMacros(item).kcal)}</span>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      <div className="flex gap-2 p-3 pt-1">
        <motion.button whileTap={{ scale: 0.96 }} onClick={onToggle} aria-pressed={meal.eaten}
          className={cn('flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-colors', meal.eaten ? 'bg-grad-primary text-ink shadow-glow' : 'bg-elevated')}>
          <Check size={18} /> {meal.eaten ? t('meals.eaten') : t('meals.markEaten')}
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} disabled={meal.eaten || swapping} aria-label={t('meals.swap')}
          onClick={async () => { setSwapping(true); await onSwap(); setSwapping(false); }}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-elevated px-4 text-sm font-bold disabled:opacity-40">
          <RefreshCw size={18} className={swapping ? 'animate-spin' : ''} /> {t('meals.swap')}
        </motion.button>
      </div>
    </motion.div>
  );
}
