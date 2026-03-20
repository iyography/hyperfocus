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
        'glass p-6',
        glow && 'shadow-[0_0_30px_rgba(124,92,255,0.2)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
