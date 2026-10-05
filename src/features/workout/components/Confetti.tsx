import { motion } from 'framer-motion';
import { useMemo } from 'react';

/** غبار ذهبي: شمبانيا، ذهب، نحاس، عاج */
const COLORS = ['#F3DDA8', '#D4AF6A', '#B8904C', '#E0823F', '#F2EEE6', '#E8C989'];

/** احتفال بدون مكتبات إضافية */
export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 0.4, rotate: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length], size: 6 + Math.random() * 8, drift: (Math.random() - 0.5) * 30, round: Math.random() > 0.5
    })),
    [count]
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span key={p.id} className="absolute top-0" style={{ left: `${p.x}%`, width: p.size, height: p.size * (p.round ? 1 : 0.5), background: p.color, borderRadius: p.round ? 999 : 2 }}
          initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
          animate={{ y: '105vh', opacity: [1, 1, 0], rotate: p.rotate, x: `${p.drift}vw` }}
          transition={{ duration: 2.4 + Math.random(), delay: p.delay, ease: 'easeIn' }} />
      ))}
    </div>
  );
}
