import { cn } from '@/lib/cn';
export function DifficultyDots({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`difficulty ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={cn('h-1.5 w-3 rounded-full', i <= level ? (level === 3 ? 'bg-danger' : level === 2 ? 'bg-accent' : 'bg-primary') : 'bg-border')} />
      ))}
    </span>
  );
}
