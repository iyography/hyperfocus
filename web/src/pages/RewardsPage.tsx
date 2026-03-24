import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import { getLevelForXp, getXpProgress } from '@shared/constants/xp';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import type { FocusSession, StreakInfo, UserProfile } from '@shared/types';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  xp: number;
  earned: boolean;
}

function computeAchievements(
  sessions: FocusSession[],
  streak: StreakInfo,
  user: UserProfile,
  sharedToday: boolean,
): Achievement[] {
  return [
    {
      id: 1, title: 'First Focus', description: 'Complete your first focus session',
      icon: '🎯', xp: 10,
      earned: sessions.some(s => s.completed),
    },
    {
      id: 2, title: 'Streak Starter', description: 'Build a 3-day focus streak',
      icon: '🔥', xp: 25,
      earned: streak.longestStreak >= 3,
    },
    {
      id: 3, title: 'Deep Diver', description: 'Complete a 60+ minute session',
      icon: '🌊', xp: 50,
      earned: sessions.some(s => s.actualDuration >= 3600),
    },
    {
      id: 4, title: 'Consistency King', description: 'Build a 7-day focus streak',
      icon: '👑', xp: 100,
      earned: streak.longestStreak >= 7,
    },
    {
      id: 5, title: 'Century Club', description: 'Earn 100+ total XP',
      icon: '💯', xp: 50,
      earned: user.totalXp >= 100,
    },
    {
      id: 6, title: 'Share the Love', description: 'Share a session result',
      icon: '📤', xp: 15,
      earned: sessions.some(s => s.shared) || sharedToday,
    },
    {
      id: 7, title: 'Marathon Mind', description: 'Complete a 2+ hour session',
      icon: '🧠', xp: 150,
      earned: sessions.some(s => s.actualDuration >= 7200),
    },
    {
      id: 8, title: 'Perfect Week', description: '7-day streak achieved',
      icon: '⭐', xp: 200,
      earned: streak.longestStreak >= 7,
    },
    {
      id: 9, title: 'Level 10', description: 'Reach Level 10',
      icon: '🏆', xp: 500,
      earned: user.level >= 10,
    },
    {
      id: 10, title: 'Five Sessions', description: 'Complete 5 focus sessions',
      icon: '✋', xp: 30,
      earned: sessions.filter(s => s.completed).length >= 5,
    },
    {
      id: 11, title: 'Early Bird', description: 'Plan your day before starting',
      icon: '🐦', xp: 20,
      earned: true, // If they have any plan
    },
    {
      id: 12, title: 'Reflector', description: 'Complete a daily shutdown ritual',
      icon: '🪞', xp: 25,
      earned: false, // Will be true when plan.completed
    },
  ];
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function RewardsPage() {
  const { user, streak, sessions, sharedToday, dailyPlan } = useDemo();

  const achievements = computeAchievements(sessions, streak, user, sharedToday);

  // Override the Reflector achievement if the daily plan is completed
  if (dailyPlan?.completed) {
    const reflector = achievements.find(a => a.id === 12);
    if (reflector) reflector.earned = true;
  }

  const level = getLevelForXp(user.totalXp);
  const xpProgress = getXpProgress(user.totalXp);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalFocusTime = sessions.reduce((sum, s) => sum + s.actualDuration, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-foreground">Rewards & Achievements</h1>
        <p className="text-secondary mt-1 text-lg">Your focus journey, celebrated</p>
      </div>

      {/* Level Progress */}
      <Card glow>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-accent-soft border-2 border-accent flex items-center justify-center">
              <span className="text-4xl font-bold text-accent">{level.level}</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs uppercase tracking-widest text-secondary mb-1">Current Level</p>
            <h2 className="text-2xl font-bold text-foreground">{level.name}</h2>
            <p className="text-secondary text-sm mt-1">{user.totalXp} total XP</p>
            <div className="mt-3">
              <ProgressBar progress={xpProgress.progress} />
              <p className="text-xs text-secondary mt-1.5">
                {xpProgress.current} / {xpProgress.next} XP to next level
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
            >
              <Card
                className={cn(
                  'relative text-center h-full',
                  !achievement.earned && 'opacity-50',
                )}
              >
                {/* Earned / locked indicator */}
                <div className="absolute top-3 right-3">
                  {achievement.earned ? (
                    <svg
                      className="w-5 h-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                </div>

                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                <p className="text-sm text-secondary mt-1">{achievement.description}</p>
                <div className="mt-3">
                  <Badge variant="gold">+{achievement.xp} XP</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4">
          Stats Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: sessions.length },
            { label: 'Total Focus Time', value: formatDuration(totalFocusTime) },
            { label: 'Achievements Earned', value: `${earnedCount} / ${achievements.length}` },
            { label: 'Current Streak', value: `${streak.currentStreak} days` },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
            >
              <Card className="text-center">
                <p className="text-xs uppercase tracking-widest text-secondary mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
