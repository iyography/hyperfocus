import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useTimer } from '@/providers/TimerProvider';
import { useDemo } from '@/providers/DemoProvider';
import TimerDisplay from '@/components/timer/TimerDisplay';
import Button from '@/components/ui/Button';

export default function BreakPage() {
  const navigate = useNavigate();
  const timer = useTimer();
  const { todayCheckIn, completeSession } = useDemo();
  const chimePlayedRef = useRef(false);
  const sessionCompletedRef = useRef(false);

  // Start break automatically
  useEffect(() => {
    if (timer.status === 'complete') {
      // Complete the session in demo state
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

  // Play chime when break is over
  useEffect(() => {
    if (timer.status === 'overtime' && !chimePlayedRef.current) {
      chimePlayedRef.current = true;
      // Simple chime using Web Audio API
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
      className="flex flex-col items-center justify-center min-h-[70vh] text-center"
    >
      <div className="text-sm text-success font-medium mb-2">
        {isOvertime ? 'Break Complete — Take your time' : 'Take a Break'}
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-8">
        {isOvertime ? 'Ready when you are' : 'You earned this rest'}
      </h2>

      <TimerDisplay
        timeRemaining={timer.timeRemaining}
        progress={timer.progress}
        isOvertime={isOvertime}
        overtimeElapsed={overtimeElapsed}
      />

      <div className="flex gap-3 mt-8">
        <Button onClick={handleStartNext}>
          Start Next Session
        </Button>
        <Button variant="secondary" onClick={handleEndDay}>
          Done for Now
        </Button>
      </div>
    </motion.div>
  );
}
