import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CheckInPage() {
  const [task, setTask] = useState('');
  const { setCheckIn } = useDemo();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setCheckIn(task.trim(), null);
    navigate('/app/breakdown');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <Card glow className="max-w-lg w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          What would make today a <span className="text-gradient">win</span>?
        </h1>
        <p className="text-secondary mb-8">
          Pick the one task that matters most right now.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Build landing page"
            autoFocus
            className="w-full bg-input border border-input-border rounded-xl px-5 py-4 text-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200 mb-6"
          />
          <Button type="submit" size="lg" disabled={!task.trim()} className="w-full">
            Set Today's Focus
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
