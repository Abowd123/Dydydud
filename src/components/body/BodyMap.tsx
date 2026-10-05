import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Muscle } from '@/types/exercise';
import { regions, silhouette, type Side } from './shapes';

interface BodyMapProps {
  side: Side;
  primary?: Muscle[];
  secondary?: Muscle[];
  selected?: Muscle | null;
  onSelect?: (m: Muscle) => void;
  className?: string;
  size?: number;
}

const COLORS = { primary: '#D4AF6A', secondary: '#E0823F', selected: '#7DB4D6', idle: 'rgb(var(--elevated))' };

/** خريطة جسم تفاعلية: تضغط على العضلة تختارها، وتتلون حسب العضلات المستهدفة */
export function BodyMap({ side, primary = [], secondary = [], selected, onSelect, className, size = 220 }: BodyMapProps) {
  const { t } = useTranslation();
  const interactive = !!onSelect;

  const fillFor = (m: Muscle) => {
    if (selected === m) return COLORS.selected;
    if (primary.includes(m)) return COLORS.primary;
    if (secondary.includes(m)) return COLORS.secondary;
    return COLORS.idle;
  };

  return (
    <svg viewBox="0 0 200 440" width={size} height={(size * 440) / 200} className={className} role="img" aria-label={t(`body.${side}`)}>
      <g fill="rgb(var(--surface))" stroke="rgb(var(--border))" strokeWidth={1.5}>
        {silhouette.map((d, i) => <path key={i} d={d} />)}
      </g>
      {(Object.entries(regions[side]) as [Muscle, { d: string }[]][]).map(([m, shapes]) => {
        const fill = fillFor(m);
        const active = fill !== COLORS.idle;
        const paths = shapes.flatMap((s, i) => [
          <path key={`l${i}`} d={s.d} />,
          <path key={`r${i}`} d={s.d} transform="translate(200 0) scale(-1 1)" />
        ]);
        return (
          <motion.g
            key={m}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={t(`muscles.${m}`)}
            aria-pressed={interactive ? selected === m : undefined}
            onClick={() => onSelect?.(m)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(m)}
            className={interactive ? 'cursor-pointer outline-none' : undefined}
            animate={{ fill, opacity: active ? 1 : 0.9 }}
            whileHover={interactive ? { scale: 1.03 } : undefined}
            style={{ transformOrigin: '100px 220px', filter: active ? `drop-shadow(0 0 4px ${fill})` : undefined }}
            stroke="rgb(var(--bg))"
            strokeWidth={1}
          >
            <title>{t(`muscles.${m}`)}</title>
            {paths}
          </motion.g>
        );
      })}
    </svg>
  );
}
