import { motion } from 'framer-motion';
import { Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  compact?: boolean;
}

export function OptionCard({ selected, onClick, title, description, icon: Icon, color = '#D4AF6A', compact }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-3xl border-2 bg-surface text-start transition-colors',
        compact ? 'p-3' : 'p-4',
        selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted/40'
      )}
      style={selected ? { boxShadow: `0 0 24px ${color}33` } : undefined}
    >
      {Icon && (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: `${color}22`, color }}>
          <Icon size={24} />
        </span>
      )}
      <span className="flex-1">
        <span className="block font-bold">{title}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      <span className={cn('grid h-6 w-6 place-items-center rounded-full border-2 transition', selected ? 'border-primary bg-primary text-ink' : 'border-border')}>
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </motion.button>
  );
}
