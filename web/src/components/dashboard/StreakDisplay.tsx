import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';

export default function StreakDisplay() {
  const { streak } = useDemo();

  return (
    <Card className="flex items-center gap-4" data-tour="streak-display">
      <div className="w-12 h-12 rounded-xl bg-warning-soft flex items-center justify-center flex-shrink-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <svg className="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 23c-3.866 0-7-2.686-7-6a7.003 7.003 0 014.13-6.388A4.002 4.002 0 0112 3a4.002 4.002 0 012.87 7.612A7.003 7.003 0 0119 17c0 3.314-3.134 6-7 6z" />
          </svg>
        </motion.div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{streak.currentStreak} days</div>
        <div className="text-sm text-secondary">Focus Streak</div>
      </div>
      <div className="ml-auto text-right">
        <div className="text-sm text-secondary">Best</div>
        <div className="text-lg font-semibold text-foreground">{streak.longestStreak}</div>
      </div>
    </Card>
  );
}
