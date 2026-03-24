/* ==========================================================================
   Hyperfocus Popup — Main Application
   ========================================================================== */

// ===== DEFAULT STATE =====
const DEFAULT_DISTRACTION_SITES = [
  { id: '1', urlPattern: 'youtube.com', label: 'YouTube', enabled: true },
  { id: '2', urlPattern: 'twitter.com', label: 'Twitter / X', enabled: true },
  { id: '3', urlPattern: 'x.com', label: 'X', enabled: true },
  { id: '4', urlPattern: 'reddit.com', label: 'Reddit', enabled: true },
  { id: '5', urlPattern: 'tiktok.com', label: 'TikTok', enabled: true },
  { id: '6', urlPattern: 'instagram.com', label: 'Instagram', enabled: true },
  { id: '7', urlPattern: 'facebook.com', label: 'Facebook', enabled: true },
  { id: '8', urlPattern: 'netflix.com', label: 'Netflix', enabled: true },
  { id: '9', urlPattern: 'twitch.tv', label: 'Twitch', enabled: true },
];

const DEFAULT_STATE = {
  // Session
  isSessionActive: false,
  sessionTask: '',
  sessionStartTime: null,
  focusDuration: 1500,
  breakDuration: 300,
  isBreak: false,
  isPaused: false,
  pausedTimeRemaining: null,
  sessionsToday: 0,
  totalFocusToday: 0,
  xpToday: 0,

  // Planning
  dailyPriority: '',
  tasks: [],
  workloadCapacity: 480,
  dailyReflection: '',
  focusRating: 0,
  planDate: '',

  // Settings
  distractionSites: DEFAULT_DISTRACTION_SITES,
  tabLimit: 15,
  nudgeInterval: 30,
  breakReminders: true,
  notificationSound: true,
  feedHiding: true,
  savedTabs: [],
  focusModeOptions: {
    blockSites: true, hideFeeds: true, limitTabs: true, muteNotifications: false,
    autoBreak: true, grayscale: false, scoring: true
  },

  // User
  userProfile: { level: 1, displayName: 'User', totalXp: 0 },
  streak: { currentStreak: 0, longestStreak: 0, lastSessionDate: null },
};


// ===== APP STATE =====
let state = {};
let timerInterval = null;


// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  checkDailyReset();
  initTabs();
  initDashboard();
  initTimer();
  initPlan();
  initSettings();
  initSaved();
  renderAll();
  startTimerDisplayIfNeeded();
});


// ===== STATE MANAGEMENT =====

async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (data) => {
      state = { ...DEFAULT_STATE, ...data };
      // Ensure nested objects are merged properly
      state.userProfile = { ...DEFAULT_STATE.userProfile, ...(data.userProfile || {}) };
      state.streak = { ...DEFAULT_STATE.streak, ...(data.streak || {}) };
      state.focusModeOptions = { ...DEFAULT_STATE.focusModeOptions, ...(data.focusModeOptions || {}) };
      if (!data.distractionSites) {
        state.distractionSites = DEFAULT_DISTRACTION_SITES;
      }
      resolve();
    });
  });
}

function saveState(keys) {
  const toSave = {};
  for (const key of keys) {
    toSave[key] = state[key];
  }
  chrome.storage.local.set(toSave);
}

function checkDailyReset() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.planDate && state.planDate !== today) {
    // Carry over incomplete tasks marked for tomorrow
    const movedTasks = state.tasks
      .filter(t => !t.done && t.movedToTomorrow)
      .map(t => ({ ...t, movedToTomorrow: false }));

    state.sessionsToday = 0;
    state.totalFocusToday = 0;
    state.xpToday = 0;
    state.dailyReflection = '';
    state.focusRating = 0;
    state.tasks = movedTasks;
    state.dailyPriority = '';
    state.planDate = today;
    saveState([
      'sessionsToday', 'totalFocusToday', 'xpToday',
      'dailyReflection', 'focusRating', 'tasks', 'dailyPriority', 'planDate'
    ]);
  } else if (!state.planDate) {
    state.planDate = today;
    saveState(['planDate']);
  }
}


// ===== TAB NAVIGATION =====

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update buttons
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panels
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });
}


// ===== RENDER ALL =====

