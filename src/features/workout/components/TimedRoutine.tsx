import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ProgressRing } from '@/components/ui';
import type { RoutineStep } from '../lib/routines';
import { cues } from '../lib/feedback';

interface Props { kind: 'warmup' | 'cooldown'; steps: RoutineStep[]; onDone: () => void; onSkip: () => void }

/** روتين إحماء/تبريد بمؤقت يتنقل تلقائياً */
export function TimedRoutine({ kind, steps, onDone, onSkip }: Props) {
  const { t } = useTranslation();
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(steps[0].sec);
  const [paused, setPaused] = useState(false);
  const step = steps[i];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [paused, i]);

  useEffect(() => {
    if (left > 0 && left <= 3) cues.tick();
    if (left > 0) return;
    cues.set();
    if (i + 1 >= steps.length) onDone();
    else { setI(i + 1); setLeft(steps[i + 1].sec); }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-accent">{t(`live.${kind}`)} • {i + 1}/{steps.length}</p>
      <AnimatePresence mode="wait">
        <motion.div key={step.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3">
          <span className="text-7xl">{step.emoji}</span>
          <h2 className="text-3xl font-extrabold">{t(`routine.${step.id}.name`)}</h2>
          <p className="max-w-xs text-muted">{t(`routine.${step.id}.how`)}</p>
        </motion.div>
      </AnimatePresence>
      <ProgressRing value={left / step.sec} size={150} stroke={12} color={kind === 'warmup' ? '#E0823F' : '#7DB4D6'} label={<span className="font-display text-5xl">{left}</span>} />
      <div className="flex gap-3">
        <Button variant="secondary" size="lg" onClick={() => setPaused((p) => !p)}>{paused ? <Play size={20} /> : <Pause size={20} />}</Button>
        <Button variant="secondary" size="lg" onClick={() => setLeft(0)}><SkipForward size={20} /> {t('live.nextStep')}</Button>
      </div>
      <button onClick={onSkip} className="text-sm font-bold text-muted underline">{t(kind === 'warmup' ? 'live.skipWarmup' : 'live.skipCooldown')}</button>
    </div>
  );
}
