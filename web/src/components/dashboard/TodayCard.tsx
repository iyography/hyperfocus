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
          <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            What would make today a win?
          </h2>
          <p className="text-secondary mb-6">Choose your most important task and lock in.</p>
          <Button size="lg" onClick={() => navigate('/app/checkin')}>
            Start Today's Focus
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card glow data-tour="today-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-secondary mb-1">Today's Focus</div>
            <h2 className="text-xl font-bold text-foreground mb-1">{todayCheckIn.task}</h2>
            {todayCheckIn.firstStep && (
              <p className="text-secondary text-sm">
                First step: {todayCheckIn.firstStep}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => navigate('/app/focus')} className="flex-shrink-0">
          Start Session
        </Button>
      </div>
    </Card>
  );
}
