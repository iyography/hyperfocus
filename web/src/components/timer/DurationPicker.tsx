import { useState } from 'react';
import { cn } from '@/lib/cn';
import { TIMER_PRESETS, BREAK_PRESETS } from '@shared/constants/defaults';
import Button from '@/components/ui/Button';

interface DurationPickerProps {
  focusDuration: number;
  breakDuration: number;
  onFocusChange: (seconds: number) => void;
  onBreakChange: (seconds: number) => void;
}

function PresetGrid({
  presets,
  value,
  onChange,
  label,
}: {
  presets: readonly { label: string; seconds: number }[];
  value: number;
  onChange: (seconds: number) => void;
  label: string;
}) {
  const [customMin, setCustomMin] = useState('');
  const isCustom = !presets.some((p) => p.seconds === value);

  return (
    <div>
      <div className="text-sm text-text-secondary mb-3">{label}</div>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => onChange(preset.seconds)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
              value === preset.seconds
                ? 'bg-accent text-white shadow-[0_0_15px_var(--color-accent-glow)]'
                : 'bg-bg-elevated text-text-secondary border border-border hover:border-[rgba(124,92,255,0.5)] hover:text-text-primary',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Custom (min)"
          value={isCustom ? Math.round(value / 60) : customMin}
          onChange={(e) => {
            const min = parseInt(e.target.value, 10);
            setCustomMin(e.target.value);
            if (min > 0) {
              onChange(min * 60);
            }
          }}
          min={1}
          max={480}
          className="w-32 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-[rgba(136,136,160,0.4)] focus:outline-none focus:border-accent transition-all"
        />
        <span className="text-xs text-text-secondary">minutes</span>
      </div>
    </div>
  );
}

export default function DurationPicker({
  focusDuration,
  breakDuration,
  onFocusChange,
  onBreakChange,
}: DurationPickerProps) {
  return (
    <div className="space-y-6">
      <PresetGrid
        presets={TIMER_PRESETS}
        value={focusDuration}
        onChange={onFocusChange}
        label="Focus Duration"
      />
      <PresetGrid
        presets={BREAK_PRESETS}
        value={breakDuration}
        onChange={onBreakChange}
        label="Break Duration"
      />
    </div>
  );
}

export function QuickDurationPicker({
  value,
  onChange,
  onStart,
}: {
  value: number;
  onChange: (seconds: number) => void;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {TIMER_PRESETS.map((preset) => (
          <button
            key={preset.seconds}
            onClick={() => onChange(preset.seconds)}
            className={cn(
              'px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
              value === preset.seconds
                ? 'bg-accent text-white shadow-[0_0_15px_var(--color-accent-glow)]'
                : 'bg-bg-elevated text-text-secondary border border-border hover:border-[rgba(124,92,255,0.5)]',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <Button size="lg" onClick={onStart} className="w-full">
        Start Focus Session
      </Button>
    </div>
  );
}
