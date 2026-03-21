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
    'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_rgba(124,92,255,0.3)] hover:shadow-[0_0_30px_rgba(124,92,255,0.45)] active:scale-[0.98]',
  secondary:
    'bg-[rgba(28,28,39,0.8)] text-text-primary border border-[rgba(42,42,58,0.6)] hover:border-[rgba(124,92,255,0.4)] hover:bg-[rgba(28,28,39,1)] active:scale-[0.98]',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-[rgba(28,28,39,0.6)] active:scale-[0.98]',
  danger:
    'bg-[rgba(239,68,68,0.1)] text-danger border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.2)] active:scale-[0.98]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base font-semibold rounded-xl',
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
