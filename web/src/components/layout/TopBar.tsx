import { useDemo } from '@/providers/DemoProvider';
import { getLevelForXp } from '@shared/constants/xp';
import { InlineThemeToggle } from '@/components/ui/ThemeToggle';

export default function TopBar() {
  const { user } = useDemo();
  const level = getLevelForXp(user.totalXp);

  return (
    <header className="h-14 flex items-center justify-between px-6 md:px-10 shrink-0">
      {/* Left side - breadcrumb placeholder */}
      <div />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* XP */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-secondary">
          <svg className="w-4 h-4 text-xp-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>XP: {user.totalXp.toLocaleString()}</span>
        </div>

        {/* Level */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
          Level {level.level}
        </div>

        {/* Theme toggle */}
        <InlineThemeToggle />

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
          {(user.displayName || 'A')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
