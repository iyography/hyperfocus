// =============================================================================
// Hyperfocus Extension - Background Service Worker
// Full-featured focus engine: timers, distraction detection, nudges, analytics
// =============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALARM_TICK = 'hyperfocus-tick';
const ALARM_COMPLETE = 'hyperfocus-complete';
const ALARM_BREAK_COMPLETE = 'hyperfocus-break-complete';
const ALARM_NUDGE = 'hyperfocus-nudge';

const NUDGE_MESSAGES = [
  'Hey, are you focusing on the most important thing right now?',
  'Quick check: Is what you\'re doing right now moving the needle?',
  'THIS is the task you chose to work on. Are you still on it?',
  'Pause. Breathe. Are you working on what matters most?',
];

const FEED_HIDING_CSS = {
  'youtube.com': `
    #contents.ytd-rich-grid-renderer,
    #related,
    #secondary-inner,
    ytd-watch-next-secondary-results-renderer { display: none !important; }
    ytd-compact-video-renderer,
    ytd-compact-radio-renderer { filter: blur(10px) !important; pointer-events: none !important; }
  `,
  'twitter.com': `
    [data-testid="primaryColumn"] section[role="region"],
    [aria-label="Timeline: Trending now"],
    [data-testid="trend"] { display: none !important; }
  `,
  'x.com': `
    [data-testid="primaryColumn"] section[role="region"],
    [aria-label="Timeline: Trending now"],
    [data-testid="trend"] { display: none !important; }
  `,
  'reddit.com': `
    .ListingLayout-outerContainer main,
    shreddit-feed,
    .Feed { display: none !important; }
  `,
  'instagram.com': `
    main article,
    main section > div > div > div { display: none !important; }
  `,
  'facebook.com': `
    [role="feed"],
    div[data-pagelet="FeedUnit"],
    div[data-pagelet="RightRail"] { display: none !important; }
  `,
  'tiktok.com': `
    [data-e2e="recommend-list-item-container"],
    .tiktok-feed { display: none !important; }
  `,
};

const DEFAULT_STATE = {
  isSessionActive: false,
  sessionTask: '',
  sessionStartTime: null,
  sessionPausedAt: null,
  sessionPausedElapsed: 0,
  focusDuration: 1500,
  breakDuration: 300,
  isBreak: false,
  isPaused: false,
  sessionsToday: 0,
  totalFocusToday: 0,
  xpToday: 0,
  distractionCount: 0,
  tabSwitchCount: 0,

  // Settings
  distractionSites: [],
  tabLimit: 15,
  nudgeInterval: 30,
  breakReminders: true,
  notificationSound: true,
  feedHiding: true,
  focusModeOptions: {
    blockSites: true,
    hideFeeds: true,
    limitTabs: true,
    muteNotifications: false,
  },

  // Saved tabs
  savedTabs: [], // [{url, title, favicon, savedAt}]

  // Planning
  dailyPriority: '',
  tasks: [],
  planDate: '',

  // User
  userProfile: { level: 1, displayName: 'User', totalXp: 0 },
  streak: { currentStreak: 0, longestStreak: 0, lastSessionDate: null },
};

// Per-session distraction frequency tracker (in-memory only, resets each session)
let sessionDistractionFrequency = {};
let nudgeIndex = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getState(keys) {
  return chrome.storage.local.get(keys);
}

async function setState(updates) {
  return chrome.storage.local.set(updates);
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function notify(id, title, message) {
  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: '/icons/icon-128.png',
    title,
    message,
    priority: 2,
  });
}

