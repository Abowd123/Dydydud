import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'glass' | 'hero';
}

export function Card({ variant = 'solid', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl p-5',
        variant === 'solid' && 'surface-lux',
        variant === 'glass' && 'glass shadow-soft',
        variant === 'hero' && 'surface-lux sheen relative overflow-hidden border-gold/30 bg-grad-hero',
        className
      )}
      {...props}
    />
  );
}

export const CardTitle = ({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-heading text-[17px] font-bold', className)} {...p} />
);
export const CardDescription = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted', className)} {...p} />
);
