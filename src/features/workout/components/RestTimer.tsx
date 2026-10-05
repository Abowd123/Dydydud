import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, SkipForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

interface Props { open: boolean; remaining: number; total: number; nextLabel?: string; onAdd: (s: number) => void; onSkip: () => void }

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** ميناء كرونوغراف: 60 تدريجة، قوس ذهبي ينقص، وعقرب ثواني يدور كل ثانية */
export function RestTimer({ open, remaining, total, nextLabel, onAdd, onSkip }: Props) {
  const { t } = useTranslation();
  const S = 280, cx = S / 2, rTick = S / 2 - 6, rArc = S / 2 - 30;
  const c = 2 * Math.PI * rArc;
  const p = total ? remaining / total : 0;
  const urgent = remaining <= 3;
  const tone = urgent ? '#E0823F' : '#D4AF6A';
  const handDeg = ((total - remaining) % 60) * 6;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6"
          style={{ background: 'radial-gradient(70% 50% at 50% 40%, rgb(212 175 106 / 0.10), rgb(var(--bg) / 0.97) 70%)', backdropFilter: 'blur(24px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <p className="eyebrow">{t('live.rest')}</p>
          <motion.div className="relative" style={{ width: S, height: S }} animate={urgent ? { scale: [1, 1.035, 1] } : { scale: 1 }} transition={{ repeat: urgent ? Infinity : 0, duration: 1 }}>
            <div className="surface-lux absolute inset-3 rounded-full" />
            <svg width={S} height={S} className="relative">
              {Array.from({ length: 60 }, (_, i) => {
                const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
                const major = i % 5 === 0;
                const len = major ? 12 : 6;
                return <line key={i} x1={cx + rTick * Math.cos(a)} y1={cx + rTick * Math.sin(a)} x2={cx + (rTick - len) * Math.cos(a)} y2={cx + (rTick - len) * Math.sin(a)}
                  stroke={major ? 'rgb(var(--gold))' : 'rgb(var(--muted) / 0.45)'} strokeWidth={major ? 2 : 1} strokeLinecap="round" />;
              })}
              <circle cx={cx} cy={cx} r={rArc} stroke="rgb(var(--elevated))" strokeWidth={6} fill="none" />
              <motion.circle cx={cx} cy={cx} r={rArc} stroke={tone} strokeWidth={6} strokeLinecap="round" fill="none" transform={`rotate(-90 ${cx} ${cx})`}
                strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - p) }} transition={{ duration: 0.3, ease: 'linear' }} style={{ filter: `drop-shadow(0 0 10px ${tone})` }} />
              {/* عقرب الثواني */}
              <motion.g animate={{ rotate: handDeg }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                <circle cx={cx} cy={cx} r={rTick} fill="none" stroke="none" />
                <line x1={cx} y1={cx + 18} x2={cx} y2={cx - rArc + 10} stroke={tone} strokeWidth={2} strokeLinecap="round" />
                <circle cx={cx} cy={cx} r={5} fill={tone} />
              </motion.g>
            </svg>
            <div className="absolute inset-x-0 bottom-[22%] text-center">
              <span className="font-display text-6xl font-semibold tracking-wider" dir="ltr">{fmt(remaining)}</span>
            </div>
          </motion.div>
          <div className="flex items-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => onAdd(-15)} aria-label="-15"><Minus size={18} />15</Button>
            <Button size="lg" variant="secondary" onClick={() => onAdd(15)} aria-label="+15"><Plus size={18} />15</Button>
          </div>
          {nextLabel && <p className="text-center text-muted">{t('live.next')}: <b className="text-text">{nextLabel}</b></p>}
          <Button size="lg" onClick={onSkip}><SkipForward size={20} /> {t('live.skipRest')}</Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
