import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import RecentSessions from '@/components/dashboard/RecentSessions';
import { getLevelForXp, getXpProgress } from '@shared/constants/xp';

export default function DashboardPage() {
  const { user, streak, todayCheckIn, setCheckIn } = useDemo();
  const navigate = useNavigate();
  const [task, setTask] = useState('');

  const level = getLevelForXp(user.totalXp);
  const xpProgress = getXpProgress(user.totalXp);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      setCheckIn(task.trim(), null);
      navigate('/app/breakdown');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Hero heading */}
      <div className="text-center pt-4">
        <p className="uppercase tracking-widest text-xs text-secondary mb-3">
          Define Your Architecture of Focus
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
          What would make<br />today a win?
        </h1>
      </div>

      {/* Task input or current task */}
      <div className="max-w-2xl mx-auto w-full">
        {!todayCheckIn ? (
          <form onSubmit={handleSubmitTask}>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter your most important task..."
              autoFocus
              className="w-full bg-input border border-input-border rounded-2xl px-6 py-5 text-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200 text-center"
            />
            <div className="flex justify-center mt-4">
              <Button type="submit" size="lg" disabled={!task.trim()}>
                Lock In
              </Button>
            </div>
          </form>
        ) : (
          <Card glow className="text-center">
            <p className="uppercase tracking-widest text-xs text-secondary mb-2">Today's Focus</p>
            <h2 className="text-2xl font-bold text-foreground mb-1">{todayCheckIn.task}</h2>
            {todayCheckIn.firstStep && (
              <p className="text-secondary text-sm mb-4">First step: {todayCheckIn.firstStep}</p>
            )}
            <Button size="lg" onClick={() => navigate('/app/focus')}>
              Start Focus Session
            </Button>
          </Card>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ready State card */}
        <Card className="flex flex-col justify-between">
          <div>
            <p className="uppercase tracking-widest text-xs text-secondary mb-3">Ready State</p>
            <h3 className="text-xl font-bold text-foreground mb-2">Deep Work Sanctuary</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Environment calibrated. All notifications silenced. Ready to initiate a 90-minute neural-flow session.
            </p>
          </div>
          <div className="mt-5">
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/app/focus')}
              disabled={!todayCheckIn}
            >
              Start Focus Session
            </Button>
            <p className="text-center text-xs text-secondary mt-2 font-mono tabular-nums">25:00</p>
          </div>
        </Card>

        {/* Current Rank card */}
        <Card>
          <p className="uppercase tracking-widest text-xs text-secondary mb-3">Current Rank</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-bold text-accent leading-none">{level.level}</span>
            <span className="text-lg font-semibold text-foreground mb-1">{level.name}</span>
          </div>
          <ProgressBar progress={xpProgress.progress} color="bg-accent" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-secondary">{xpProgress.current} XP</span>
            <span className="text-xs text-secondary">{xpProgress.next} XP</span>
          </div>
          <div className="mt-3">
            <Badge variant="gold">{user.totalXp} Total XP</Badge>
          </div>
        </Card>

        {/* Streak card */}
        <Card>
          <p className="uppercase tracking-widest text-xs text-secondary mb-3">Streak</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-bold text-foreground leading-none">{streak.currentStreak}</span>
            <span className="text-lg text-secondary mb-1">days</span>
          </div>
          <div className="flex gap-1 mb-4">
            {Array.from({ length: Math.min(streak.currentStreak, 7) }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring' }}
                className="text-lg"
              >
                <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 23c-3.866 0-7-2.686-7-6a7.003 7.003 0 014.13-6.388A4.002 4.002 0 0112 3a4.002 4.002 0 012.87 7.612A7.003 7.003 0 0119 17c0 3.314-3.134 6-7 6z" />
                </svg>
              </motion.span>
            ))}
          </div>
          <div className="text-sm text-secondary">
            Best: <span className="font-semibold text-foreground">{streak.longestStreak} days</span>
          </div>
        </Card>
      </div>

      {/* Inspirational quote */}
      <div className="text-center py-6 max-w-xl mx-auto">
        <p className="text-secondary italic text-sm leading-relaxed">
          "Focus is not something we have, it's something we build. One ritual at a time."
        </p>
        <p className="text-xs text-muted mt-2 uppercase tracking-widest">— The Architect</p>
      </div>

      {/* Recent sessions */}
      <RecentSessions />
    </motion.div>
  );
}
