import { motion } from 'framer-motion';
import { Droplets, GlassWater, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/components/ui';
import { useSettings } from '@/store/settings';

interface Props { total: number; target: number; logs: { at: number; ml: number }[]; onAdd: (ml: number) => void; onUndo: () => void }

/** قارورة ماء متحركة بموجة */
export function WaterTracker({ total, target, logs, onAdd, onUndo }: Props) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const pct = Math.min(1, total / Math.max(target, 1));
  const done = total >= target;
  const H = 260;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-4 py-6">
        <div className="relative" style={{ width: 150, height: H }}>
          <svg viewBox="0 0 150 260" className="absolute inset-0">
            <defs>
              <clipPath id="bottle"><path d="M55 8 h40 v26 q0 10 10 18 q30 24 30 60 v120 q0 20 -20 20 h-80 q-20 0 -20 -20 v-120 q0 -36 30 -60 q10 -8 10 -18 z" /></clipPath>
              <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9CFE6" /><stop offset="1" stopColor="#3F7FA6" /></linearGradient>
            </defs>
            <path d="M55 8 h40 v26 q0 10 10 18 q30 24 30 60 v120 q0 20 -20 20 h-80 q-20 0 -20 -20 v-120 q0 -36 30 -60 q10 -8 10 -18 z" fill="rgb(var(--elevated))" stroke="rgb(var(--border))" strokeWidth="3" />
            <g clipPath="url(#bottle)">
              <motion.g initial={{ y: H }} animate={{ y: H - pct * (H - 10) }} transition={{ type: 'spring', stiffness: 60, damping: 14 }}>
                <motion.path
                  d="M-150 10 Q-112 0 -75 10 T0 10 T75 10 T150 10 T225 10 T300 10 V400 H-150 Z"
                  fill="url(#water)"
                  animate={{ x: [0, 75] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                />
              </motion.g>
            </g>
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="text-3xl font-extrabold drop-shadow">{(total / 1000).toFixed(2).replace(/0$/, '')}L</p>
            <p className="text-xs font-bold text-muted">/ {(target / 1000).toFixed(1)}L</p>
          </div>
        </div>
        <p className={done ? 'font-bold text-primary' : 'text-sm text-muted'}>
          {done ? t('water.done') : t('water.left', { ml: Math.max(0, target - total) })}
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[250, 330, 500].map((ml) => (
          <Button key={ml} variant="secondary" size="lg" className="flex-col gap-0 text-base" onClick={() => onAdd(ml)}>
            {ml === 500 ? <Droplets size={20} className="text-water" /> : <GlassWater size={20} className="text-water" />}
            <span className="text-sm">+{ml}</span>
          </Button>
        ))}
      </div>
      {logs.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold">{t('water.log')}</p>
            <Button size="sm" variant="ghost" onClick={onUndo}><Undo2 size={16} /> {t('water.undo')}</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {logs.slice().reverse().map((l) => (
              <span key={l.at} className="rounded-full bg-water/15 px-3 py-1 text-xs font-bold text-water">
                {l.ml} ml • {new Date(l.at).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
              </span>
            ))}
          </div>
        </Card>
      )}
      <p className="text-center text-xs text-muted">{t('water.tip')}</p>
    </div>
  );
}
