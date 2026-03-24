import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import ShareCard from '@/components/session/ShareCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getLevelForXp } from '@shared/constants/xp';

export default function SessionCompletePage() {
  const navigate = useNavigate();
  const { user, streak, sessions, sharedToday, shareSession } = useDemo();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);

  const latestSession = sessions[0];
  if (!latestSession) {
    navigate('/app/dashboard');
    return null;
  }

  const level = getLevelForXp(user.totalXp);
  const durationMin = Math.round(latestSession.actualDuration / 60);
  const efficiency = latestSession.plannedDuration > 0
    ? Math.round((latestSession.actualDuration / latestSession.plannedDuration) * 100)
    : 100;

  const handleShare = async () => {
    if (!sharedToday && latestSession) {
      shareSession(latestSession.id);
      setShared(true);
    }

    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      if (shareCardRef.current) {
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: null,
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `hyperfocus-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch {
      const text = `Focus Session Complete!\n\nTask: ${latestSession.task}\nDuration: ${durationMin} minutes\nStreak: ${streak.currentStreak} days\nLevel: ${level.level}\n\nBuilt with Hyperfocus`;
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[70vh] flex items-center"
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left content - 3 cols */}
          <div className="lg:col-span-3 space-y-8">
            {/* Milestone badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Badge variant="accent">Milestone Reached</Badge>
            </motion.div>

            {/* Big heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Session Complete
              </h1>
              <p className="text-secondary text-lg mt-3 leading-relaxed max-w-lg">
                Your digital sanctuary remains undisturbed. You've successfully cultivated focus in a world of noise.
              </p>
            </motion.div>

            {/* XP animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
            >
              <div className="text-3xl font-bold text-xp-gold">+{latestSession.xpEarned} XP</div>
              {shared && !sharedToday && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-accent font-medium text-sm mt-1"
                >
                  +5 XP Share Bonus!
                </motion.div>
              )}
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-8"
            >
              <div>
                <p className="uppercase tracking-widest text-xs text-secondary mb-1">Duration</p>
                <p className="text-3xl font-bold text-foreground">{durationMin} <span className="text-lg font-normal text-secondary">Min</span></p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-xs text-secondary mb-1">Earnings</p>
                <p className="text-3xl font-bold text-foreground">+{latestSession.xpEarned} <span className="text-lg font-normal text-secondary">XP</span></p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-xs text-secondary mb-1">Consistency</p>
                <p className="text-3xl font-bold text-foreground">{streak.currentStreak} <span className="text-lg font-normal text-secondary">Day Streak</span></p>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <Button size="lg" onClick={() => navigate('/app/dashboard')} className="rounded-full px-8">
                Set Next Focus
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/app/dashboard')}
                className="rounded-full px-8"
              >
                Take a Break
              </Button>
            </motion.div>
          </div>

          {/* Right content - share preview - 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 flex flex-col items-center gap-5"
          >
            {/* Share preview card */}
            <Card className="w-full overflow-hidden">
              <div
                className="rounded-xl p-6 text-white text-center"
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                }}
              >
                <p className="text-xs uppercase tracking-widest text-purple-300 mb-3">
                  Focus HUD / Deep Work Flow
                </p>
                <h3 className="text-lg font-bold mb-4 truncate">{latestSession.task}</h3>
                <div className="text-4xl font-bold mb-1">{durationMin} min</div>
                <div className="text-sm text-gray-400 mb-4">of focused work</div>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <div className="text-purple-400 font-semibold">{efficiency}%</div>
                    <div className="text-gray-500 text-xs">Efficiency</div>
                  </div>
                  <div>
                    <div className="text-orange-400 font-semibold">{streak.currentStreak} days</div>
                    <div className="text-gray-500 text-xs">Streak</div>
                  </div>
                  <div>
                    <div className="text-purple-400 font-semibold">Lvl {level.level}</div>
                    <div className="text-gray-500 text-xs">{user.totalXp} XP</div>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleShare}
              disabled={shared && sharedToday}
              size="lg"
              className="w-full rounded-full"
            >
              {shared ? 'Downloaded!' : 'Share Results'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Hidden share card for capture */}
      <div className="absolute -left-[9999px]">
        <ShareCard
          ref={shareCardRef}
          task={latestSession.task}
          duration={latestSession.actualDuration}
          streak={streak}
          user={user}
        />
      </div>
    </motion.div>
  );
}
