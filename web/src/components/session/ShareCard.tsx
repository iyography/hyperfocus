import { forwardRef } from 'react';
import type { UserProfile, StreakInfo } from '@shared/types';

interface ShareCardProps {
  task: string;
  duration: number;
  streak: StreakInfo;
  user: UserProfile;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} minutes`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining ? `${hrs}h ${remaining}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ task, duration, streak, user }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] p-8 rounded-2xl text-white"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-purple-300 mb-4">
            Focus Session Complete
          </div>

          <h3 className="text-xl font-bold mb-6">{task}</h3>

          <div className="text-3xl font-bold mb-1">{formatDuration(duration)}</div>
          <div className="text-sm text-gray-400 mb-6">of focused work</div>

          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl">
                <svg className="w-6 h-6 text-orange-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 23c-3.866 0-7-2.686-7-6a7.003 7.003 0 014.13-6.388A4.002 4.002 0 0112 3a4.002 4.002 0 012.87 7.612A7.003 7.003 0 0119 17c0 3.314-3.134 6-7 6z" />
                </svg>
              </div>
              <div className="text-sm font-semibold mt-1">{streak.currentStreak} Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">Lvl {user.level}</div>
              <div className="text-sm text-gray-400 mt-1">{user.totalXp} XP</div>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
            Built with <span className="text-purple-400 font-semibold">Hyperfocus</span>
          </div>
        </div>
      </div>
    );
  },
);

ShareCard.displayName = 'ShareCard';
export default ShareCard;
