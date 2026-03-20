import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { dashboardTourSteps, focusTourSteps, extensionTourSteps } from './tourSteps';
import { useDemo } from '@/providers/DemoProvider';

const tourConfig = {
  showProgress: true,
  animate: true,
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  popoverClass: 'hyperfocus-tour-popover',
  stagePadding: 8,
  stageRadius: 12,
};

function getStepsForPath(pathname: string) {
  if (pathname.includes('dashboard')) return dashboardTourSteps;
  if (pathname.includes('focus')) return focusTourSteps;
  if (pathname.includes('extension')) return extensionTourSteps;
  return dashboardTourSteps;
}

export default function TourButton() {
  const { isDemo } = useDemo();
  const location = useLocation();
  const autoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    const steps = getStepsForPath(location.pathname);
    const driverObj = driver({
      ...tourConfig,
      steps,
    });
    driverObj.drive();
  }, [location.pathname]);

  // Auto-start tour on first demo entry (dashboard)
  useEffect(() => {
    if (isDemo && location.pathname.includes('dashboard') && !autoStartedRef.current) {
      autoStartedRef.current = true;
      // Small delay to let the page render fully
      const timeout = setTimeout(() => {
        startTour();
      }, 800);
      return () => clearTimeout(timeout);
    }
    if (!isDemo) {
      autoStartedRef.current = false;
    }
  }, [isDemo, location.pathname, startTour]);

  if (!isDemo) return null;

  return (
    <button
      onClick={startTour}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 rounded-full bg-accent text-white shadow-[0_0_20px_rgba(124,92,255,0.2)] hover:shadow-[0_0_30px_rgba(124,92,255,0.3)] flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
      title="Take a guided tour"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </button>
  );
}
