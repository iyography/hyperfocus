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
    'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(124,92,255,0.25)] hover:shadow-[0_0_30px_rgba(124,92,255,0.35)]',
  secondary:
    'bg-bg-elevated text-text-primary border border-border hover:bg-bg-surface hover:border-accent',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
  danger: 'bg-[rgba(239,68,68,0.1)] text-danger border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
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
        'disabled:opacity-50 disabled:cursor-not-allowed',
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
