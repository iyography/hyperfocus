import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', tourId: 'nav-dashboard' },
  { to: '/app/settings', label: 'Settings', tourId: 'nav-settings' },
  { to: '/app/extension-demo', label: 'Extension', tourId: 'nav-extension' },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border md:static md:border-t-0 md:border-b">
      <div className="max-w-7xl mx-auto px-4">
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
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[rgba(124,92,255,0.15)] text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
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
