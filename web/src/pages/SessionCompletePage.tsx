import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import ShareCard from '@/components/session/ShareCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getXpProgress, getLevelForXp } from '@shared/constants/xp';
import ProgressBar from '@/components/ui/ProgressBar';

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
  const xpProgress = getXpProgress(user.totalXp);

  const handleShare = async () => {
    if (!sharedToday && latestSession) {
      shareSession(latestSession.id);
      setShared(true);
    }

    // Try html2canvas if available, otherwise just mark as shared
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
      // Fallback: just copy text
      const text = `Focus Session Complete!\n\nTask: ${latestSession.task}\nDuration: ${Math.round(latestSession.actualDuration / 60)} minutes\nStreak: ${streak.currentStreak} days\nLevel: ${level.level}\n\nBuilt with Hyperfocus`;
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
    >
      {/* XP Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="text-center"
      >
        <div className="text-5xl font-bold text-xp-gold mb-2">+{latestSession.xpEarned} XP</div>
        {shared && !sharedToday && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent font-medium"
          >
            +5 XP Share Bonus!
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <Card className="w-full max-w-md">
        <div className="text-center space-y-4">
          <div className="text-sm text-success font-medium">Session Complete</div>
          <h2 className="text-xl font-bold text-text-primary">{latestSession.task}</h2>
          {latestSession.firstStep && (
            <p className="text-text-secondary text-sm">Step: {latestSession.firstStep}</p>
          )}

          <div className="flex justify-center gap-6 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">
                {Math.round(latestSession.actualDuration / 60)}m
              </div>
              <div className="text-xs text-text-secondary">Duration</div>
            </div>
            <div className="text-center">
              <Badge variant="warning">{streak.currentStreak} day streak</Badge>
            </div>
            <div className="text-center">
              <Badge variant="accent">Level {level.level}</Badge>
            </div>
          </div>

          <ProgressBar progress={xpProgress.progress} color="bg-xp-gold" />
          <div className="text-xs text-text-secondary">
            {xpProgress.current} / {xpProgress.next} XP to Level {level.level + 1}
          </div>
        </div>
      </Card>

      {/* Share Card (hidden for capture) */}
      <div className="absolute -left-[9999px]">
        <ShareCard
          ref={shareCardRef}
          task={latestSession.task}
          duration={latestSession.actualDuration}
          streak={streak}
          user={user}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleShare} disabled={shared && sharedToday}>
          {shared ? 'Downloaded!' : 'Share Result'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </motion.div>
  );
}
