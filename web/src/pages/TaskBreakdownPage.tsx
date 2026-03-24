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
      className="min-h-[70vh] flex items-center"
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main content - left 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Original intention label */}
            <div>
              <p className="uppercase tracking-widest text-xs text-secondary mb-2">
                Original Intention
              </p>
              <p className="text-foreground italic text-lg">"{todayCheckIn.task}"</p>
            </div>

            {/* Big heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              That sounds like a{' '}
              <span className="text-accent">big task.</span>
              <br />
              What is the first tiny step?
            </h1>

            {/* Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={firstStep}
                onChange={(e) => setFirstStep(e.target.value)}
                placeholder="Type your first actionable micro-step..."
                autoFocus
                className="w-full bg-input border border-input-border rounded-2xl px-6 py-5 text-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200"
              />
              <p className="text-secondary text-sm">
                Suggested: "Open Figma design file" or "Create task list"
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                <Button type="submit" size="lg" className="px-10 rounded-full">
                  Start Focus Session
                </Button>
              </div>
            </form>
          </div>

          {/* Side cards - right col */}
          <div className="space-y-5">
            {/* Newton's First Law card */}
            <Card className="relative overflow-hidden">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-xs text-secondary mb-1">Science Tip</p>
                  <h3 className="text-base font-bold text-foreground">Newton's First Law</h3>
                </div>
              </div>
              <p className="text-secondary text-sm leading-relaxed">
                An object at rest stays at rest. The first 2 minutes of a task are the most critical for overcoming procrastination.
              </p>
            </Card>

            {/* Focus Hub mini card */}
            <Card className="text-center">
              <p className="uppercase tracking-widest text-xs text-secondary mb-2">Focus Hub</p>
              <div className="text-3xl font-mono font-bold text-accent tabular-nums">25:00</div>
              <p className="text-xs text-secondary mt-1">Ready to begin</p>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
