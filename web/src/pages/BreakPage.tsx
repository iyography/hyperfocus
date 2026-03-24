import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useTimer } from '@/providers/TimerProvider';
import { useDemo } from '@/providers/DemoProvider';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function BreakPage() {
  const navigate = useNavigate();
  const timer = useTimer();
  const { todayCheckIn, completeSession } = useDemo();
  const chimePlayedRef = useRef(false);
  const sessionCompletedRef = useRef(false);

  useEffect(() => {
    if (timer.status === 'complete') {
      if (!sessionCompletedRef.current && todayCheckIn) {
        sessionCompletedRef.current = true;
        completeSession(
          todayCheckIn.task,
          todayCheckIn.firstStep,
          timer.focusDuration,
          timer.elapsed,
        );
      }
      timer.startBreak();
    }
  }, [timer.status]);

  useEffect(() => {
    if (timer.status === 'overtime' && !chimePlayedRef.current) {
      chimePlayedRef.current = true;
      try {
        const audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
      } catch {
        // Audio not available
      }
    }
  }, [timer.status]);

  const isOvertime = timer.status === 'overtime';
  const overtimeElapsed = isOvertime ? timer.elapsed - timer.breakDuration : 0;

  const handleStartNext = () => {
    timer.reset();
    navigate('/app/focus');
  };

  const handleEndDay = () => {
    timer.reset();
    navigate('/app/complete');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[75vh] text-center"
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <Badge variant={isOvertime ? 'warning' : 'success'}>
          {isOvertime ? 'Break Complete' : 'Rest Phase'}
        </Badge>
      </motion.div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        {isOvertime ? 'Ready when you are' : 'You earned this rest'}
      </h1>
      <p className="text-secondary text-lg mb-10 max-w-md">
        {isOvertime
          ? 'Your break is complete. Take a moment to stretch, breathe, and prepare for the next session.'
          : 'Step away from the screen. Let your mind wander freely. The best ideas arrive in stillness.'
        }
      </p>

      {/* Timer display */}
      <motion.div
        animate={isOvertime ? { opacity: [1, 0.5, 1] } : {}}
        transition={isOvertime ? { duration: 2, repeat: Infinity } : {}}
        className="mb-6"
      >
        <div className={`text-5xl md:text-6xl font-bold tabular-nums font-mono leading-none ${isOvertime ? 'text-warning' : 'text-foreground'}`}>
          {isOvertime
            ? `+${formatTime(overtimeElapsed)}`
            : formatTime(timer.timeRemaining)
          }
        </div>
      </motion.div>

      {/* Progress bar */}
      {!isOvertime && (
        <div className="w-full max-w-sm mb-10">
          <ProgressBar progress={timer.progress} color="bg-success" />
        </div>
      )}

      {isOvertime && <div className="mb-10" />}

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button size="lg" onClick={handleStartNext} className="rounded-full px-8">
          Start Next Session
        </Button>
        <Button variant="secondary" size="lg" onClick={handleEndDay} className="rounded-full px-8">
          Done for Now
        </Button>
      </div>

      {/* Calming quote */}
      <div className="mt-12 max-w-sm">
        <p className="text-secondary italic text-sm">
          "Almost everything will work again if you unplug it for a few minutes, including you."
        </p>
        <p className="text-xs text-muted mt-2 uppercase tracking-widest">— Anne Lamott</p>
      </div>
    </motion.div>
  );
}
