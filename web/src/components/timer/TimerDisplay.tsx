import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

interface TimerDisplayProps {
  timeRemaining: number;
  progress: number;
  isOvertime?: boolean;
  overtimeElapsed?: number;
  size?: 'md' | 'lg';
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerDisplay({
  timeRemaining,
  progress,
  isOvertime = false,
  overtimeElapsed = 0,
  size = 'lg',
}: TimerDisplayProps) {
  const dimensions = size === 'lg' ? 280 : 200;
  const strokeWidth = size === 'lg' ? 4 : 3;
  const radius = (dimensions - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={dimensions}
        height={dimensions}
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="var(--th-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={isOvertime ? 'var(--color-warning)' : 'var(--th-accent)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transition={{ duration: 0.5, ease: 'linear' }}
        />
        {/* Glow effect */}
        <motion.circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={isOvertime ? 'var(--color-warning)' : 'var(--th-accent)'}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          opacity={0.12}
          filter="blur(8px)"
          transition={{ duration: 0.5, ease: 'linear' }}
        />
      </svg>

      {/* Time text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isOvertime && (
          <div className="text-xs text-warning font-medium mb-1">OVERTIME</div>
        )}
        <div
          className={cn(
            'font-mono font-bold tabular-nums',
            size === 'lg' ? 'text-5xl md:text-6xl' : 'text-3xl',
            isOvertime ? 'text-warning' : 'text-foreground',
          )}
        >
          {isOvertime ? `+${formatTime(overtimeElapsed)}` : formatTime(timeRemaining)}
        </div>
      </div>
    </div>
  );
}
