import { cn } from '@/lib/cn';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  color = 'bg-accent',
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-secondary mt-1 block text-right">
          {Math.round(clampedProgress * 100)}%
        </span>
      )}
    </div>
  );
}
