import { motion } from 'framer-motion';
import { useId, type ReactNode } from 'react';

interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: ReactNode;
  sublabel?: ReactNode;
  ticks?: boolean;
}

/**
 * حلقة "كرونوغراف": تدريج دقيق حول القوس مثل ميناء الساعة،
 * قوس معدني متدرج، ونقطة مضيئة عند نهايته.
 */
export function ProgressRing({ value, size = 96, stroke = 8, color = '#D4AF6A', track = 'rgb(var(--elevated))', label, sublabel, ticks = true }: ProgressRingProps) {
  const id = useId().replace(/:/g, '');
  const v = Math.max(0, Math.min(1, value || 0));
  const tickBand = ticks ? Math.max(5, size * 0.07) : 0;
  const r = (size - stroke) / 2 - tickBand;
  const c = 2 * Math.PI * r;
  const n = size >= 120 ? 60 : size >= 80 ? 40 : 24;
  const cx = size / 2;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.35" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity="0.75" />
          </linearGradient>
        </defs>
        {ticks &&
          Array.from({ length: n }, (_, i) => {
            const a = (i / n) * 2 * Math.PI - Math.PI / 2;
            const major = i % (n / 4) === 0;
            const r1 = size / 2 - 1, r2 = r1 - (major ? tickBand : tickBand * 0.55);
            const lit = i / n <= v && v > 0;
            return (
              <line key={i} x1={cx + r1 * Math.cos(a)} y1={cx + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cx + r2 * Math.sin(a)}
                stroke={lit ? color : 'rgb(var(--border))'} strokeOpacity={lit ? 0.9 : 1} strokeWidth={major ? 1.6 : 1} strokeLinecap="round" />
            );
          })}
        <circle cx={cx} cy={cx} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle cx={cx} cy={cx} r={r} stroke={`url(#g${id})`} strokeWidth={stroke} strokeLinecap="round" fill="none"
          transform={`rotate(-90 ${cx} ${cx})`} strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - v) }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
        {v > 0.02 && (
          // المجموعة فيها دائرة شفافة بحجم الحلقة عشان يكون محور الدوران بالمنتصف
          <motion.g initial={{ rotate: 0 }} animate={{ rotate: v * 360 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="none" />
            <circle cx={cx} cy={cx - r} r={stroke * 0.55} fill="#FFF6E0" style={{ filter: `drop-shadow(0 0 ${stroke * 0.8}px ${color})` }} />
          </motion.g>
        )}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center leading-tight">
        {label != null && <span className="font-display font-semibold leading-none" style={{ fontSize: Math.max(16, size * 0.22) }}>{label}</span>}
        {sublabel && <span className="mt-0.5 text-[13px] text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