// ---------------------------------------------------------------------------
// 1. Installation & Daily Reset
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Hyperfocus] Extension installed');

  // Register side panel
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({
      path: 'src/popup/index.html',
      enabled: true,
    });
  }

  // Merge defaults -- don't overwrite existing keys
  const existing = await getState(Object.keys(DEFAULT_STATE));
  const merged = { ...DEFAULT_STATE };
  for (const [key, val] of Object.entries(existing)) {
    if (val !== undefined && val !== null) {
      merged[key] = val;
    }
  }
  merged.planDate = todayDateString();
  await setState(merged);

  // Context menu
  chrome.contextMenus.create({
    id: 'add-distraction-site',
    title: 'Add this site to distractions',
    contexts: ['page'],
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

async function checkDailyReset() {
  const { planDate } = await getState(['planDate']);
  const today = todayDateString();
  if (planDate && planDate !== today) {
    console.log('[Hyperfocus] New day detected, resetting daily stats');
    await setState({
      sessionsToday: 0,
      totalFocusToday: 0,
      xpToday: 0,
      planDate: today,
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Timer / Session Management
// ---------------------------------------------------------------------------

async function startSession({ task, duration, breakDuration }) {
  const focusDur = duration || 1500;
  const breakDur = breakDuration || 300;
  const { nudgeInterval } = await getState(['nudgeInterval']);

  sessionDistractionFrequency = {};

  await setState({
    isSessionActive: true,
    sessionTask: task || '',
    sessionStartTime: Date.now(),
    sessionPausedAt: null,
    sessionPausedElapsed: 0,
    focusDuration: focusDur,
    breakDuration: breakDur,
    isBreak: false,
    isPaused: false,
    distractionCount: 0,
    tabSwitchCount: 0,
  });

  // Create alarms
  chrome.alarms.create(ALARM_TICK, { periodInMinutes: 1 });
  chrome.alarms.create(ALARM_COMPLETE, { delayInMinutes: focusDur / 60 });

  const nudgeMin = nudgeInterval || 30;
  chrome.alarms.create(ALARM_NUDGE, {
    delayInMinutes: nudgeMin,
    periodInMinutes: nudgeMin,
  });

  updateBadge();
  console.log(`[Hyperfocus] Session started: "${task}" for ${focusDur / 60}m`);
}

async function pauseSession() {
  const { isSessionActive, isPaused } = await getState(['isSessionActive', 'isPaused']);
  if (!isSessionActive || isPaused) return;

  await setState({ isPaused: true, sessionPausedAt: Date.now() });

  // Clear tick-based alarms while paused
  await chrome.alarms.clear(ALARM_TICK);
  await chrome.alarms.clear(ALARM_COMPLETE);
  await chrome.alarms.clear(ALARM_NUDGE);

  chrome.action.setBadgeText({ text: '||' });
  chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
  console.log('[Hyperfocus] Session paused');
}

async function resumeSession() {
  const state = await getState([
    'isSessionActive', 'isPaused', 'sessionPausedAt', 'sessionPausedElapsed',
    'sessionStartTime', 'focusDuration', 'nudgeInterval',
  ]);
  if (!state.isSessionActive || !state.isPaused) return;

  const additionalPaused = Date.now() - (state.sessionPausedAt || Date.now());
  const totalPaused = (state.sessionPausedElapsed || 0) + additionalPaused;

  // Recalculate remaining time
  const elapsed = Date.now() - state.sessionStartTime - totalPaused;
  const remaining = (state.focusDuration * 1000) - elapsed;

  await setState({
    isPaused: false,
    sessionPausedAt: null,
    sessionPausedElapsed: totalPaused,
  });

  // Re-create alarms
  chrome.alarms.create(ALARM_TICK, { periodInMinutes: 1 });
  if (remaining > 0) {
    chrome.alarms.create(ALARM_COMPLETE, { delayInMinutes: remaining / 60000 });
  }

  const nudgeMin = state.nudgeInterval || 30;
  chrome.alarms.create(ALARM_NUDGE, {
    delayInMinutes: nudgeMin,
    periodInMinutes: nudgeMin,
  });

  updateBadge();
  console.log('[Hyperfocus] Session resumed');
}

async function endSession() {
  const state = await getState([
    'isSessionActive', 'sessionStartTime', 'sessionPausedElapsed',
    'focusDuration', 'sessionsToday', 'totalFocusToday', 'xpToday',
    'distractionCount', 'tabSwitchCount', 'userProfile', 'streak',
    'breakReminders', 'isPaused', 'sessionPausedAt',
  ]);

  if (!state.isSessionActive) return;

  // Account for pause if currently paused
  let totalPaused = state.sessionPausedElapsed || 0;
  if (state.isPaused && state.sessionPausedAt) {
    totalPaused += Date.now() - state.sessionPausedAt;
  }

  const elapsedMs = Date.now() - state.sessionStartTime - totalPaused;
  const elapsedSec = Math.round(elapsedMs / 1000);

  // XP: 1 XP per minute focused, bonus for low distractions
  const minutes = Math.floor(elapsedSec / 60);
  let xp = minutes;
  if ((state.distractionCount || 0) === 0) xp += 10; // distraction-free bonus
  if (minutes >= Math.floor(state.focusDuration / 60)) xp += 5; // completion bonus

  // Focus score
  const focusScore = Math.max(
    0,
    100 - (state.distractionCount || 0) * 10 - (state.tabSwitchCount || 0) * 2,
  );

  // Update profile
  const profile = state.userProfile || DEFAULT_STATE.userProfile;
  profile.totalXp = (profile.totalXp || 0) + xp;
  profile.level = Math.floor(profile.totalXp / 100) + 1;

  // Update streak
  const streak = state.streak || DEFAULT_STATE.streak;
  const today = todayDateString();
  if (streak.lastSessionDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (streak.lastSessionDate === yesterdayStr) {
      streak.currentStreak = (streak.currentStreak || 0) + 1;
    } else {
      streak.currentStreak = 1;
    }
    streak.longestStreak = Math.max(streak.longestStreak || 0, streak.currentStreak);
    streak.lastSessionDate = today;
  }

  // Save session analytics
  const sessionRecord = {
    date: today,
    task: (await getState(['sessionTask'])).sessionTask,
    durationSec: elapsedSec,
    distractionCount: state.distractionCount || 0,
    tabSwitchCount: state.tabSwitchCount || 0,
    focusScore,
    xpEarned: xp,
    completedAt: Date.now(),
  };
  const { sessionHistory = [] } = await getState(['sessionHistory']);
  sessionHistory.push(sessionRecord);
  // Keep last 100 sessions
  if (sessionHistory.length > 100) sessionHistory.splice(0, sessionHistory.length - 100);

  await setState({
    isSessionActive: false,
    sessionTask: '',
    sessionStartTime: null,
    sessionPausedAt: null,
    sessionPausedElapsed: 0,
    isBreak: false,
    isPaused: false,
    distractionCount: 0,
    tabSwitchCount: 0,
    sessionsToday: (state.sessionsToday || 0) + 1,
    totalFocusToday: (state.totalFocusToday || 0) + elapsedSec,
    xpToday: (state.xpToday || 0) + xp,
    userProfile: profile,
    streak,
    sessionHistory,
  });

  // Clear all alarms
  await chrome.alarms.clear(ALARM_TICK);
  await chrome.alarms.clear(ALARM_COMPLETE);
  await chrome.alarms.clear(ALARM_NUDGE);
  await chrome.alarms.clear(ALARM_BREAK_COMPLETE);

  sessionDistractionFrequency = {};

  // Clear badge
  chrome.action.setBadgeText({ text: '' });

  // Notify about break if enabled
  if (state.breakReminders) {
    notify('session-complete', 'Focus session complete!', 'Time for a break! You earned it.');
  }

  console.log(`[Hyperfocus] Session ended: ${minutes}m, ${xp} XP, score ${focusScore}`);
}

async function startBreak({ duration } = {}) {
  const state = await getState(['breakDuration', 'breakReminders']);
  const breakSec = duration || state.breakDuration || 300;

  await setState({ isBreak: true, isSessionActive: false });

  chrome.alarms.create(ALARM_BREAK_COMPLETE, { delayInMinutes: breakSec / 60 });

  chrome.action.setBadgeText({ text: 'BRK' });
  chrome.action.setBadgeBackgroundColor({ color: '#10B981' }); // green

  console.log(`[Hyperfocus] Break started: ${breakSec / 60}m`);
}

async function endBreak() {
  await chrome.alarms.clear(ALARM_BREAK_COMPLETE);
  await setState({ isBreak: false });

  chrome.action.setBadgeText({ text: '' });

  const { breakReminders } = await getState(['breakReminders']);
  if (breakReminders) {
    notify('break-over', 'Break is over!', 'Break\'s over! Ready for another round?');
  }

  console.log('[Hyperfocus] Break ended');
}

// ---------------------------------------------------------------------------
// 3. Badge Updates
// ---------------------------------------------------------------------------

async function updateBadge() {
  const state = await getState([
    'isSessionActive', 'isPaused', 'isBreak', 'sessionStartTime',
    'sessionPausedElapsed', 'focusDuration',
  ]);

  if (state.isBreak) {
    chrome.action.setBadgeText({ text: 'BRK' });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    return;
  }

  if (!state.isSessionActive) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  if (state.isPaused) {
    chrome.action.setBadgeText({ text: '||' });
    chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
    return;
  }

  const elapsed = Date.now() - state.sessionStartTime - (state.sessionPausedElapsed || 0);
  const remainingSec = state.focusDuration - Math.round(elapsed / 1000);

  if (remainingSec <= 0) {
    chrome.action.setBadgeText({ text: '0m' });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }); // red - overtime
  } else {
    const remainingMin = Math.ceil(remainingSec / 60);
    chrome.action.setBadgeText({ text: `${remainingMin}m` });
    chrome.action.setBadgeBackgroundColor({ color: '#3B82F6' }); // blue
  }
}

// ---------------------------------------------------------------------------
// 4. Alarm Handler
// ---------------------------------------------------------------------------

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case ALARM_TICK: {
      await checkDailyReset();
      await updateBadge();
      break;
    }

    case ALARM_COMPLETE: {
      console.log('[Hyperfocus] Focus duration reached');
      await endSession();
      break;
    }

    case ALARM_BREAK_COMPLETE: {
      console.log('[Hyperfocus] Break complete');
      await endBreak();
      break;
    }

    case ALARM_NUDGE: {
      const { isSessionActive, isPaused } = await getState(['isSessionActive', 'isPaused']);
      if (isSessionActive && !isPaused) {
        const msg = NUDGE_MESSAGES[nudgeIndex % NUDGE_MESSAGES.length];
        nudgeIndex++;
        notify('focus-nudge', 'Focus Check-in', msg);
      }
      break;
    }
  }
});

// ---------------------------------------------------------------------------
// 5. Distraction Detection (Tab Navigation Monitoring)
// ---------------------------------------------------------------------------

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const state = await getState([
    'isSessionActive', 'isPaused', 'distractionSites', 'sessionTask',
    'distractionCount', 'focusModeOptions', 'feedHiding',
  ]);

  if (!state.isSessionActive || state.isPaused) return;

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return;
  }
  const hostname = url.hostname.replace(/^www\./, '');

  // --- Feed hiding injection ---
  if (state.feedHiding && state.focusModeOptions?.hideFeeds) {
    await injectFeedHiding(tabId, hostname);
  }

  // --- Grayscale mode for distraction sites ---
  if (state.focusModeOptions?.grayscale) {
    const isDistractionSite = (state.distractionSites || []).some(
      (site) => site.enabled && hostname.includes(site.urlPattern),
    );
    if (isDistractionSite) {
      try {
        await chrome.scripting.insertCSS({
          target: { tabId },
          css: 'html { filter: grayscale(1) !important; }',
        });
      } catch {}
    }
  }

  // --- Distraction site check ---
  if (!state.focusModeOptions?.blockSites) return;

  const match = (state.distractionSites || []).find(
    (site) => site.enabled && hostname.includes(site.urlPattern),
  );

  if (match) {
    const count = (state.distractionCount || 0) + 1;
    await setState({ distractionCount: count });

    // Track frequency for escalation
    sessionDistractionFrequency[hostname] = (sessionDistractionFrequency[hostname] || 0) + 1;
    const hitCount = sessionDistractionFrequency[hostname];

    // HARD BLOCK: Redirect the tab to a blocked page immediately
    // This uses chrome.scripting to inject a full-page block screen directly
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (site, task, repeatOffender, colors) => {
          // Remove any existing overlay first
          const existing = document.getElementById('hyperfocus-hard-block');
          if (existing) existing.remove();

          const overlay = document.createElement('div');
          overlay.id = 'hyperfocus-hard-block';
          Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '2147483647',
            background: '#0a0a0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          });

          const repeatHTML = repeatOffender
            ? `<div style="background:#ef444418;border:1px solid #ef444444;border-radius:12px;padding:12px 16px;margin-bottom:20px;color:#ef4444;font-size:13px;font-weight:600;">
                 You've visited this site ${repeatOffender} times. Your focus score is dropping.
               </div>`
            : '';

          overlay.innerHTML = `
            <div style="text-align:center;color:#f0f0f5;max-width:500px;padding:40px;">
              <div style="font-size:64px;margin-bottom:24px;">🚫</div>
              <div style="color:#f59e0b;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">BLOCKED DURING FOCUS</div>
              <div style="font-size:13px;color:#8888a0;margin-bottom:4px;">You're trying to visit</div>
              <div style="font-size:20px;font-weight:700;color:#f59e0b;margin-bottom:24px;">${site}</div>
              ${repeatHTML}
              <div style="font-size:15px;color:#8888a0;margin-bottom:8px;">THIS is the task you chose to work on right now:</div>
              <div style="font-size:32px;font-weight:800;margin-bottom:32px;line-height:1.3;">${task || 'Your current task'}</div>
              <div style="color:#f59e0b;font-weight:600;font-size:16px;margin-bottom:40px;">Is this helping you complete that?</div>
              <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                <button id="hf-go-back" style="background:#6366f1;color:white;border:none;padding:14px 32px;border-radius:14px;font-weight:700;font-size:16px;cursor:pointer;box-shadow:0 4px 20px rgba(99,102,241,0.3);">
                  Return to Focus
                </button>
              </div>
              <div style="margin-top:24px;font-size:12px;color:#55556a;">Close this tab or go back to stay focused.</div>
            </div>
          `;

          // Stop the page from loading further
          window.stop();

          // Clear the page and replace with block screen
          document.documentElement.innerHTML = '';
          document.documentElement.appendChild(overlay);

          document.getElementById('hf-go-back').addEventListener('click', () => {
            if (history.length > 1) {
              history.back();
            } else {
              window.close();
            }
          });
        },
        args: [match.label || hostname, state.sessionTask, hitCount >= 3 ? hitCount : null],
      });
    } catch (err) {
      // Fallback: if scripting injection fails, forcibly navigate away
      try {
        await chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('src/popup/index.html'),
        });
      } catch {
        // Tab may have been closed
      }
    }

    if (hitCount >= 3) {
      notify(
        'distraction-warning',
        'Distraction Alert!',
        `You've visited ${match.label || hostname} ${hitCount} times this session. Stay focused on: ${state.sessionTask}`,
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 6. Tab Count Monitoring
// ---------------------------------------------------------------------------

chrome.tabs.onCreated.addListener(async () => {
  const state = await getState([
    'isSessionActive', 'tabLimit', 'focusModeOptions', 'tabSwitchCount',
  ]);

  if (!state.isSessionActive) return;

  // Increment tab switch count
  await setState({ tabSwitchCount: (state.tabSwitchCount || 0) + 1 });

  if (!state.focusModeOptions?.limitTabs) return;

  const tabs = await chrome.tabs.query({});
  const limit = state.tabLimit || 15;

  if (tabs.length > limit) {
    // Notify active tab with closable tab suggestions
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.id) {
      try {
        const closableTabs = tabs
          .filter(t => !t.pinned && t.id !== activeTab?.id)
          .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
          .slice(0, 10)
          .map(t => ({ id: t.id, title: t.title, url: t.url, favicon: t.favIconUrl || '' }));

        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'TAB_OVERLOAD',
          count: tabs.length,
          limit,
          closableTabs,
        });
      } catch {
        // Content script might not be available
      }
    }
  }
});

