import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Check, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRef } from 'react';
import { useSettings } from '@/store/settings';

/** اسحب لإكمال الجولة. يدعم RTL، والضغط مرتين كبديل لسهولة الوصول */
export function SwipeToComplete({ label, onComplete, disabled }: { label: string; onComplete: () => void; disabled?: boolean }) {
  const rtl = useSettings((s) => s.lang) === 'ar';
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const knob = 56;
  const max = () => (track.current?.offsetWidth ?? 300) - knob - 8;
  const dir = rtl ? -1 : 1;
  const fill = useTransform(x, (v) => `${Math.min(100, ((Math.abs(v) + knob) / ((track.current?.offsetWidth ?? 300))) * 100)}%`);
  const textOpacity = useTransform(x, (v) => 1 - Math.min(1, Math.abs(v) / 120));
  const Arrow = rtl ? ChevronsLeft : ChevronsRight;

  const end = () => {
    if (Math.abs(x.get()) > max() * 0.75) {
      void animate(x, max() * dir, { duration: 0.15 });
      onComplete();
      setTimeout(() => x.set(0), 350);
    } else void animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
  };

  return (
    <div ref={track} className={`relative h-16 select-none overflow-hidden rounded-full bg-elevated p-1 ${disabled ? 'opacity-50' : ''}`}
      onDoubleClick={() => !disabled && onComplete()}>
      <motion.div className="absolute inset-y-0 start-0 rounded-full bg-grad-primary opacity-30" style={{ width: fill }} />
      <motion.span style={{ opacity: textOpacity }} className="absolute inset-0 grid place-items-center font-bold">
        <span className="flex items-center gap-2">{label} <Arrow size={18} className="animate-pulse text-primary" /></span>
      </motion.span>
      <motion.button
        drag={disabled ? false : 'x'}
        dragConstraints={rtl ? { left: -max(), right: 0 } : { left: 0, right: max() }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={end}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && onComplete()}
        style={{ x, width: knob, height: knob }}
        aria-label={label}
        className="relative z-10 grid place-items-center rounded-full bg-grad-primary text-ink shadow-glow"
      >
        <Check size={26} strokeWidth={3} />
      </motion.button>
    </div>
  );
}
