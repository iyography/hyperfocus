import { Outlet } from 'react-router';
import DemoBar from './DemoBar';
import NavBar from './NavBar';
import MeshGradient from '@/components/ui/MeshGradient';
import TourButton from '@/components/tour/TourButton';

export default function AppShell() {
  return (
    <div className="min-h-screen relative">
      <MeshGradient />
      <DemoBar />
      <NavBar />
      <main className="relative z-10 py-8 pb-24 md:pb-8 px-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
      <TourButton />
    </div>
  );
}
