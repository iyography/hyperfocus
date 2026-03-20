import type { ReactNode } from 'react';
import { DemoProvider } from './DemoProvider';
import { TimerProvider } from './TimerProvider';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <TimerProvider>
        {children}
      </TimerProvider>
    </DemoProvider>
  );
}
