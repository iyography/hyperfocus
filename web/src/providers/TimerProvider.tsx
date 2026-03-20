import { createContext, useContext, useReducer, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { TimerStatus } from '@shared/types/session';

interface TimerState {
  status: TimerStatus;
  focusDuration: number;
  breakDuration: number;
  elapsed: number;
  taskName: string;
  taskStep: string | null;
}

type TimerAction =
  | { type: 'CONFIGURE'; focusDuration: number; breakDuration: number }
  | { type: 'START_FOCUS'; taskName: string; taskStep: string | null }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'COMPLETE_FOCUS' }
  | { type: 'START_BREAK' }
  | { type: 'ENTER_OVERTIME' }
  | { type: 'RESET' };

const initialState: TimerState = {
  status: 'idle',
  focusDuration: 25 * 60,
  breakDuration: 5 * 60,
  elapsed: 0,
  taskName: '',
  taskStep: null,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'CONFIGURE':
      return { ...state, focusDuration: action.focusDuration, breakDuration: action.breakDuration };
    case 'START_FOCUS':
      return { ...state, status: 'focusing', elapsed: 0, taskName: action.taskName, taskStep: action.taskStep };
    case 'PAUSE':
      return { ...state, status: 'paused' };
    case 'RESUME':
      return { ...state, status: 'focusing' };
    case 'TICK':
      return { ...state, elapsed: state.elapsed + 1 };
    case 'COMPLETE_FOCUS':
      return { ...state, status: 'complete' };
    case 'START_BREAK':
      return { ...state, status: 'break', elapsed: 0 };
    case 'ENTER_OVERTIME':
      return { ...state, status: 'overtime' };
    case 'RESET':
      return { ...initialState, focusDuration: state.focusDuration, breakDuration: state.breakDuration };
    default:
      return state;
  }
}

interface TimerContextValue extends TimerState {
  timeRemaining: number;
  progress: number;
  configure: (focusDuration: number, breakDuration: number) => void;
  startFocus: (taskName: string, taskStep: string | null) => void;
  pause: () => void;
  resume: () => void;
  completeFocus: () => void;
  startBreak: () => void;
  reset: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick effect using Date.now() for accuracy
  useEffect(() => {
    if (state.status === 'focusing' || state.status === 'break' || state.status === 'overtime') {
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = state.elapsed;

      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);

      return clearTimer;
    } else {
      clearTimer();
    }
  }, [state.status, clearTimer]);

  // Auto-complete focus when time runs out
  useEffect(() => {
    if (state.status === 'focusing' && state.elapsed >= state.focusDuration) {
      dispatch({ type: 'COMPLETE_FOCUS' });
    }
  }, [state.status, state.elapsed, state.focusDuration]);

  // Auto enter overtime when break is done
  useEffect(() => {
    if (state.status === 'break' && state.elapsed >= state.breakDuration) {
      dispatch({ type: 'ENTER_OVERTIME' });
    }
  }, [state.status, state.elapsed, state.breakDuration]);

  const currentDuration =
    state.status === 'break' || state.status === 'overtime'
      ? state.breakDuration
      : state.focusDuration;

  const timeRemaining = Math.max(0, currentDuration - state.elapsed);
  const progress = currentDuration > 0 ? Math.min(1, state.elapsed / currentDuration) : 0;

  const value: TimerContextValue = {
    ...state,
    timeRemaining,
    progress,
    configure: useCallback((focusDuration: number, breakDuration: number) => {
      dispatch({ type: 'CONFIGURE', focusDuration, breakDuration });
    }, []),
    startFocus: useCallback((taskName: string, taskStep: string | null) => {
      dispatch({ type: 'START_FOCUS', taskName, taskStep });
    }, []),
    pause: useCallback(() => dispatch({ type: 'PAUSE' }), []),
    resume: useCallback(() => dispatch({ type: 'RESUME' }), []),
    completeFocus: useCallback(() => dispatch({ type: 'COMPLETE_FOCUS' }), []),
    startBreak: useCallback(() => dispatch({ type: 'START_BREAK' }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
