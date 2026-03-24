import { useMemo } from 'react';
import { motion } from 'motion/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { useDemo } from '@/providers/DemoProvider';

export default function AdminDashboardPage() {
  const { sessions, user, streak } = useDemo();

  // --- Computed metrics ---
  const totalSessions = sessions.length;

  const completionRate = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round((sessions.filter((s) => s.completed).length / sessions.length) * 100);
  }, [sessions]);

  const totalXp = useMemo(
    () => sessions.reduce((sum, s) => sum + s.xpEarned, 0),
    [sessions],
  );

  const currentStreak = streak.currentStreak;

  const avgDurationMin = useMemo(() => {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + s.actualDuration, 0);
    return Math.round(total / sessions.length / 60);
  }, [sessions]);

  const totalFocusTime = useMemo(() => {
    const totalSec = sessions.reduce((sum, s) => sum + s.actualDuration, 0);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.round((totalSec % 3600) / 60);
    return { hours, minutes, label: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m` };
  }, [sessions]);

  // --- Engagement table: last 10 sessions ---
  const recentSessions = useMemo(() => sessions.slice(0, 10), [sessions]);

  // --- Sparkline: sessions per day for last 14 days ---
  const sparklineData = useMemo(() => {
    const days = 14;
    const counts: number[] = new Array(days).fill(0);
    const now = new Date();

    for (const s of sessions) {
      const sessionDate = new Date(s.createdAt);
      const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < days) {
        counts[days - 1 - diffDays]++;
      }
    }
    return counts;
  }, [sessions]);

  const sparklineMax = Math.max(...sparklineData, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">MVP Performance</h1>
          <p className="text-secondary mt-1 text-lg">
            Growth and retention metrics for the current sprint cycle
          </p>
        </div>
        <Badge variant="success">
          <span className="w-2 h-2 rounded-full bg-success inline-block" />
          Operational
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Focus Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <Card className="h-full">
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
              Total Focus Sessions
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{totalSessions.toLocaleString()}</p>
                <p className="text-sm text-secondary mt-1">Total XP: {totalXp.toLocaleString()}</p>
              </div>
              {/* Mini sparkline */}
              <div className="flex items-end gap-1 h-12">
                {sparklineData.map((value, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-sm bg-accent/60"
                    style={{ height: `${Math.max((value / sparklineMax) * 48, 2)}px` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Card className="h-full">
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
              Completion Rate
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-foreground">{completionRate}%</p>
                <p className={cn('text-sm mt-1', completionRate >= 80 ? 'text-success' : 'text-warning')}>
                  {completionRate >= 80 ? 'Target Met' : 'Below Target'}
                </p>
                <p className="text-xs text-secondary">
                  {sessions.filter((s) => s.completed).length} of {totalSessions} completed
                </p>
              </div>
              <div className="flex-shrink-0 w-16 h-16 rounded-full border-4 border-accent flex items-center justify-center">
                <span className="text-sm font-bold text-accent">{completionRate}%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Average Duration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <Card className="h-full">
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
              Average Duration
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-foreground">{avgDurationMin}m</p>
            </div>
            <p className="text-xs text-secondary mt-2">Total Focus Time: {totalFocusTime.label}</p>
          </Card>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Card className="h-full">
            <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-3">
              Current Streak
            </p>
            <p className="text-4xl font-bold text-foreground">{currentStreak} days</p>
            <p className="text-xs text-secondary mt-2">
              Longest streak: {streak.longestStreak} days &middot; Level {user.level}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Engagement Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="relative"
      >
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Filter Activity</Button>
              <Button variant="secondary" size="sm">Export Report</Button>
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 pb-3 border-b border-themed-border">
            {['Task', 'Date', 'Duration', 'XP Earned', 'Status'].map((heading) => (
              <p key={heading} className="text-xs uppercase tracking-widest text-secondary font-semibold">
                {heading}
              </p>
            ))}
          </div>

          {/* Table rows */}
          <div className="divide-y divide-themed-border">
            {recentSessions.length === 0 && (
              <div className="px-4 py-8 text-center text-secondary text-sm">
                No sessions yet. Complete a focus session to see data here.
              </div>
            )}
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.3 + index * 0.06 }}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 items-center px-4 py-4"
              >
                {/* Task */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {session.task.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.task}</p>
                    {session.firstStep && (
                      <p className="text-xs text-secondary">{session.firstStep}</p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className="text-sm text-foreground md:text-center">
                    {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-sm text-foreground md:text-center">
                    {Math.round(session.actualDuration / 60)}m
                  </p>
                </div>

                {/* XP */}
                <div>
                  <p className="text-sm font-medium text-foreground md:text-center">
                    {session.xpEarned.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="md:flex md:justify-center">
                  <Badge variant={session.completed ? 'success' : 'muted'}>
                    {session.completed ? 'Completed' : 'Incomplete'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Live Engine HUD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="absolute -bottom-4 right-4 md:bottom-4 md:right-4"
        >
          <Card className={cn('!p-4 w-56 shadow-lg border-accent/20')}>
            <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">
              Live Engine HUD
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Concurrency</span>
                <span className="font-semibold text-foreground">482</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">Latency</span>
                  <span className="font-semibold text-foreground">24ms</span>
                </div>
                <ProgressBar progress={0.24} color="bg-success" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Success Rate</span>
                <span className="font-semibold text-success">99.98%</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Spacer for HUD overflow on mobile */}
      <div className="h-8 md:h-0" />
    </motion.div>
  );
}
