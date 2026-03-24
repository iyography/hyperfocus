import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
}

export default function Card({ children, glow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card glass border border-card-border rounded-2xl p-6 shadow-card transition-all duration-300',
        glow && 'glow-sm border-accent/20',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
