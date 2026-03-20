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
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          What would make today a <span className="text-accent">win</span>?
        </h1>
        <p className="text-text-secondary mb-8">
          Pick the one task that matters most right now.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Build landing page"
            autoFocus
            className="w-full bg-bg-elevated border border-border rounded-xl px-5 py-4 text-lg text-text-primary placeholder:text-[rgba(136,136,160,0.4)] focus:outline-none focus:border-accent focus:shadow-[0_0_20px_var(--color-accent-glow)] transition-all duration-200 mb-6"
          />
          <Button type="submit" size="lg" disabled={!task.trim()} className="w-full">
            Set Today's Focus
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
