import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import { useTimer } from '@/providers/TimerProvider';
import { HYPERFOCUS_THRESHOLD_SECONDS } from '@shared/constants/defaults';
import TimerDisplay from '@/components/timer/TimerDisplay';
import { QuickDurationPicker } from '@/components/timer/DurationPicker';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function FocusSessionPage() {
  const navigate = useNavigate();
  const { todayCheckIn, settings } = useDemo();
  const timer = useTimer();
  const [showHyperfocusNudge, setShowHyperfocusNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Redirect if no check-in
  useEffect(() => {
    if (!todayCheckIn) {
      navigate('/app/checkin');
    }
  }, [todayCheckIn, navigate]);

  // Hyperfocus protection
  useEffect(() => {
    if (
      timer.status === 'focusing' &&
      timer.elapsed >= HYPERFOCUS_THRESHOLD_SECONDS &&
      !nudgeDismissed
    ) {
      setShowHyperfocusNudge(true);
    }
  }, [timer.status, timer.elapsed, nudgeDismissed]);

  // Navigate to break on complete
  useEffect(() => {
    if (timer.status === 'complete') {
      navigate('/app/break');
    }
  }, [timer.status, navigate]);

  if (!todayCheckIn) return null;

  const taskLabel = todayCheckIn.firstStep || todayCheckIn.task;

  // Pre-session: choose duration
  if (timer.status === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="text-sm text-accent font-medium mb-2">Your Hyperfocus</div>
        <h1 className="text-2xl font-bold text-text-primary mb-8">{taskLabel}</h1>
        <QuickDurationPicker
          value={timer.focusDuration}
          onChange={(seconds) => timer.configure(seconds, settings.defaultBreakDuration)}
          onStart={() => timer.startFocus(todayCheckIn.task, todayCheckIn.firstStep)}
        />
      </motion.div>
    );
  }

  // Active focus session
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="focus"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center"
        >
          <div className="text-sm text-accent font-medium mb-1">Your Hyperfocus</div>
          <h2 className="text-xl font-bold text-text-primary mb-8">{taskLabel}</h2>

          <TimerDisplay
            timeRemaining={timer.timeRemaining}
            progress={timer.progress}
          />

          <div className="flex gap-3 mt-8">
            {timer.status === 'focusing' && (
              <Button variant="secondary" onClick={timer.pause}>
                Pause
              </Button>
            )}
            {timer.status === 'paused' && (
              <Button onClick={timer.resume}>
                Resume
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                timer.completeFocus();
              }}
            >
              End Session
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hyperfocus Protection Modal */}
      <Modal
        isOpen={showHyperfocusNudge}
        onClose={() => {
          setShowHyperfocusNudge(false);
          setNudgeDismissed(true);
        }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">
            <svg className="w-12 h-12 text-warning mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            You've been focused for a while
          </h3>
          <p className="text-text-secondary mb-6">
            Want to take a short reset? Your brain will thank you.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowHyperfocusNudge(false);
                setNudgeDismissed(true);
              }}
            >
              Keep Going
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowHyperfocusNudge(false);
                timer.completeFocus();
              }}
            >
              Take a Break
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
