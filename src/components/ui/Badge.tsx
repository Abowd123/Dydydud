import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'primary' | 'accent' | 'muted' | 'danger' | 'water';
const tones: Record<Tone, string> = {
  primary: 'bg-gold/12 text-gold ring-1 ring-gold/25',
  accent: 'bg-accent/12 text-accent-400 ring-1 ring-accent/25',
  muted: 'bg-elevated text-muted ring-1 ring-border',
  danger: 'bg-danger/15 text-danger',
  water: 'bg-water/15 text-water'
};

export function Badge({ tone = 'primary', className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-semibold', tones[tone], className)} {...p} />;
}
