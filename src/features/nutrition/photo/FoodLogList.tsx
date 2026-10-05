import { Camera, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFoodLog } from './useFoodLog';

/** الأكل اللي سجلته من برا الخطة اليوم */
export function FoodLogList() {
  const { t } = useTranslation();
  const { logs, remove } = useFoodLog();
  if (!logs.length) return null;
  return (
    <div className="surface-lux rounded-3xl p-4">
      <h3 className="mb-2 flex items-center gap-2 font-heading font-bold"><Camera size={18} className="text-gold" /> {t('photo.logged')}</h3>
      <ul className="divide-y divide-border">
        {logs.map((l) => (
          <li key={l.id} className="flex items-center gap-3 py-2">
            <span className="flex-1 font-semibold">{l.name}</span>
            <span className="text-sm text-muted" dir="ltr">{l.kcal} kcal · {Math.round(l.protein)}g P</span>
            <button aria-label={t('photo.remove')} onClick={() => remove(l.id)} className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:text-danger"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
