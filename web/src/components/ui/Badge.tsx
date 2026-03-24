import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'gold' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  accent: 'bg-accent-soft text-accent border-accent/20',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  gold: 'bg-[rgba(251,191,36,0.1)] text-xp-gold border-xp-gold/20',
  muted: 'bg-elevated text-secondary border-themed-border',
};

export default function Badge({ variant = 'accent', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
