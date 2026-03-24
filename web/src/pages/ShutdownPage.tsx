import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import type { PlanTask } from '@shared/types';

const TOTAL_STEPS = 4;

export default function ShutdownPage() {
  const { dailyPlan, updateDailyPlan, updatePlanTask, removePlanTask, addPlanTask } = useDemo();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [focusRating, setFocusRating] = useState(dailyPlan?.focusRating ?? 0);
  const [wentWell, setWentWell] = useState('');
  const [couldBeBetter, setCouldBeBetter] = useState('');
  const [tomorrowTask, setTomorrowTask] = useState('');
  const [finished, setFinished] = useState(false);

  // Build a working copy of tasks from the plan
  const tasks: PlanTask[] = dailyPlan?.tasks ?? [];
  const completedTasks = tasks.filter((t) => t.done);
  const incompleteTasks = tasks.filter((t) => !t.done && !t.movedToTomorrow);
  const movedTasks = tasks.filter((t) => t.movedToTomorrow);
  const completionPct = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (task) updatePlanTask(id, { done: !task.done });
  }

  function moveToTomorrow(id: string) {
    updatePlanTask(id, { movedToTomorrow: true });
  }

  function dropTask(id: string) {
    removePlanTask(id);
  }

  function handleFinish() {
    const reflection = [wentWell && `What went well: ${wentWell}`, couldBeBetter && `Could be better: ${couldBeBetter}`]
      .filter(Boolean)
      .join('\n');

    updateDailyPlan({
      focusRating,
      reflection,
      completed: true,
    });

    if (tomorrowTask.trim()) {
      addPlanTask({
        id: `pt-${Date.now()}`,
        text: tomorrowTask.trim(),
        estimate: 25,
        done: false,
        movedToTomorrow: false,
      });
    }

    setFinished(true);
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
      >
        <div className="text-6xl">🌙</div>
        <h1 className="text-3xl font-bold text-foreground">Shutdown Complete</h1>
        <p className="text-secondary text-lg max-w-md">
          Great work today. Your mind is clear and tomorrow is prepped. Time to rest.
        </p>
        <Button size="lg" onClick={() => navigate('/app')}>
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Daily Shutdown Ritual</h1>
        <p className="text-secondary mt-1 text-lg">Review what you accomplished and prepare for tomorrow</p>
        <div className="mt-4">
          <ProgressBar progress={(step / TOTAL_STEPS) * 100} />
          <p className="text-xs text-secondary mt-1.5">Step {step} of {TOTAL_STEPS}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Review Today's Tasks */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-1">Review Today's Tasks</h2>
              <p className="text-sm text-secondary mb-4">
                {completedTasks.length} of {tasks.length} tasks completed
              </p>
              <ProgressBar progress={completionPct} />

              {tasks.length === 0 ? (
                <p className="text-secondary text-sm mt-4">No tasks planned for today.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 w-5 h-5 rounded border-2 border-themed-border flex items-center justify-center transition-colors cursor-pointer hover:border-accent"
                        style={task.done ? { backgroundColor: 'var(--th-accent)', borderColor: 'var(--th-accent)' } : undefined}
                      >
                        {task.done && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={task.done ? 'line-through text-secondary' : 'text-foreground'}>
                        {task.text}
                      </span>
                      {task.movedToTomorrow && (
                        <Badge variant="muted">Tomorrow</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setStep(incompleteTasks.length > 0 ? 2 : 3)}>
                Next
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Handle Incomplete Tasks */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-1">Handle Incomplete Tasks</h2>
              <p className="text-sm text-secondary mb-4">
                Decide what to do with tasks you didn't finish.
              </p>

              {incompleteTasks.length === 0 ? (
                <p className="text-secondary text-sm">All caught up! No incomplete tasks.</p>
              ) : (
                <ul className="space-y-4">
                  {incompleteTasks.map((task) => (
                    <li key={task.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-surface border border-themed-border">
                      <span className="flex-1 text-foreground">{task.text}</span>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => moveToTomorrow(task.id)}>
                          Move to Tomorrow
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => dropTask(task.id)}>
                          Drop It
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Daily Reflection */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Daily Reflection</h2>

              {/* Focus Rating */}
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-2">How focused were you today?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFocusRating(n)}
                      className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-2 ${
                        focusRating >= n
                          ? 'bg-accent text-white border-accent shadow-[0_2px_12px_var(--th-accent-glow)]'
                          : 'bg-surface text-secondary border-themed-border hover:border-accent/30'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* What went well */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  What went well?
                </label>
                <textarea
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="e.g., Finished the design review in one focused sprint..."
                  className="w-full rounded-xl bg-surface border border-themed-border text-foreground placeholder:text-secondary/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  rows={3}
                />
              </div>

              {/* What could be better */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  What could be better?
                </label>
                <textarea
                  value={couldBeBetter}
                  onChange={(e) => setCouldBeBetter(e.target.value)}
                  placeholder="e.g., Got distracted by Slack after the first session..."
                  className="w-full rounded-xl bg-surface border border-themed-border text-foreground placeholder:text-secondary/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                  rows={3}
                />
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(incompleteTasks.length > 0 ? 2 : 1)}>Back</Button>
              <Button onClick={() => setStep(4)}>Next</Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Plan Tomorrow Preview */}
        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-1">Plan Tomorrow</h2>
              <p className="text-sm text-secondary mb-4">
                Want to get a head start on tomorrow?
              </p>

              {/* Moved tasks */}
              {movedTasks.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                    Moved to Tomorrow
                  </p>
                  <ul className="space-y-2">
                    {movedTasks.map((task) => (
                      <li key={task.id} className="flex items-center gap-2 text-sm text-foreground">
                        <Badge variant="muted">Carried</Badge>
                        {task.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick add */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Tomorrow's top priority
                </label>
                <input
                  type="text"
                  value={tomorrowTask}
                  onChange={(e) => setTomorrowTask(e.target.value)}
                  placeholder="e.g., Ship the landing page"
                  className="w-full rounded-xl bg-surface border border-themed-border text-foreground placeholder:text-secondary/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all"
                />
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button size="lg" onClick={handleFinish}>
                Finish Shutdown
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
