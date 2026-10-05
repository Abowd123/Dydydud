import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './Badge';

interface Props { icon: LucideIcon; title: string; description?: string; phase?: string }

export function EmptyState({ icon: Icon, title, description, phase }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="surface-lux grid h-20 w-20 place-items-center rounded-3xl bg-grad-hero">
        <Icon size={36} className="text-primary" />
      </div>
      <h2 className="font-heading text-xl font-extrabold">{title}</h2>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {phase && <Badge tone="accent">{phase}</Badge>}
    </motion.div>
  );
}
