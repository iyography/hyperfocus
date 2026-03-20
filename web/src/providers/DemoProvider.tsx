import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { UserProfile, StreakInfo, FocusSession, CheckIn, UserSettings } from '@shared/types';
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
}

type DemoAction =
  | { type: 'ENTER_DEMO' }
  | { type: 'EXIT_DEMO' }
  | { type: 'SET_CHECKIN'; payload: CheckIn }
  | { type: 'ADD_SESSION'; payload: FocusSession }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'MARK_SHARED' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'UPDATE_STREAK'; payload: Partial<StreakInfo> };

const initialState: DemoState = {
  isDemo: false,
  user: MOCK_USER,
  streak: MOCK_STREAK,
  sessions: MOCK_SESSIONS,
  todayCheckIn: null,
  settings: MOCK_SETTINGS,
  sharedToday: false,
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

  return (
    <DemoContext.Provider
      value={{
        ...state,
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
