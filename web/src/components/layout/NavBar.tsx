import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';
import { InlineThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', tourId: 'nav-dashboard' },
  { to: '/app/settings', label: 'Settings', tourId: 'nav-settings' },
  { to: '/app/extension-demo', label: 'Extension', tourId: 'nav-extension' },
];

export default function NavBar() {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-card glass-strong border-t border-card-border',
        'md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b',
      )}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/app/dashboard" className="text-lg font-bold tracking-tight">
            <span className="text-gradient">Hyper</span>
            <span className="text-foreground">focus</span>
          </NavLink>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-tour={item.tourId}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-secondary hover:text-foreground hover:bg-surface',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="ml-2 hidden md:block">
              <InlineThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
