import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { UserProfile, StreakInfo, FocusSession, CheckIn, UserSettings, DailyPlan, PlanTask } from '@shared/types';
import { MOCK_USER, MOCK_STREAK, MOCK_SESSIONS, MOCK_SETTINGS } from '@shared/mock';
import { XP_PER_SESSION, SHARE_BONUS_XP, getLevelForXp } from '@shared/constants/xp';

interface DemoState {
  isDemo: boolean;
  user: UserProfile;
  streak: StreakInfo;
  sessions: FocusSession[];
  todayCheckIn: CheckIn | null;
  settings: UserSettings;
  sharedToday: boolean;
  dailyPlan: DailyPlan | null;
}

type DemoAction =
  | { type: 'ENTER_DEMO' }
  | { type: 'EXIT_DEMO' }
  | { type: 'SET_CHECKIN'; payload: CheckIn }
  | { type: 'ADD_SESSION'; payload: FocusSession }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'MARK_SHARED' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'UPDATE_STREAK'; payload: Partial<StreakInfo> }
  | { type: 'SET_DAILY_PLAN'; payload: DailyPlan }
  | { type: 'UPDATE_DAILY_PLAN'; payload: Partial<DailyPlan> }
  | { type: 'ADD_PLAN_TASK'; payload: PlanTask }
  | { type: 'UPDATE_PLAN_TASK'; payload: { id: string; updates: Partial<PlanTask> } }
  | { type: 'REMOVE_PLAN_TASK'; payload: string };

const STORAGE_KEY = 'hyperfocus-app-state';

function loadPersistedState(): Partial<DemoState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function persistState(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const persisted = loadPersistedState();
const initialState: DemoState = persisted ? {
  ...{
    isDemo: false,
    user: MOCK_USER,
    streak: MOCK_STREAK,
    sessions: MOCK_SESSIONS,
    todayCheckIn: null,
    settings: MOCK_SETTINGS,
    sharedToday: false,
    dailyPlan: null,
  },
  ...persisted,
} : {
  isDemo: false,
  user: MOCK_USER,
  streak: MOCK_STREAK,
  sessions: MOCK_SESSIONS,
  todayCheckIn: null,
  settings: MOCK_SETTINGS,
  sharedToday: false,
  dailyPlan: null,
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'ENTER_DEMO':
      return { ...initialState, isDemo: true };
    case 'EXIT_DEMO':
      return { ...initialState, isDemo: false };
    case 'SET_CHECKIN':
      return { ...state, todayCheckIn: action.payload };
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
      };
    case 'ADD_XP': {
      const newXp = state.user.totalXp + action.payload;
      const newLevel = getLevelForXp(newXp);
      return {
        ...state,
        user: { ...state.user, totalXp: newXp, level: newLevel.level },
      };
    }
    case 'MARK_SHARED':
      return { ...state, sharedToday: true };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_STREAK':
      return { ...state, streak: { ...state.streak, ...action.payload } };
    case 'SET_DAILY_PLAN':
      return { ...state, dailyPlan: action.payload };
    case 'UPDATE_DAILY_PLAN':
      return {
        ...state,
        dailyPlan: state.dailyPlan ? { ...state.dailyPlan, ...action.payload } : null,
      };
    case 'ADD_PLAN_TASK': {
      if (state.dailyPlan) {
        return {
          ...state,
          dailyPlan: {
            ...state.dailyPlan,
            tasks: [...state.dailyPlan.tasks, action.payload],
          },
        };
      }
      const today = new Date().toISOString().split('T')[0];
      return {
        ...state,
        dailyPlan: {
          date: today,
          priority: '',
          tasks: [action.payload],
          reflection: '',
          focusRating: 0,
          completed: false,
        },
      };
    }
    case 'UPDATE_PLAN_TASK':
      return {
        ...state,
        dailyPlan: state.dailyPlan
          ? {
              ...state.dailyPlan,
              tasks: state.dailyPlan.tasks.map((t) =>
                t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
              ),
            }
          : null,
      };
    case 'REMOVE_PLAN_TASK':
      return {
        ...state,
        dailyPlan: state.dailyPlan
          ? {
              ...state.dailyPlan,
              tasks: state.dailyPlan.tasks.filter((t) => t.id !== action.payload),
            }
          : null,
      };
    default:
      return state;
  }
}

