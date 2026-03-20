import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'gold' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  accent: 'bg-[rgba(124,92,255,0.15)] text-accent border-[rgba(124,92,255,0.25)]',
  success: 'bg-[rgba(34,197,94,0.15)] text-success border-[rgba(34,197,94,0.25)]',
  warning: 'bg-[rgba(245,158,11,0.15)] text-warning border-[rgba(245,158,11,0.25)]',
  gold: 'bg-[rgba(251,191,36,0.15)] text-xp-gold border-[rgba(251,191,36,0.25)]',
  muted: 'bg-bg-elevated text-text-secondary border-border',
};

export default function Badge({ variant = 'accent', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
