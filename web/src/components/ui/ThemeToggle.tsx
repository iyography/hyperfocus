import { motion } from 'motion/react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

const themes = [
  { id: 'light' as const, icon: SunIcon, label: 'Light' },
  { id: 'dark' as const, icon: MoonIcon, label: 'Dark' },
  { id: 'neon' as const, icon: ZapIcon, label: 'Neon' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-[9998] flex flex-col gap-1 p-1.5 rounded-2xl bg-card glass-strong border border-card-border shadow-elevated"
    >
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer group',
              isActive
                ? 'bg-accent-soft text-accent'
                : 'text-secondary hover:text-foreground hover:bg-surface',
            )}
            aria-label={`Switch to ${t.label} mode`}
          >
            <t.icon className="w-[18px] h-[18px]" />
            {/* Tooltip */}
            <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium bg-card glass border border-card-border rounded-lg shadow-elevated opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap text-foreground">
              {t.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}

export function InlineThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-0.5 p-1 rounded-xl bg-surface border border-themed-border">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer',
              isActive
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:text-foreground',
            )}
            aria-label={`Switch to ${t.label} mode`}
          >
            <t.icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