function renderAll() {
  renderDashboard();
  renderTimer();
  renderPlan();
  renderSettings();
  renderSavedTabs();
}


// ===== DASHBOARD =====

function initDashboard() {
  // Quick focus toggle
  document.getElementById('dash-focus-toggle').addEventListener('change', (e) => {
    if (e.target.checked) {
      // Start a quick focus session using current timer settings
      if (!state.isSessionActive) {
        startSession(state.sessionTask || 'Quick Focus');
        switchToTab('timer');
      }
    } else {
      if (state.isSessionActive && !state.isBreak) {
        stopSession();
      }
    }
  });

  // Start Focus button
  document.getElementById('dash-start-focus').addEventListener('click', () => {
    switchToTab('timer');
  });

  // Open Web App
  document.getElementById('dash-open-app').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://hyperfocus.app' });
  });
}

function renderDashboard() {
  const { userProfile, streak, isSessionActive, sessionTask, isBreak } = state;

  // Stats bar
  document.getElementById('dash-level').textContent = userProfile.level;
  document.getElementById('dash-name').textContent = userProfile.displayName;
  document.getElementById('dash-xp').textContent = `${userProfile.totalXp} XP`;
  document.getElementById('dash-streak').textContent = `\u{1F525} ${streak.currentStreak}`;

  // Status badge
  const badge = document.getElementById('status-badge');
  if (isSessionActive && !isBreak) {
    badge.textContent = 'Focusing';
    badge.className = 'header-badge active';
  } else if (isBreak) {
    badge.textContent = 'Break';
    badge.className = 'header-badge active';
  } else {
    badge.textContent = 'Idle';
    badge.className = 'header-badge idle';
  }

  // Current task
  const taskText = document.getElementById('dash-task-text');
  const taskHint = document.getElementById('dash-task-hint');
  if (isSessionActive && sessionTask) {
    taskText.textContent = sessionTask;
    taskHint.classList.remove('hidden');
  } else {
    taskText.textContent = 'No active task';
    taskHint.classList.add('hidden');
  }

  // Focus toggle
  document.getElementById('dash-focus-toggle').checked = isSessionActive && !isBreak;

  // Today's progress
  document.getElementById('dash-sessions').textContent = state.sessionsToday;
  document.getElementById('dash-focus-time').textContent = formatMinutes(state.totalFocusToday);
  document.getElementById('dash-xp-today').textContent = state.xpToday;
}


// ===== TIMER =====

function initTimer() {
  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isSessionActive) return; // Don't change during session
      const minutes = parseInt(btn.dataset.minutes);
      state.focusDuration = minutes * 60;
      saveState(['focusDuration']);

      // Update active preset
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderTimer();
    });
  });

  // Start
  document.getElementById('timer-start-btn').addEventListener('click', () => {
    const task = document.getElementById('timer-task-input').value.trim() || 'Focus Session';
    startSession(task);
  });

  // Pause
  document.getElementById('timer-pause-btn').addEventListener('click', () => {
    pauseSession();
  });

  // Resume
  document.getElementById('timer-resume-btn').addEventListener('click', () => {
    resumeSession();
  });

  // Stop
  document.getElementById('timer-stop-btn').addEventListener('click', () => {
    stopSession();
  });
}

function renderTimer() {
  const { isSessionActive, isPaused, isBreak, focusDuration, breakDuration, sessionsToday } = state;

  // Timer display
  const display = document.getElementById('timer-display');
  const label = document.getElementById('timer-label');

  if (!isSessionActive && !isBreak) {
    display.textContent = formatTime(focusDuration);
    display.classList.remove('on-break');
    label.textContent = 'Ready to focus';
  } else if (isBreak) {
    display.classList.add('on-break');
    label.textContent = 'Break time — relax';
  } else if (isPaused) {
    label.textContent = 'Paused';
  } else {
    display.classList.remove('on-break');
    label.textContent = state.sessionTask || 'Focusing...';
  }

  // Update preset highlighting
  const presetMinutes = focusDuration / 60;
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.minutes) === presetMinutes);
  });

  // Controls visibility
  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const resumeBtn = document.getElementById('timer-resume-btn');
  const stopBtn = document.getElementById('timer-stop-btn');
  const taskInput = document.getElementById('timer-task-input');

  if (!isSessionActive && !isBreak) {
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');
    taskInput.disabled = false;
  } else if (isPaused) {
    startBtn.classList.add('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    stopBtn.classList.remove('hidden');
    taskInput.disabled = true;
  } else {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    taskInput.disabled = true;
  }

  // Session counter
  const sessionNum = sessionsToday + 1;
  document.getElementById('timer-session-count').textContent = `Session ${sessionNum} of 4`;

  // XP potential
  const potentialXP = Math.round((focusDuration / 60) * 5);
  document.getElementById('timer-xp-potential').textContent = `+${potentialXP} XP`;
}

