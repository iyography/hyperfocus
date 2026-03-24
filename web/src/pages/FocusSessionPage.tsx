import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import { useTimer } from '@/providers/TimerProvider';
import { HYPERFOCUS_THRESHOLD_SECONDS } from '@shared/constants/defaults';
import { QuickDurationPicker } from '@/components/timer/DurationPicker';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Modal from '@/components/ui/Modal';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusSessionPage() {
  const navigate = useNavigate();
  const { todayCheckIn, settings } = useDemo();
  const timer = useTimer();
  const [showHyperfocusNudge, setShowHyperfocusNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [extendedSeconds, setExtendedSeconds] = useState(0);

  useEffect(() => {
    if (!todayCheckIn) {
      navigate('/app/checkin');
    }
  }, [todayCheckIn, navigate]);

  useEffect(() => {
    if (
      timer.status === 'focusing' &&
      timer.elapsed >= HYPERFOCUS_THRESHOLD_SECONDS &&
      !nudgeDismissed
    ) {
      setShowHyperfocusNudge(true);
    }
  }, [timer.status, timer.elapsed, nudgeDismissed]);

  useEffect(() => {
    if (timer.status === 'complete') {
      navigate('/app/break');
    }
  }, [timer.status, navigate]);

  if (!todayCheckIn) return null;

  const taskLabel = todayCheckIn.firstStep || todayCheckIn.task;
  const effectiveDuration = timer.focusDuration + extendedSeconds;
  const effectiveRemaining = Math.max(0, effectiveDuration - timer.elapsed);
  const effectiveProgress = effectiveDuration > 0 ? Math.min(1, timer.elapsed / effectiveDuration) : 0;

  const handleExtend = () => {
    setExtendedSeconds((prev) => prev + 300);
    // Reconfigure timer with extended duration
    timer.configure(timer.focusDuration + extendedSeconds + 300, settings.defaultBreakDuration);
  };

  const xpPotential = Math.round((timer.focusDuration / 60) * 5);

  // Idle state - choosing duration
  if (timer.status === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <Badge variant="accent" className="mb-4">Deep Work Sanctuary</Badge>
        <p className="uppercase tracking-widest text-xs text-secondary mb-3">Your Current Tiny Step</p>
        <h1 className="text-2xl font-bold text-foreground mb-8">{taskLabel}</h1>
        <div className="w-full max-w-md">
          <QuickDurationPicker
            value={timer.focusDuration}
            onChange={(seconds) => timer.configure(seconds, settings.defaultBreakDuration)}
            onStart={() => timer.startFocus(todayCheckIn.task, todayCheckIn.firstStep)}
          />
        </div>
      </motion.div>
    );
  }

  // Active / Paused state - immersive mode
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="focus-immersive"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center w-full max-w-2xl"
        >
          {/* Top badge */}
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="accent">Active Ritual</Badge>
            <span className="text-sm text-secondary">Deep Flow Phase 01</span>
          </div>

          {/* Task label */}
          <p className="uppercase tracking-widest text-xs text-secondary mb-2">
            Your Current Tiny Step
          </p>
          <h2 className="text-lg font-bold text-foreground mb-10">{taskLabel}</h2>

          {/* Massive timer */}
          <motion.div
            animate={timer.status === 'paused' ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
            transition={timer.status === 'paused' ? { duration: 1.5, repeat: Infinity } : {}}
            className="mb-6"
          >
            <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-accent tabular-nums font-mono leading-none">
              {formatTime(effectiveRemaining)}
            </div>
          </motion.div>

          {/* Thin progress bar */}
          <div className="w-full max-w-lg mb-8">
            <ProgressBar progress={effectiveProgress} color="bg-accent" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mb-10">
            {timer.status === 'paused' && (
              <Button size="lg" onClick={timer.resume} className="rounded-full px-10">
                Resume
              </Button>
            )}
            {timer.status === 'focusing' && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleExtend}
                className="rounded-full"
              >
                Extend (+5 min)
              </Button>
            )}
            {timer.status === 'focusing' && (
              <Button
                variant="ghost"
                size="lg"
                onClick={timer.pause}
                className="rounded-full"
              >
                Pause
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => timer.completeFocus()}
              className="rounded-full px-8"
            >
              End Session
            </Button>
          </div>

          {/* Bottom stats row */}
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <div>
              <p className="uppercase tracking-widest text-xs text-secondary mb-1">Session Goal</p>
              <p className="text-sm font-semibold text-foreground">90% Efficiency</p>
            </div>
            <div className="w-px h-8 bg-themed-border" />
            <div>
              <p className="uppercase tracking-widest text-xs text-secondary mb-1">XP Gain</p>
              <p className="text-sm font-semibold text-foreground">+{xpPotential} XP Potential</p>
            </div>
            <div className="w-px h-8 bg-themed-border" />
            <div>
              <p className="uppercase tracking-widest text-xs text-secondary mb-1">Atmosphere</p>
              <p className="text-sm font-semibold text-foreground">Neural Rain 04</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Side text - flow state indicator */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2">
        <motion.p
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-xs uppercase tracking-widest text-accent/40 font-medium"
          style={{ writingMode: 'vertical-rl' }}
        >
          Flow State Active
        </motion.p>
      </div>

      {/* Hyperfocus protection modal */}
      <Modal
        isOpen={showHyperfocusNudge}
        onClose={() => {
          setShowHyperfocusNudge(false);
          setNudgeDismissed(true);
        }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-warning-soft flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            You've been focused for a while
          </h3>
          <p className="text-secondary mb-6">
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
