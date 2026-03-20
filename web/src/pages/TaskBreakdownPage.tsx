import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function TaskBreakdownPage() {
  const [firstStep, setFirstStep] = useState('');
  const { todayCheckIn, setCheckIn } = useDemo();
  const navigate = useNavigate();

  if (!todayCheckIn) {
    navigate('/app/checkin');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstStep.trim()) {
      setCheckIn(todayCheckIn.task, firstStep.trim());
    }
    navigate('/app/focus');
  };

  const handleSkip = () => {
    navigate('/app/focus');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <Card glow className="max-w-lg w-full text-center">
        <div className="text-sm text-accent mb-4 font-medium">Today's Focus</div>
        <h2 className="text-xl font-bold text-text-primary mb-6">{todayCheckIn.task}</h2>

        <div className="glass rounded-xl p-4 mb-6">
          <p className="text-text-secondary text-sm mb-1">That sounds like a big task.</p>
          <p className="text-text-primary font-semibold">What is the first tiny step?</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={firstStep}
            onChange={(e) => setFirstStep(e.target.value)}
            placeholder="e.g. Outline landing page sections"
            autoFocus
            className="w-full bg-bg-elevated border border-border rounded-xl px-5 py-4 text-lg text-text-primary placeholder:text-[rgba(136,136,160,0.4)] focus:outline-none focus:border-accent focus:shadow-[0_0_20px_var(--color-accent-glow)] transition-all duration-200 mb-6"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button type="submit" size="lg" className="flex-1">
              Set First Step
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
