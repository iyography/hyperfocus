import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function TodayCard() {
  const { todayCheckIn } = useDemo();
  const navigate = useNavigate();

  if (!todayCheckIn) {
    return (
      <Card glow className="text-center py-12" data-tour="today-card">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            What would make today a win?
          </h2>
          <p className="text-text-secondary mb-6">Choose your most important task and lock in.</p>
          <Button size="lg" onClick={() => navigate('/app/checkin')}>
            Start Today's Focus
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card glow data-tour="today-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-text-secondary mb-1">Today's Focus</div>
          <h2 className="text-xl font-bold text-text-primary mb-1">{todayCheckIn.task}</h2>
          {todayCheckIn.firstStep && (
            <p className="text-text-secondary text-sm">
              First step: {todayCheckIn.firstStep}
            </p>
          )}
        </div>
        <Button onClick={() => navigate('/app/focus')}>
          Start Session
        </Button>
      </div>
    </Card>
  );
}