interface DemoContextValue {
  isDemo: boolean;
  user: UserProfile;
  streak: StreakInfo;
  sessions: FocusSession[];
  todayCheckIn: CheckIn | null;
  settings: UserSettings;
  sharedToday: boolean;
  dailyPlan: DailyPlan | null;
  setDailyPlan: (plan: DailyPlan) => void;
  updateDailyPlan: (patch: Partial<DailyPlan>) => void;
  addPlanTask: (task: PlanTask) => void;
  updatePlanTask: (id: string, updates: Partial<PlanTask>) => void;
  removePlanTask: (id: string) => void;
  enterDemo: () => void;
  exitDemo: () => void;
  setCheckIn: (task: string, firstStep: string | null) => void;
  completeSession: (task: string, firstStep: string | null, plannedDuration: number, actualDuration: number) => void;
  shareSession: (sessionId: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const enterDemo = useCallback(() => dispatch({ type: 'ENTER_DEMO' }), []);
  const exitDemo = useCallback(() => dispatch({ type: 'EXIT_DEMO' }), []);

  const setCheckIn = useCallback((task: string, firstStep: string | null) => {
    dispatch({
      type: 'SET_CHECKIN',
      payload: { task, firstStep, date: new Date().toISOString().split('T')[0] },
    });
  }, []);

  const completeSession = useCallback(
    (task: string, firstStep: string | null, plannedDuration: number, actualDuration: number) => {
      const session: FocusSession = {
        id: `s-${Date.now()}`,
        userId: state.user.id,
        task,
        firstStep,
        plannedDuration,
        actualDuration,
        completed: true,
        xpEarned: XP_PER_SESSION,
        shared: false,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_SESSION', payload: session });
      dispatch({ type: 'ADD_XP', payload: XP_PER_SESSION });
      dispatch({
        type: 'UPDATE_STREAK',
        payload: {
          currentStreak: state.streak.currentStreak + 1,
          longestStreak: Math.max(state.streak.longestStreak, state.streak.currentStreak + 1),
          lastSessionDate: new Date().toISOString().split('T')[0],
        },
      });
    },
    [state.user.id, state.streak.currentStreak, state.streak.longestStreak],
  );

  const shareSession = useCallback(
    (sessionId: string) => {
      if (state.sharedToday) return;

      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return;

      dispatch({ type: 'MARK_SHARED' });
      dispatch({ type: 'ADD_XP', payload: SHARE_BONUS_XP });
    },
    [state.sharedToday, state.sessions],
  );

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch });
  }, []);

  const setDailyPlan = useCallback((plan: DailyPlan) => {
    dispatch({ type: 'SET_DAILY_PLAN', payload: plan });
  }, []);

  const updateDailyPlan = useCallback((patch: Partial<DailyPlan>) => {
    dispatch({ type: 'UPDATE_DAILY_PLAN', payload: patch });
  }, []);

  const addPlanTask = useCallback((task: PlanTask) => {
    dispatch({ type: 'ADD_PLAN_TASK', payload: task });
  }, []);

  const updatePlanTask = useCallback((id: string, updates: Partial<PlanTask>) => {
    dispatch({ type: 'UPDATE_PLAN_TASK', payload: { id, updates } });
  }, []);

  const removePlanTask = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PLAN_TASK', payload: id });
  }, []);

  return (
    <DemoContext.Provider
      value={{
        ...state,
        setDailyPlan,
        updateDailyPlan,
        addPlanTask,
        updatePlanTask,
        removePlanTask,
        enterDemo,
        exitDemo,
        setCheckIn,
        completeSession,
        shareSession,
        updateSettings,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
