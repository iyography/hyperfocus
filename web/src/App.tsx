import { Routes, Route, Navigate } from 'react-router';
import AppProvider from '@/providers/AppProvider';
import LandingPage from '@/pages/LandingPage';
import AppShell from '@/components/layout/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import CheckInPage from '@/pages/CheckInPage';
import TaskBreakdownPage from '@/pages/TaskBreakdownPage';
import FocusSessionPage from '@/pages/FocusSessionPage';
import BreakPage from '@/pages/BreakPage';
import SessionCompletePage from '@/pages/SessionCompletePage';
import SettingsPage from '@/pages/SettingsPage';
import ExtensionDemoPage from '@/pages/ExtensionDemoPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppShell />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="checkin" element={<CheckInPage />} />
          <Route path="breakdown" element={<TaskBreakdownPage />} />
          <Route path="focus" element={<FocusSessionPage />} />
          <Route path="break" element={<BreakPage />} />
          <Route path="complete" element={<SessionCompletePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="extension-demo" element={<ExtensionDemoPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