function startSession(task) {
  state.isSessionActive = true;
  state.isPaused = false;
  state.isBreak = false;
  state.sessionTask = task;
  state.sessionStartTime = Date.now();
  state.pausedTimeRemaining = null;

  saveState(['isSessionActive', 'isPaused', 'isBreak', 'sessionTask', 'sessionStartTime', 'pausedTimeRemaining']);

  // Set alarm for session end
  chrome.alarms.create('focusComplete', { delayInMinutes: state.focusDuration / 60 });

  // Notify background
  chrome.runtime.sendMessage({ type: 'SESSION_START', task: task, duration: state.focusDuration });

  document.getElementById('timer-task-input').value = task;
  startTimerDisplay();
  renderAll();
}

function pauseSession() {
  if (!state.isSessionActive || state.isPaused) return;

  const elapsed = (Date.now() - state.sessionStartTime) / 1000;
  const duration = state.isBreak ? state.breakDuration : state.focusDuration;
  state.pausedTimeRemaining = Math.max(0, duration - elapsed);
  state.isPaused = true;

  chrome.alarms.clear('focusComplete');
  chrome.alarms.clear('breakComplete');
  clearInterval(timerInterval);
  timerInterval = null;

  saveState(['isPaused', 'pausedTimeRemaining']);
  renderAll();
}

function resumeSession() {
  if (!state.isPaused) return;

  state.isPaused = false;
  const remaining = state.pausedTimeRemaining || 0;
  // Adjust start time so remaining time is correct
  const duration = state.isBreak ? state.breakDuration : state.focusDuration;
  state.sessionStartTime = Date.now() - ((duration - remaining) * 1000);
  state.pausedTimeRemaining = null;

  const alarmName = state.isBreak ? 'breakComplete' : 'focusComplete';
  chrome.alarms.create(alarmName, { delayInMinutes: remaining / 60 });

  saveState(['isPaused', 'sessionStartTime', 'pausedTimeRemaining']);
  startTimerDisplay();
  renderAll();
}

function stopSession() {
  // Calculate earned XP if was focusing (not break)
  if (state.isSessionActive && !state.isBreak) {
    const elapsed = state.isPaused
      ? (state.focusDuration - (state.pausedTimeRemaining || 0))
      : (Date.now() - state.sessionStartTime) / 1000;
    const focusMinutes = Math.floor(elapsed / 60);
    const earnedXP = focusMinutes * 5;

    if (focusMinutes > 0) {
      state.sessionsToday += 1;
      state.totalFocusToday += focusMinutes;
      state.xpToday += earnedXP;
      state.userProfile.totalXp += earnedXP;
      state.userProfile.level = Math.floor(state.userProfile.totalXp / 500) + 1;

      // Update streak
      const today = new Date().toISOString().slice(0, 10);
      if (state.streak.lastSessionDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (state.streak.lastSessionDate === yesterday) {
          state.streak.currentStreak += 1;
        } else {
          state.streak.currentStreak = 1;
        }
        state.streak.longestStreak = Math.max(state.streak.longestStreak, state.streak.currentStreak);
        state.streak.lastSessionDate = today;
      }

      saveState(['sessionsToday', 'totalFocusToday', 'xpToday', 'userProfile', 'streak']);
    }
  }

  // Reset session state
  state.isSessionActive = false;
  state.isPaused = false;
  state.isBreak = false;
  state.sessionTask = '';
  state.sessionStartTime = null;
  state.pausedTimeRemaining = null;

  chrome.alarms.clear('focusComplete');
  chrome.alarms.clear('breakComplete');
  clearInterval(timerInterval);
  timerInterval = null;

  saveState(['isSessionActive', 'isPaused', 'isBreak', 'sessionTask', 'sessionStartTime', 'pausedTimeRemaining']);

  chrome.runtime.sendMessage({ type: 'SESSION_END' });
  renderAll();
}

