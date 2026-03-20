export interface FocusSession {
  id: string;
  userId: string;
  task: string;
  firstStep: string | null;
  plannedDuration: number; // seconds
  actualDuration: number; // seconds
  completed: boolean;
  xpEarned: number;
  shared: boolean;
  createdAt: string;
}

export interface CheckIn {
  task: string;
  firstStep: string | null;
  date: string; // YYYY-MM-DD
}

export type TimerStatus = 'idle' | 'focusing' | 'paused' | 'break' | 'overtime' | 'complete';
