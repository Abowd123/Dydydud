import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';
export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-bold transition-colors',
        active ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-surface text-muted hover:text-text'
      )}
    >
      {children}
    </button>
  );
}
