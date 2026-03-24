import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import type { PlanTask, DailyPlan } from '@shared/types';

const ESTIMATE_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
];

const MAX_HOURS = 8;
const MAX_MINUTES = MAX_HOURS * 60;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getCapacityColor(ratio: number): string {
  if (ratio > 1) return 'bg-red-500';
  if (ratio > 0.8) return 'bg-orange-500';
  if (ratio > 0.6) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

function getCapacityVariant(ratio: number): 'success' | 'warning' | 'accent' | 'muted' {
  if (ratio > 1) return 'warning';
  if (ratio > 0.8) return 'warning';
  if (ratio > 0.6) return 'accent';
  return 'success';
}

export default function PlanningPage() {
  const navigate = useNavigate();
  const {
    dailyPlan,
    setDailyPlan,
    updateDailyPlan,
    addPlanTask,
    updatePlanTask,
    removePlanTask,
    todayCheckIn,
    setCheckIn,
  } = useDemo();

  const today = getToday();
  const isExistingPlan = dailyPlan?.date === today;

  // Local form state
  const [priority, setPriority] = useState(
    isExistingPlan ? dailyPlan.priority : todayCheckIn?.task ?? '',
  );
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(30);
  const [planSaved, setPlanSaved] = useState(false);

  // Tasks from the plan or empty
  const tasks: PlanTask[] = isExistingPlan ? dailyPlan.tasks : [];
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimate, 0);
  const capacityRatio = totalMinutes / MAX_MINUTES;
  const doneTasks = tasks.filter((t) => t.done).length;

  // Carried-over tasks from yesterday
  const carriedOver = tasks.filter((t) => t.movedToTomorrow);
  // For display, we also check if there was a previous plan with movedToTomorrow tasks
  // In demo mode, carried over tasks would already be in the plan

  // Ensure plan exists in provider
  function ensurePlan(): DailyPlan {
    if (!isExistingPlan) {
      const plan: DailyPlan = {
        date: today,
        priority: priority.trim(),
        tasks: [],
        reflection: '',
        focusRating: 0,
        completed: false,
      };
      setDailyPlan(plan);
      return plan;
    }
    return dailyPlan;
  }

  function handleSetPriority() {
    if (!priority.trim()) return;
    if (!isExistingPlan) {
      const plan: DailyPlan = {
        date: today,
        priority: priority.trim(),
        tasks: [],
        reflection: '',
        focusRating: 0,
        completed: false,
      };
      setDailyPlan(plan);
    } else {
      updateDailyPlan({ priority: priority.trim() });
    }
    setCheckIn(priority.trim(), null);
  }

  function handleAddTask() {
    if (!newTaskText.trim()) return;
    ensurePlan();
    const task: PlanTask = {
      id: generateId(),
      text: newTaskText.trim(),
      estimate: newTaskEstimate,
      done: false,
      movedToTomorrow: false,
    };
    addPlanTask(task);
    setNewTaskText('');
    setNewTaskEstimate(30);
  }

  function handleToggleDone(id: string, done: boolean) {
    updatePlanTask(id, { done: !done });
  }

  function handleMoveTask(index: number, direction: 'up' | 'down') {
    if (!isExistingPlan) return;
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTasks.length) return;
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    updateDailyPlan({ tasks: newTasks });
  }

  function handleSavePlan() {
    handleSetPriority();
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 2000);
  }

  function handleStartFirstTask() {
    handleSetPriority();
    const firstUndone = tasks.find((t) => !t.done);
    if (firstUndone) {
      setCheckIn(firstUndone.text, null);
    }
    navigate('/app/focus');
  }

  function handleAddCarriedTask(task: PlanTask) {
    const newTask: PlanTask = {
      ...task,
      id: generateId(),
      movedToTomorrow: false,
      done: false,
    };
    ensurePlan();
    addPlanTask(newTask);
  }

  function handleDismissCarried(id: string) {
    removePlanTask(id);
  }

  const priorityIsSet = isExistingPlan && dailyPlan.priority;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center pt-4"
      >
        <Badge variant="accent" className="mb-4">Morning Ritual</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Plan Your Day
        </h1>
        <p className="text-secondary max-w-md mx-auto">
          Define what success looks like today. Every minute planned is a minute reclaimed.
        </p>
      </motion.div>

      {/* Carried Over Tasks */}
      {carriedOver.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card glow className="border-warning/30 bg-warning-soft/5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-warning">
                These tasks carried over from yesterday
              </span>
            </div>
            <div className="space-y-2">
              {carriedOver.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between bg-surface/50 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-foreground text-sm">{task.text}</span>
                    <Badge variant="muted">{formatMinutes(task.estimate)}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddCarriedTask(task)}
                    >
                      Add to Today
                    </Button>
                    <button
                      onClick={() => handleDismissCarried(task.id)}
                      className="text-secondary hover:text-foreground transition-colors p-1"
                      aria-label="Dismiss task"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 1: #1 Priority */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-semibold text-foreground">#1 Priority</h2>
            {priorityIsSet && (
              <Badge variant="success" className="ml-auto">Set</Badge>
            )}
          </div>
          <p className="text-secondary text-sm mb-4">
            What's the ONE thing that would make today a win?
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="e.g. Ship the landing page redesign"
              className="flex-1 bg-input border border-input-border rounded-xl px-5 py-4 text-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200"
            />
            <Button
              onClick={handleSetPriority}
              disabled={!priority.trim()}
              variant={priorityIsSet ? 'secondary' : 'primary'}
            >
              {priorityIsSet ? 'Update' : 'Set'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Step 2: Task List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-semibold text-foreground">Break it into actionable tasks</h2>
          </div>

          {/* Add task row */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              placeholder="Add a task..."
              className="flex-1 bg-input border border-input-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200"
            />
            <select
              value={newTaskEstimate}
              onChange={(e) => setNewTaskEstimate(Number(e.target.value))}
              className="bg-input border border-input-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200 cursor-pointer"
            >
              {ESTIMATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button onClick={handleAddTask} disabled={!newTaskText.trim()} size="md">
              Add
            </Button>
          </div>

          {/* Task list */}
          {tasks.filter((t) => !t.movedToTomorrow).length === 0 ? (
            <div className="text-center py-8 text-secondary text-sm">
              No tasks yet. Add your first task above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks
                .filter((t) => !t.movedToTomorrow)
                .map((task, index) => {
                  const actualIndex = tasks.indexOf(task);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 bg-surface/50 rounded-xl px-4 py-3 group"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleDone(task.id, task.done)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          task.done
                            ? 'bg-accent border-accent text-white'
                            : 'border-themed-border hover:border-accent/50'
                        }`}
                        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.done && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Task text */}
                      <span
                        className={`flex-1 text-sm transition-all duration-200 ${
                          task.done ? 'line-through text-muted' : 'text-foreground'
                        }`}
                      >
                        {task.text}
                      </span>

                      {/* Estimate badge */}
                      <Badge variant={task.done ? 'muted' : 'accent'}>
                        {formatMinutes(task.estimate)}
                      </Badge>

                      {/* Reorder arrows */}
                      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveTask(actualIndex, 'up')}
                          disabled={actualIndex === 0}
                          className="text-secondary hover:text-foreground disabled:opacity-30 transition-colors p-0.5"
                          aria-label="Move up"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveTask(actualIndex, 'down')}
                          disabled={actualIndex === tasks.length - 1}
                          className="text-secondary hover:text-foreground disabled:opacity-30 transition-colors p-0.5"
                          aria-label="Move down"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removePlanTask(task.id)}
                        className="text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1"
                        aria-label="Remove task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Step 3: Workload Capacity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm">
              3
            </div>
            <h2 className="text-lg font-semibold text-foreground">Workload Capacity</h2>
            <Badge variant={getCapacityVariant(capacityRatio)} className="ml-auto">
              {formatMinutes(totalMinutes)} planned / {MAX_HOURS} hrs available
            </Badge>
          </div>

          <ProgressBar
            progress={Math.min(capacityRatio, 1)}
            color={getCapacityColor(capacityRatio)}
            className="mb-3"
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">
              {tasks.filter((t) => !t.movedToTomorrow).length} tasks &middot;{' '}
              {doneTasks} done
            </span>
            {capacityRatio > 1 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm font-medium"
              >
                You're overcommitted. Consider removing or shortening some tasks.
              </motion.span>
            )}
            {capacityRatio <= 1 && capacityRatio > 0 && (
              <span className="text-secondary">
                {formatMinutes(MAX_MINUTES - totalMinutes)} remaining
              </span>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Step 4: Ready to Focus */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card glow>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent font-bold text-sm">
              4
            </div>
            <h2 className="text-lg font-semibold text-foreground">Ready to Focus</h2>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface/50 rounded-xl p-4 text-center">
              <div className="text-xs text-secondary uppercase tracking-wider mb-1">Priority</div>
              <div className="text-sm font-medium text-foreground truncate">
                {priority || 'Not set'}
              </div>
            </div>
            <div className="bg-surface/50 rounded-xl p-4 text-center">
              <div className="text-xs text-secondary uppercase tracking-wider mb-1">Tasks</div>
              <div className="text-2xl font-bold text-foreground">
                {tasks.filter((t) => !t.movedToTomorrow).length}
              </div>
            </div>
            <div className="bg-surface/50 rounded-xl p-4 text-center">
              <div className="text-xs text-secondary uppercase tracking-wider mb-1">Time</div>
              <div className="text-2xl font-bold text-foreground">
                {formatMinutes(totalMinutes)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleStartFirstTask}
              size="lg"
              className="flex-1"
              disabled={tasks.filter((t) => !t.done && !t.movedToTomorrow).length === 0 && !priority.trim()}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Start First Task
            </Button>
            <Button
              onClick={handleSavePlan}
              variant="secondary"
              size="lg"
              disabled={!priority.trim()}
            >
              {planSaved ? 'Saved!' : 'Save Plan'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