function completeSession() {
  // Calculate XP for full session
  const focusMinutes = Math.round(state.focusDuration / 60);
  const earnedXP = focusMinutes * 5;

  state.sessionsToday += 1;
  state.totalFocusToday += focusMinutes;
  state.xpToday += earnedXP;
  state.userProfile.totalXp += earnedXP;
  state.userProfile.level = Math.floor(state.userProfile.totalXp / 500) + 1;

  // Update streak
  const today = new Date().toISOString().slice(0, 10);
  if (state.streak.lastSessionDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.streak.lastSessionDate === yesterday) {
      state.streak.currentStreak += 1;
    } else {
      state.streak.currentStreak = 1;
    }
    state.streak.longestStreak = Math.max(state.streak.longestStreak, state.streak.currentStreak);
    state.streak.lastSessionDate = today;
  }

  saveState(['sessionsToday', 'totalFocusToday', 'xpToday', 'userProfile', 'streak']);

  // Start break
  state.isBreak = true;
  state.isSessionActive = true;
  state.sessionStartTime = Date.now();
  state.isPaused = false;
  state.pausedTimeRemaining = null;

  chrome.alarms.create('breakComplete', { delayInMinutes: state.breakDuration / 60 });
  saveState(['isBreak', 'isSessionActive', 'sessionStartTime', 'isPaused', 'pausedTimeRemaining']);

  chrome.runtime.sendMessage({ type: 'SESSION_END' });

  startTimerDisplay();
  renderAll();
}

function completeBreak() {
  state.isBreak = false;
  state.isSessionActive = false;
  state.sessionTask = '';
  state.sessionStartTime = null;
  state.isPaused = false;
  state.pausedTimeRemaining = null;

  clearInterval(timerInterval);
  timerInterval = null;

  chrome.alarms.clear('breakComplete');
  saveState(['isBreak', 'isSessionActive', 'sessionTask', 'sessionStartTime', 'isPaused', 'pausedTimeRemaining']);

  renderAll();
}

function startTimerDisplay() {
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 250);
  updateTimerDisplay();
}

function startTimerDisplayIfNeeded() {
  if ((state.isSessionActive || state.isBreak) && !state.isPaused) {
    startTimerDisplay();
  } else if (state.isPaused && state.pausedTimeRemaining != null) {
    // Show paused time
    document.getElementById('timer-display').textContent = formatTime(Math.ceil(state.pausedTimeRemaining));
  }
}

function updateTimerDisplay() {
  if (!state.sessionStartTime) return;

  const elapsed = (Date.now() - state.sessionStartTime) / 1000;
  const duration = state.isBreak ? state.breakDuration : state.focusDuration;
  const remaining = Math.max(0, duration - elapsed);

  document.getElementById('timer-display').textContent = formatTime(Math.ceil(remaining));

  if (remaining <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    if (state.isBreak) {
      completeBreak();
    } else {
      completeSession();
    }
  }
}


// ===== PLAN =====

function initPlan() {
  // Priority input (save on blur)
  document.getElementById('plan-priority').addEventListener('change', (e) => {
    state.dailyPriority = e.target.value.trim();
    saveState(['dailyPriority']);
  });

  // Add task
  document.getElementById('plan-add-task').addEventListener('click', addTask);
  document.getElementById('plan-task-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Reflection
  document.getElementById('plan-reflection').addEventListener('change', (e) => {
    state.dailyReflection = e.target.value;
    saveState(['dailyReflection']);
  });

  // Rating buttons
  document.querySelectorAll('#plan-rating-row .rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.focusRating = parseInt(btn.dataset.rating);
      saveState(['focusRating']);
      renderRating();
    });
  });

  // Move incomplete to tomorrow
  document.getElementById('plan-move-incomplete').addEventListener('click', () => {
    state.tasks = state.tasks.map(t => {
      if (!t.done) return { ...t, movedToTomorrow: true };
      return t;
    });
    saveState(['tasks']);
    renderTaskList();
  });

  // Save plan
  document.getElementById('plan-save').addEventListener('click', () => {
    state.dailyPriority = document.getElementById('plan-priority').value.trim();
    state.dailyReflection = document.getElementById('plan-reflection').value;
    saveState(['dailyPriority', 'dailyReflection', 'tasks', 'focusRating']);
    // Brief visual feedback
    const btn = document.getElementById('plan-save');
    btn.textContent = 'Saved!';
    setTimeout(() => { btn.textContent = 'Save Plan'; }, 1500);
  });
}

