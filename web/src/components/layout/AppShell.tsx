import { useState } from 'react';
import { Outlet } from 'react-router';
import DemoBar from './DemoBar';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MeshGradient from '@/components/ui/MeshGradient';
import TourButton from '@/components/tour/TourButton';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-primary">
      <MeshGradient />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        <DemoBar />
        {/* Mobile hamburger */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card glass border border-card-border text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
        <TopBar />
        <main className="flex-1 px-6 md:px-10 py-6 max-w-6xl">
          <Outlet />
        </main>
      </div>
      <TourButton />
    </div>
  );
}
