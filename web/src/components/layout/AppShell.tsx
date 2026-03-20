import { Outlet } from 'react-router';
import DemoBar from './DemoBar';
import NavBar from './NavBar';
import MeshGradient from '@/components/ui/MeshGradient';
import TourButton from '@/components/tour/TourButton';

export default function AppShell() {
  return (
    <div className="min-h-screen">
      <MeshGradient />
      <DemoBar />
      <NavBar />
      <main className="relative z-10 pt-24 pb-20 md:pt-20 md:pb-8 px-4 max-w-5xl mx-auto">
        <Outlet />
      </main>
      <TourButton />
    </div>
  );
}