function addTask() {
  const input = document.getElementById('plan-task-input');
  const estimateSelect = document.getElementById('plan-task-estimate');
  const text = input.value.trim();
  if (!text) return;

  state.tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text,
    estimate: parseInt(estimateSelect.value),
    done: false,
    movedToTomorrow: false,
  });

  input.value = '';
  saveState(['tasks']);
  renderTaskList();
  renderWorkload();
}

function renderPlan() {
  document.getElementById('plan-priority').value = state.dailyPriority || '';
  document.getElementById('plan-reflection').value = state.dailyReflection || '';
  renderTaskList();
  renderWorkload();
  renderRating();
}

function renderTaskList() {
  const list = document.getElementById('plan-task-list');
  list.innerHTML = '';

  if (state.tasks.length === 0) {
    list.innerHTML = '<li class="empty-state">No tasks yet. Add one above.</li>';
    return;
  }

  state.tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      state.tasks[index].done = checkbox.checked;
      saveState(['tasks']);
      renderTaskList();
      renderWorkload();
    });

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text' + (task.done ? ' done' : '');
    textSpan.textContent = task.text;

    const estimate = document.createElement('span');
    estimate.className = 'task-estimate';
    estimate.textContent = formatEstimate(task.estimate);

    const actions = document.createElement('span');
    actions.className = 'task-actions';

    // Move up
    if (index > 0) {
      const upBtn = document.createElement('button');
      upBtn.className = 'task-action-btn';
      upBtn.textContent = '\u2191';
      upBtn.title = 'Move up';
      upBtn.addEventListener('click', () => {
        [state.tasks[index - 1], state.tasks[index]] = [state.tasks[index], state.tasks[index - 1]];
        saveState(['tasks']);
        renderTaskList();
      });
      actions.appendChild(upBtn);
    }

    // Move down
    if (index < state.tasks.length - 1) {
      const downBtn = document.createElement('button');
      downBtn.className = 'task-action-btn';
      downBtn.textContent = '\u2193';
      downBtn.title = 'Move down';
      downBtn.addEventListener('click', () => {
        [state.tasks[index], state.tasks[index + 1]] = [state.tasks[index + 1], state.tasks[index]];
        saveState(['tasks']);
        renderTaskList();
      });
      actions.appendChild(downBtn);
    }

    // Remove
    const removeBtn = document.createElement('button');
    removeBtn.className = 'task-action-btn';
    removeBtn.textContent = '\u00D7';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.tasks.splice(index, 1);
      saveState(['tasks']);
      renderTaskList();
      renderWorkload();
    });
    actions.appendChild(removeBtn);

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(estimate);
    li.appendChild(actions);

    // Show "moved to tomorrow" indicator
    if (task.movedToTomorrow) {
      const badge = document.createElement('span');
      badge.className = 'text-xs text-muted';
      badge.textContent = '\u2192 tmrw';
      badge.style.marginLeft = '4px';
      li.insertBefore(badge, actions);
    }

    list.appendChild(li);
  });
}

function renderWorkload() {
  const totalPlanned = state.tasks.reduce((sum, t) => sum + t.estimate, 0);
  const capacity = state.workloadCapacity;
  const pct = Math.min(100, (totalPlanned / capacity) * 100);

  document.getElementById('plan-workload-planned').textContent = `${formatMinutes(totalPlanned)} planned`;
  document.getElementById('plan-workload-available').textContent = `${formatMinutes(capacity)} available`;

  const fill = document.getElementById('plan-workload-fill');
  fill.style.width = pct + '%';
  fill.classList.remove('over', 'warning');
  if (pct > 100) fill.classList.add('over');
  else if (pct > 80) fill.classList.add('warning');
}

function renderRating() {
  document.querySelectorAll('#plan-rating-row .rating-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.rating) <= state.focusRating);
  });
}


// ===== SETTINGS =====

