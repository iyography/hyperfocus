import { cn } from '@/lib/cn';

interface MeshGradientProps {
  className?: string;
}

export default function MeshGradient({ className }: MeshGradientProps) {
  return (
    <div
      className={cn('fixed inset-0 mesh-gradient pointer-events-none -z-10', className)}
      aria-hidden
    />
  );
}
