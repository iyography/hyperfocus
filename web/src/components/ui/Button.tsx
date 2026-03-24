import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-[0_2px_12px_var(--th-accent-glow)] hover:shadow-[0_4px_20px_var(--th-accent-glow)] active:scale-[0.97]',
  secondary:
    'bg-surface text-foreground border border-themed-border hover:bg-elevated hover:border-accent/30 active:scale-[0.97]',
  ghost:
    'text-secondary hover:text-foreground hover:bg-surface active:scale-[0.97]',
  danger:
    'bg-danger-soft text-danger border border-danger/20 hover:bg-danger/15 active:scale-[0.97]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base font-semibold rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-medium transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