function initSettings() {
  // Add site
  document.getElementById('settings-add-site').addEventListener('click', addSite);
  document.getElementById('settings-site-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addSite();
  });

  // Tab limit slider
  const slider = document.getElementById('settings-tab-limit');
  slider.addEventListener('input', () => {
    state.tabLimit = parseInt(slider.value);
    document.getElementById('settings-tab-limit-value').textContent = state.tabLimit;
    saveState(['tabLimit']);
  });

  // Nudge interval
  document.getElementById('settings-nudge-interval').addEventListener('change', (e) => {
    state.nudgeInterval = parseInt(e.target.value);
    saveState(['nudgeInterval']);
  });

  // Toggle settings
  const toggleMap = {
    'settings-break-reminders': 'breakReminders',
    'settings-notification-sound': 'notificationSound',
    'settings-feed-hiding': 'feedHiding',
  };

  for (const [id, key] of Object.entries(toggleMap)) {
    document.getElementById(id).addEventListener('change', (e) => {
      state[key] = e.target.checked;
      saveState([key]);
    });
  }

  // Focus mode option checkboxes
  const fmMap = {
    'settings-fm-block': 'blockSites',
    'settings-fm-feeds': 'hideFeeds',
    'settings-fm-tabs': 'limitTabs',
    'settings-fm-mute': 'muteNotifications',
  };

  for (const [id, key] of Object.entries(fmMap)) {
    document.getElementById(id).addEventListener('change', (e) => {
      state.focusModeOptions[key] = e.target.checked;
      saveState(['focusModeOptions']);
    });
  }

  // New focus mode option checkboxes
  const newFmMap = {
    'settings-fm-autobreak': 'autoBreak',
    'settings-fm-grayscale': 'grayscale',
    'settings-fm-scoring': 'scoring',
  };
  for (const [id, key] of Object.entries(newFmMap)) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        state.focusModeOptions[key] = e.target.checked;
        saveState(['focusModeOptions']);
      });
    }
  }

  // Clear data
  document.getElementById('settings-clear-data').addEventListener('click', () => {
    if (confirm('Clear all Hyperfocus data? This cannot be undone.')) {
      chrome.storage.local.clear(() => {
        state = { ...DEFAULT_STATE };
        state.planDate = new Date().toISOString().slice(0, 10);
        saveState(Object.keys(DEFAULT_STATE));
        renderAll();
      });
    }
  });
}

function addSite() {
  const input = document.getElementById('settings-site-input');
  let domain = input.value.trim().toLowerCase();
  if (!domain) return;

  // Strip protocol and path
  domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  // Check for duplicates
  if (state.distractionSites.some(s => s.urlPattern === domain)) {
    input.value = '';
    return;
  }

  state.distractionSites.push({ id: Date.now().toString(), urlPattern: domain, label: domain, enabled: true });
  input.value = '';
  saveState(['distractionSites']);
  renderSiteList();
}

function renderSettings() {
  renderSiteList();

  // Tab limit
  document.getElementById('settings-tab-limit').value = state.tabLimit;
  document.getElementById('settings-tab-limit-value').textContent = state.tabLimit;

  // Nudge interval
  document.getElementById('settings-nudge-interval').value = state.nudgeInterval;

  // Toggles
  document.getElementById('settings-break-reminders').checked = state.breakReminders;
  document.getElementById('settings-notification-sound').checked = state.notificationSound;
  document.getElementById('settings-feed-hiding').checked = state.feedHiding;

  // Focus mode options
  document.getElementById('settings-fm-block').checked = state.focusModeOptions.blockSites;
  document.getElementById('settings-fm-feeds').checked = state.focusModeOptions.hideFeeds;
  document.getElementById('settings-fm-tabs').checked = state.focusModeOptions.limitTabs;
  document.getElementById('settings-fm-mute').checked = state.focusModeOptions.muteNotifications;

  // New focus mode options
  const el1 = document.getElementById('settings-fm-autobreak');
  if (el1) el1.checked = state.focusModeOptions.autoBreak !== false;
  const el2 = document.getElementById('settings-fm-grayscale');
  if (el2) el2.checked = !!state.focusModeOptions.grayscale;
  const el3 = document.getElementById('settings-fm-scoring');
  if (el3) el3.checked = state.focusModeOptions.scoring !== false;
}