// Track tab switches (changing active tab)
chrome.tabs.onActivated.addListener(async () => {
  const { isSessionActive, tabSwitchCount } = await getState(['isSessionActive', 'tabSwitchCount']);
  if (isSessionActive) {
    await setState({ tabSwitchCount: (tabSwitchCount || 0) + 1 });
  }
});

// ---------------------------------------------------------------------------
// 7. Feed Hiding (Content Script Injection)
// ---------------------------------------------------------------------------

async function injectFeedHiding(tabId, hostname) {
  for (const [domain, css] of Object.entries(FEED_HIDING_CSS)) {
    if (hostname.includes(domain)) {
      try {
        await chrome.scripting.insertCSS({
          target: { tabId },
          css,
        });
        console.log(`[Hyperfocus] Feed hiding injected for ${domain}`);
      } catch (err) {
        // May fail on chrome:// or restricted pages
        console.warn(`[Hyperfocus] Could not inject CSS into tab ${tabId}:`, err.message);
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// 8. Context Menu
// ---------------------------------------------------------------------------

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'add-distraction-site') return;

  let hostname;
  try {
    hostname = new URL(info.pageUrl || tab.url).hostname.replace(/^www\./, '');
  } catch {
    return;
  }

  const { distractionSites = [] } = await getState(['distractionSites']);

  // Don't add duplicates
  if (distractionSites.some((s) => s.urlPattern === hostname)) {
    notify('site-exists', 'Already tracked', `${hostname} is already in your distraction list.`);
    return;
  }

  distractionSites.push({
    id: `site-${Date.now()}`,
    urlPattern: hostname,
    label: hostname,
    enabled: true,
  });

  await setState({ distractionSites });
  notify('site-added', 'Distraction site added', `${hostname} will now trigger alerts during focus sessions.`);
  console.log(`[Hyperfocus] Added distraction site: ${hostname}`);
});

// ---------------------------------------------------------------------------
// 9. Notification Click Handler
// ---------------------------------------------------------------------------

chrome.notifications.onClicked.addListener(async (notificationId) => {
  chrome.notifications.clear(notificationId);

  // Try to find and focus an existing Hyperfocus web app tab
  const tabs = await chrome.tabs.query({});
  const appTab = tabs.find((t) => t.url && (
    t.url.includes('hyperfocus') || t.url.includes('localhost:5173')
  ));

  if (appTab) {
    await chrome.tabs.update(appTab.id, { active: true });
    await chrome.windows.update(appTab.windowId, { focused: true });
  } else {
    // Fall back to opening popup (action click)
    // Can't programmatically open popup, so open the web app or focus current tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      await chrome.windows.update(activeTab.windowId, { focused: true });
    }
  }
});

