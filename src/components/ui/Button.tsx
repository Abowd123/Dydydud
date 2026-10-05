import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'btn-gold text-ink shadow-glow hover:brightness-105',
  accent: 'bg-gradient-to-br from-accent-400 to-accent-600 text-ink shadow-glow-accent hover:brightness-105',
  secondary: 'bg-elevated/80 text-text border hairline shadow-bevel hover:bg-elevated',
  ghost: 'bg-transparent text-text hover:bg-elevated/70',
  danger: 'bg-danger text-white hover:brightness-110'
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-5 text-base rounded-2xl',
  lg: 'h-14 px-7 text-[17px] rounded-2xl',
  icon: 'h-11 w-11 rounded-2xl'
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ButtonHTMLAttributes<HTMLButtonElement>['children'];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-semibold tracking-wide transition disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />}
      {children}
    </motion.button>
  )
);
Button.displayName = 'Button';
