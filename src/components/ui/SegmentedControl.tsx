import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface Option<T extends string> { value: T; label: string }
interface Props<T extends string> { value: T; options: Option<T>[]; onChange: (v: T) => void; id: string }

export function SegmentedControl<T extends string>({ value, options, onChange, id }: Props<T>) {
  return (
    <div className="flex rounded-2xl border hairline bg-elevated/70 p-1 shadow-bevel">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn('relative h-10 flex-1 rounded-xl text-sm font-semibold transition-colors', value === o.value ? 'text-ink' : 'text-muted hover:text-text')}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="btn-gold absolute inset-0 rounded-xl shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
