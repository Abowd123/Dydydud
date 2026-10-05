import { motion } from 'framer-motion';
import { Check, Share2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/components/ui';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import { useShoppingChecks } from '@/store/shopping';
import type { Diet } from '@/types/profile';
import type { Macros } from '@/types/nutrition';
import { getFood } from '../lib/foods';
import { buildShoppingList, formatGrams } from '../lib/shopping';

export function ShoppingList({ daily, diet }: { daily: Macros; diet: Diet }) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const weekKey = dateKey();
  const saved = useLiveQuery(() => db.mealPlans.where('date').aboveOrEqual(weekKey).toArray(), [weekKey], []);
  const ramadan = useSettings((s) => s.ramadan);
  const groups = useMemo(() => buildShoppingList(daily, diet, saved, new Date(), 7, ramadan ? 'ramadan' : 'normal'), [daily, diet, saved, ramadan]);
  const { checked: rawChecked, weekKey: wk, toggle, reset } = useShoppingChecks();
  const checked = wk === weekKey ? rawChecked : [];
  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);

  const share = async () => {
    const text = groups
      .map((g) => `${t(`foodCat.${g.category}`)}\n` + g.items.map((i) => `• ${getFood(i.foodId)!.name[lang]}: ${formatGrams(i.grams, lang)}`).join('\n'))
      .join('\n\n');
    const full = `🛒 ${t('shopping.title')}\n\n${text}`;
    if (navigator.share) await navigator.share({ title: t('shopping.title'), text: full }).catch(() => undefined);
    else await navigator.clipboard.writeText(full);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex items-center gap-3">
        <div className="flex-1">
          <p className="font-bold">{t('shopping.title')}</p>
          <p className="text-xs text-muted">{t('shopping.progress', { done: checked.length, total: totalItems })}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-elevated">
            <motion.div className="h-full bg-grad-primary" animate={{ width: `${(checked.length / Math.max(totalItems, 1)) * 100}%` }} />
          </div>
        </div>
        <Button size="icon" variant="secondary" onClick={share} aria-label={t('shopping.share')}><Share2 size={18} /></Button>
      </Card>

      {groups.map((g) => (
        <Card key={g.category} className="p-0">
          <p className="px-4 pb-1 pt-3 text-sm font-bold text-muted">{t(`foodCat.${g.category}`)}</p>
          <ul className="divide-y divide-border">
            {g.items.map((i) => {
              const f = getFood(i.foodId)!;
              const on = checked.includes(f.id);
              return (
                <li key={f.id}>
                  <button onClick={() => toggle(weekKey, f.id)} className="flex w-full items-center gap-3 px-4 py-3 text-start">
                    <span className={cn('grid h-6 w-6 place-items-center rounded-lg border-2 transition', on ? 'border-primary bg-primary text-ink' : 'border-border')}>
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className={cn('flex-1 font-semibold transition', on && 'text-muted line-through')}>{f.name[lang]}</span>
                    <span className="text-sm text-muted">{formatGrams(i.grams, lang)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
      {checked.length > 0 && <Button variant="ghost" onClick={() => reset(weekKey)}>{t('shopping.reset')}</Button>}
      <p className="text-center text-xs text-muted">{t('shopping.note')}</p>
    </div>
  );
}