function renderSiteList() {
  const list = document.getElementById('settings-site-list');
  list.innerHTML = '';

  state.distractionSites.forEach((site, index) => {
    const li = document.createElement('li');
    li.className = 'site-item';

    // Toggle
    const toggle = document.createElement('label');
    toggle.className = 'toggle-switch';
    toggle.style.transform = 'scale(0.7)';
    toggle.style.flexShrink = '0';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = site.enabled;
    cb.addEventListener('change', () => {
      state.distractionSites[index].enabled = cb.checked;
      saveState(['distractionSites']);
    });
    const slider = document.createElement('span');
    slider.className = 'toggle-slider';
    toggle.appendChild(cb);
    toggle.appendChild(slider);

    const domainSpan = document.createElement('span');
    domainSpan.className = 'site-domain';
    domainSpan.textContent = site.urlPattern;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'site-name';
    nameSpan.textContent = site.label !== site.urlPattern ? site.label : '';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-site';
    removeBtn.textContent = '\u00D7';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.distractionSites.splice(index, 1);
      saveState(['distractionSites']);
      renderSiteList();
    });

    li.appendChild(toggle);
    li.appendChild(domainSpan);
    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}


// ===== SAVED TABS =====

function initSaved() {
  document.getElementById('saved-restore-all').addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_SAVED_TABS' });
    const tabs = response?.savedTabs || state.savedTabs || [];
    for (const tab of tabs) {
      chrome.tabs.create({ url: tab.url, active: false });
    }
    await chrome.runtime.sendMessage({ type: 'CLEAR_SAVED_TABS' });
    state.savedTabs = [];
    renderSavedTabs();
  });

  document.getElementById('saved-clear-all').addEventListener('click', async () => {
    if (confirm('Clear all saved tabs?')) {
      await chrome.runtime.sendMessage({ type: 'CLEAR_SAVED_TABS' });
      state.savedTabs = [];
      renderSavedTabs();
    }
  });
}

function renderSavedTabs() {
  const list = document.getElementById('saved-tabs-list');
  const countEl = document.getElementById('saved-tabs-count');
  const tabs = state.savedTabs || [];

  countEl.textContent = `${tabs.length} tab${tabs.length !== 1 ? 's' : ''}`;

  if (tabs.length === 0) {
    list.innerHTML = '<div class="saved-tabs-empty">No saved tabs yet. When you close tabs during focus mode, they\'ll appear here.</div>';
    return;
  }

  list.innerHTML = '';
  tabs.forEach((tab, index) => {
    const item = document.createElement('div');
    item.className = 'saved-tab-item';

    const favicon = tab.favicon
      ? `<img class="saved-tab-favicon" src="${tab.favicon}" onerror="this.style.display='none'" />`
      : '<div class="saved-tab-favicon" style="background:#2a2a3a;"></div>';

    item.innerHTML = `
      ${favicon}
      <div class="saved-tab-info">
        <div class="saved-tab-title">${tab.title || tab.url}</div>
        <div class="saved-tab-url">${tab.url}</div>
      </div>
      <div class="saved-tab-actions">
        <button class="restore-btn" title="Restore">Open</button>
        <button class="remove-btn" title="Remove">\u00D7</button>
      </div>
    `;

    item.querySelector('.restore-btn').addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ type: 'RESTORE_TAB', url: tab.url, index });
      state.savedTabs.splice(index, 1);
      renderSavedTabs();
    });

    item.querySelector('.remove-btn').addEventListener('click', async () => {
      state.savedTabs.splice(index, 1);
      saveState(['savedTabs']);
      renderSavedTabs();
    });

    list.appendChild(item);
  });
}


// ===== HELPERS =====

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatEstimate(minutes) {
  if (minutes >= 60) return `${minutes / 60}h`;
  return `${minutes}m`;
}

function switchToTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    const isTarget = b.dataset.tab === tabName;
    b.classList.toggle('active', isTarget);
    b.setAttribute('aria-selected', isTarget.toString());
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
}


// ===== LISTEN FOR ALARM EVENTS FROM BACKGROUND =====
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusComplete' && state.isSessionActive && !state.isBreak) {
    completeSession();
  } else if (alarm.name === 'breakComplete' && state.isBreak) {
    completeBreak();
  }
});
