import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ProgressRing } from '@/components/ui';
import { cn } from '@/lib/cn';
import { readinessLevel, readinessScore, type Readiness } from '../lib/progression';
import { saveCheckin } from '../lib/useCheckin';

const ENERGY = ['😫', '😕', '😐', '🙂', '🤩'];
const SORE = ['💚', '🙂', '😐', '😣', '🥵'];

interface Props { open: boolean; onClose: () => void; onDone: (r: Readiness & { score: number }) => void }

/** تقييم سريع قبل التمرين: نوم، طاقة، ألم عضلي */
export function ReadinessSheet({ open, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const [r, setR] = useState<Readiness>({ sleepH: 7, energy: 3, soreness: 2 });
  const score = readinessScore(r);
  const level = readinessLevel(score);
  const color = { high: '#D4AF6A', normal: '#7DB4D6', low: '#E0823F', veryLow: '#E5484D' }[level];

  return (
    <Modal open={open} onClose={onClose} title={t('ready2.title')}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 flex justify-between text-sm font-bold"><span>{t('ready2.sleep')}</span><span className="text-primary">{r.sleepH} {t('ready2.hours')}</span></p>
          <input type="range" min={3} max={10} step={0.5} value={r.sleepH} onChange={(e) => setR({ ...r, sleepH: Number(e.target.value) })} className="w-full accent-[#D4AF6A]" />
        </div>
        {([['energy', ENERGY], ['soreness', SORE]] as const).map(([k, icons]) => (
          <div key={k}>
            <p className="mb-2 text-sm font-bold">{t(`ready2.${k}`)}</p>
            <div className="grid grid-cols-5 gap-2">
              {icons.map((ic, i) => (
                <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => setR({ ...r, [k]: (i + 1) as 1 })}
                  className={cn('h-12 rounded-2xl text-2xl transition', r[k] === i + 1 ? 'bg-primary/20 ring-2 ring-primary' : 'bg-elevated')}>{ic}</motion.button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-4 rounded-3xl bg-elevated p-3">
          <ProgressRing value={score / 100} color={color} size={72} stroke={8} label={score} />
          <div className="flex-1">
            <p className="font-bold" style={{ color }}>{t(`ready2.level.${level}`)}</p>
            <p className="text-xs text-muted">{t(`ready2.advice.${level}`)}</p>
          </div>
        </div>
        <Button size="lg" onClick={async () => { const c = await saveCheckin(r); onDone({ ...r, score: c.score }); }}>{t('ready2.go')}</Button>
      </div>
    </Modal>
  );
}
