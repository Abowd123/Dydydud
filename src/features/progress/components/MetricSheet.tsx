import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/ui';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { saveMetric } from '../lib/useProgress';
import type { BodyMetric } from '../lib/stats';

const FIELDS = [['weightKg', 'kg', 0.1], ['waistCm', 'cm', 0.5], ['chestCm', 'cm', 0.5], ['armCm', 'cm', 0.5], ['hipCm', 'cm', 0.5], ['neckCm', 'cm', 0.5]] as const;
type Key = (typeof FIELDS)[number][0];

export function MetricSheet({ open, onClose, lastWeight }: { open: boolean; onClose: () => void; lastWeight?: number }) {
  const { t } = useTranslation();
  const [date, setDate] = useState(dateKey());
  const [vals, setVals] = useState<Partial<Record<Key, string>>>({});

  useEffect(() => {
    if (!open) return;
    void db.bodyMetrics.get(date).then((m?: BodyMetric) => {
      const init: Partial<Record<Key, string>> = {};
      FIELDS.forEach(([k]) => { if (m?.[k]) init[k] = String(m[k]); });
      if (!init.weightKg && lastWeight) init.weightKg = String(lastWeight);
      setVals(init);
    });
  }, [open, date, lastWeight]);

  const save = async () => {
    const out: Partial<BodyMetric> = {};
    FIELDS.forEach(([k]) => { const n = Number((vals[k] ?? '').replace(',', '.')); if (n > 0) out[k] = n; });
    await saveMetric({ date, ...out });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('progress.logTitle')}>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-muted">{t('progress.date')}</span>
          <input type="date" value={date} max={dateKey()} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl border border-border bg-elevated px-3" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map(([k, unit, step]) => (
            <label key={k} className={`flex flex-col gap-1 rounded-2xl bg-elevated p-3 ${k === 'weightKg' ? 'col-span-2' : ''}`}>
              <span className="text-xs font-bold text-muted">{t(`progress.f.${k}`)} ({unit})</span>
              <input inputMode="decimal" step={step} value={vals[k] ?? ''} placeholder="—" onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))}
                className={`bg-transparent font-extrabold outline-none ${k === 'weightKg' ? 'text-3xl' : 'text-xl'}`} dir="ltr" />
            </label>
          ))}
        </div>
        <p className="text-xs text-muted">{t('progress.measureTip')}</p>
        <Button size="lg" onClick={save}>{t('progress.save')}</Button>
      </div>
    </Modal>
  );
}
