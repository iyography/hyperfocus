import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', tourId: 'nav-dashboard' },
  { to: '/app/settings', label: 'Settings', tourId: 'nav-settings' },
  { to: '/app/extension-demo', label: 'Extension', tourId: 'nav-extension' },
];

export default function NavBar() {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-[rgba(19,19,26,0.85)] backdrop-blur-xl border-t border-[rgba(42,42,58,0.5)]',
        'md:sticky md:top-10 md:bottom-auto md:border-t-0 md:border-b',
      )}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/app/dashboard" className="text-lg font-bold">
            <span className="text-accent">Hyper</span>
            <span className="text-text-primary">focus</span>
          </NavLink>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-tour={item.tourId}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[rgba(124,92,255,0.15)] text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-[rgba(28,28,39,0.8)]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
