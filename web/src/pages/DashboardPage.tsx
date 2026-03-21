import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import TodayCard from '@/components/dashboard/TodayCard';
import StreakDisplay from '@/components/dashboard/StreakDisplay';
import XPBar from '@/components/dashboard/XPBar';
import RecentSessions from '@/components/dashboard/RecentSessions';

export default function DashboardPage() {
  const { user } = useDemo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
          Welcome back, {user.displayName.split(' ')[0]}
        </h1>
        <p className="text-text-secondary mt-2 text-lg">Let's make today count.</p>
      </div>

      <TodayCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakDisplay />
        <XPBar />
      </div>

      <RecentSessions />
    </motion.div>
  );
}