// ---------------------------------------------------------------------------
// 10. Message Handling (Popup Communication)
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch((err) => {
    console.error('[Hyperfocus] Message handler error:', err);
    sendResponse({ error: err.message });
  });
  return true; // Keep channel open for async response
});

async function handleMessage(message, _sender) {
  switch (message.type) {
    case 'SESSION_START': {
      await startSession({
        task: message.task,
        duration: message.duration,
        breakDuration: message.breakDuration,
      });
      return { ok: true };
    }

    case 'SESSION_PAUSE': {
      await pauseSession();
      return { ok: true };
    }

    case 'SESSION_RESUME': {
      await resumeSession();
      return { ok: true };
    }

    case 'SESSION_END': {
      await endSession();
      return { ok: true };
    }

    case 'BREAK_START': {
      await startBreak({ duration: message.duration });
      return { ok: true };
    }

    case 'BREAK_END': {
      await endBreak();
      return { ok: true };
    }

    case 'GET_STATUS': {
      return await getStatus();
    }

    case 'UPDATE_SETTINGS': {
      if (message.settings) {
        await setState(message.settings);

        // If nudge interval changed and session is active, recreate nudge alarm
        if (message.settings.nudgeInterval) {
          const { isSessionActive } = await getState(['isSessionActive']);
          if (isSessionActive) {
            await chrome.alarms.clear(ALARM_NUDGE);
            chrome.alarms.create(ALARM_NUDGE, {
              delayInMinutes: message.settings.nudgeInterval,
              periodInMinutes: message.settings.nudgeInterval,
            });
          }
        }
      }
      return { ok: true };
    }

    case 'SAVE_AND_CLOSE_TABS': {
      const { tabIds } = message;
      const tabs = await chrome.tabs.query({});
      const tabsToSave = tabs.filter(t => tabIds.includes(t.id));
      const { savedTabs = [] } = await getState(['savedTabs']);

      for (const t of tabsToSave) {
        savedTabs.push({
          url: t.url,
          title: t.title || t.url,
          favicon: t.favIconUrl || '',
          savedAt: Date.now(),
        });
      }
      await setState({ savedTabs });

      for (const id of tabIds) {
        try { await chrome.tabs.remove(id); } catch {}
      }
      return { success: true, savedCount: tabsToSave.length };
    }

    case 'CLOSE_TABS': {
      const { tabIds: ids } = message;
      for (const id of ids) {
        try { await chrome.tabs.remove(id); } catch {}
      }
      return { success: true };
    }

    case 'GET_SAVED_TABS': {
      const { savedTabs = [] } = await getState(['savedTabs']);
      return { savedTabs };
    }

    case 'RESTORE_TAB': {
      const { url, index: savedIndex } = message;
      await chrome.tabs.create({ url });
      const { savedTabs: st = [] } = await getState(['savedTabs']);
      st.splice(savedIndex, 1);
      await setState({ savedTabs: st });
      return { success: true };
    }

    case 'CLEAR_SAVED_TABS': {
      await setState({ savedTabs: [] });
      return { success: true };
    }

    case 'CLOSE_OLDEST_TABS': {
      // Legacy handler - now saves before closing
      const allTabs = await chrome.tabs.query({});
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const { tabLimit: lim = 15, savedTabs: saved = [] } = await getState(['tabLimit', 'savedTabs']);
      const unpinned = allTabs
        .filter(t => !t.pinned && t.id !== currentTab?.id)
        .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
      const toClose = unpinned.slice(0, Math.max(0, allTabs.length - lim));

      for (const t of toClose) {
        saved.push({ url: t.url, title: t.title || t.url, favicon: t.favIconUrl || '', savedAt: Date.now() });
        try { await chrome.tabs.remove(t.id); } catch {}
      }
      await setState({ savedTabs: saved });
      return { success: true, closedCount: toClose.length };
    }

    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}

async function getStatus() {
  const state = await getState([
    'isSessionActive', 'isPaused', 'isBreak', 'sessionStartTime',
    'sessionPausedElapsed', 'sessionPausedAt', 'focusDuration',
    'breakDuration', 'sessionTask', 'distractionCount', 'tabSwitchCount',
  ]);

  let elapsed = 0;
  let remaining = 0;

  if (state.isSessionActive && state.sessionStartTime) {
    let totalPaused = state.sessionPausedElapsed || 0;
    if (state.isPaused && state.sessionPausedAt) {
      totalPaused += Date.now() - state.sessionPausedAt;
    }
    elapsed = Math.round((Date.now() - state.sessionStartTime - totalPaused) / 1000);
    remaining = Math.max(0, state.focusDuration - elapsed);
  }

  return {
    isActive: state.isSessionActive || false,
    isPaused: state.isPaused || false,
    isBreak: state.isBreak || false,
    elapsed,
    remaining,
    task: state.sessionTask || '',
    distractionCount: state.distractionCount || 0,
    tabSwitchCount: state.tabSwitchCount || 0,
  };
}

// ---------------------------------------------------------------------------
// 11. Service Worker Startup
// ---------------------------------------------------------------------------

// Restore badge state on service worker wake-up
(async () => {
  const { isSessionActive, isBreak } = await getState(['isSessionActive', 'isBreak']);
  if (isBreak) {
    chrome.action.setBadgeText({ text: 'BRK' });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
  } else if (isSessionActive) {
    await updateBadge();
  }
  await checkDailyReset();
})();

console.log('[Hyperfocus] Service worker loaded');
