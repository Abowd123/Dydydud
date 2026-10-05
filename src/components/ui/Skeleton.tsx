import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-elevated', className)}>
      <div className="absolute inset-0 translate-x-full animate-shimmer bg-gradient-to-l from-transparent via-white/10 to-transparent" />
    </div>
  );
}
