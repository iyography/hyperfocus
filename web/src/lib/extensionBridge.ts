// Extension Bridge - communicates with the Hyperfocus Chrome extension
// Uses window.postMessage to talk to the content script

export interface ExtensionState {
  isSessionActive: boolean;
  sessionTask: string;
  isPaused: boolean;
  isBreak: boolean;
  focusDuration: number;
  breakDuration: number;
  sessionsToday: number;
  totalFocusToday: number;
  xpToday: number;
  distractionCount: number;
  tabSwitchCount: number;
  savedTabs: Array<{ url: string; title: string; favicon: string; savedAt: number }>;
  distractionSites: Array<{ id: string; urlPattern: string; label: string; enabled: boolean }>;
  tabLimit: number;
  nudgeInterval: number;
  breakReminders: boolean;
  notificationSound: boolean;
  feedHiding: boolean;
  focusModeOptions: {
    blockSites: boolean;
    hideFeeds: boolean;
    limitTabs: boolean;
    muteNotifications: boolean;
    autoBreak: boolean;
    grayscale: boolean;
    scoring: boolean;
  };
  userProfile: { level: number; displayName: string; totalXp: number };
  streak: { currentStreak: number; longestStreak: number; lastSessionDate: string | null };
  dailyPriority: string;
  tasks: Array<{ id: string; text: string; estimate: number; done: boolean; movedToTomorrow: boolean }>;
  planDate: string;
}

const MSG_PREFIX = 'hyperfocus-bridge';

// Check if extension is available
export function isExtensionAvailable(): boolean {
  return !!(window as any).__HYPERFOCUS_EXTENSION__;
}

// Send a message to the extension via content script
function sendToExtension(type: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = `${MSG_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const handler = (event: MessageEvent) => {
      if (event.data?.source === 'hyperfocus-extension' && event.data?.responseId === id) {
        window.removeEventListener('message', handler);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.payload);
        }
      }
    };

    window.addEventListener('message', handler);

    // Timeout after 3 seconds
    setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('Extension communication timeout'));
    }, 3000);

    window.postMessage({
      source: 'hyperfocus-webapp',
      type,
      requestId: id,
      payload: data,
    }, '*');
  });
}

// Get full state from extension
export async function getExtensionState(): Promise<ExtensionState | null> {
  try {
    return await sendToExtension('GET_STATE');
  } catch {
    return null;
  }
}

// Update settings in extension
export async function updateExtensionSettings(settings: Partial<ExtensionState>): Promise<boolean> {
  try {
    await sendToExtension('UPDATE_STATE', settings);
    return true;
  } catch {
    return false;
  }
}

// Start a focus session via extension
export async function startExtensionSession(task: string, duration: number): Promise<boolean> {
  try {
    await sendToExtension('START_SESSION', { task, duration });
    return true;
  } catch {
    return false;
  }
}

// Stop current session via extension
export async function stopExtensionSession(): Promise<boolean> {
  try {
    await sendToExtension('STOP_SESSION');
    return true;
  } catch {
    return false;
  }
}

// Sync planning data to extension
export async function syncPlanToExtension(priority: string, tasks: any[]): Promise<boolean> {
  try {
    await sendToExtension('SYNC_PLAN', { dailyPriority: priority, tasks });
    return true;
  } catch {
    return false;
  }
}

// Listen for state changes from extension
export function onExtensionStateChange(callback: (state: Partial<ExtensionState>) => void): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data?.source === 'hyperfocus-extension' && event.data?.type === 'STATE_CHANGED') {
      callback(event.data.payload);
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
