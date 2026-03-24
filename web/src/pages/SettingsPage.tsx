import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import { TIMER_PRESETS, BREAK_PRESETS } from '@shared/constants/defaults';
import { getLevelForXp, getXpProgress, LEVEL_THRESHOLDS } from '@shared/constants/xp';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';
import ProgressBar from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import {
  isExtensionAvailable,
  getExtensionState,
  updateExtensionSettings,
  onExtensionStateChange,
  type ExtensionState,
} from '@/lib/extensionBridge';

/* ─── Constants ─── */

const TABS = [
  { key: 'timer', label: 'Timer & Focus', icon: '⏱' },
  { key: 'blocking', label: 'Blocking', icon: '🛡' },
  { key: 'planning', label: 'Planning', icon: '📋' },
  { key: 'profile', label: 'Profile', icon: '👤' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HYPERFOCUS_THRESHOLDS = [
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
];

const NUDGE_INTERVALS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
];

/* ─── Setting Row Component ─── */

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-secondary mt-0.5">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ─── Select Dropdown Component ─── */

function SelectDropdown({
  value,
  options,
  onChange,
}: {
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-input border border-input-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all cursor-pointer appearance-none pr-8"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888a0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/* ─── Main Component ─── */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('timer');
  const { settings, updateSettings, user } = useDemo();

  // Extension state
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [extensionState, setExtensionState] = useState<ExtensionState | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Distraction sites form
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteLabel, setNewSiteLabel] = useState('');

  // Extension settings (local state that syncs to extension)
  const [blockSites, setBlockSites] = useState(true);
  const [hideFeeds, setHideFeeds] = useState(false);
  const [grayscaleSites, setGrayscaleSites] = useState(false);
  const [limitTabs, setLimitTabs] = useState(false);
  const [tabLimit, setTabLimit] = useState(10);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [nudgeInterval, setNudgeInterval] = useState(30);
  const [breakReminders, setBreakReminders] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);

  // Planning settings (local state, synced to settings)
  const [workloadCapacity, setWorkloadCapacity] = useState(8);
  const [autoCarryTasks, setAutoCarryTasks] = useState(true);

  // Hyperfocus threshold
  const [hyperfocusThreshold, setHyperfocusThreshold] = useState(60 * 60);

  // Profile
  const [displayName, setDisplayName] = useState(user.displayName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Extension connection check
  const checkExtension = useCallback(async () => {
    const available = isExtensionAvailable();
    setExtensionConnected(available);
    if (available) {
      const state = await getExtensionState();
      if (state) {
        setExtensionState(state);
        setLastSyncTime(new Date().toLocaleTimeString());
        // Hydrate local toggles from extension state
        setBlockSites(state.focusModeOptions?.blockSites ?? true);
        setHideFeeds(state.focusModeOptions?.hideFeeds ?? false);
        setGrayscaleSites(state.focusModeOptions?.grayscale ?? false);
        setLimitTabs(state.focusModeOptions?.limitTabs ?? false);
        setMuteNotifications(state.focusModeOptions?.muteNotifications ?? false);
        setTabLimit(state.tabLimit ?? 10);
        setNudgeInterval(state.nudgeInterval ?? 30);
        setBreakReminders(state.breakReminders ?? true);
        setNotificationSound(state.notificationSound ?? true);
      }
    }
  }, []);

  useEffect(() => {
    checkExtension();
    // Poll every 5 seconds
    const interval = setInterval(checkExtension, 5000);
    // Listen for live state changes
    const unsubscribe = onExtensionStateChange((partial) => {
      setExtensionState((prev) => (prev ? { ...prev, ...partial } : null));
      setLastSyncTime(new Date().toLocaleTimeString());
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [checkExtension]);

  // Sync an extension toggle change
  const syncExtensionToggle = useCallback(
    async (key: string, value: any) => {
      if (!extensionConnected) return;
      await updateExtensionSettings({ [key]: value } as Partial<ExtensionState>);
      setLastSyncTime(new Date().toLocaleTimeString());
    },
    [extensionConnected],
  );

  const syncFocusModeOption = useCallback(
    async (optionKey: string, value: boolean) => {
      if (!extensionConnected || !extensionState) return;
      const updated = {
        ...extensionState.focusModeOptions,
        [optionKey]: value,
      };
      await updateExtensionSettings({
        focusModeOptions: updated,
      } as Partial<ExtensionState>);
      setLastSyncTime(new Date().toLocaleTimeString());
    },
    [extensionConnected, extensionState],
  );

  // Distraction sites actions
  const addSite = () => {
    if (!newSiteUrl.trim() || !newSiteLabel.trim()) return;
    const newSite = {
      id: `custom-${Date.now()}`,
      urlPattern: newSiteUrl.trim(),
      label: newSiteLabel.trim(),
      enabled: true,
    };
    const updated = [...settings.distractionSites, newSite];
    updateSettings({ distractionSites: updated });
    if (extensionConnected) {
      updateExtensionSettings({ distractionSites: updated } as Partial<ExtensionState>);
    }
    setNewSiteUrl('');
    setNewSiteLabel('');
  };

  const removeSite = (id: string) => {
    const updated = settings.distractionSites.filter((s) => s.id !== id);
    updateSettings({ distractionSites: updated });
    if (extensionConnected) {
      updateExtensionSettings({ distractionSites: updated } as Partial<ExtensionState>);
    }
  };

  const toggleSite = (id: string) => {
    const updated = settings.distractionSites.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    updateSettings({ distractionSites: updated });
    if (extensionConnected) {
      updateExtensionSettings({ distractionSites: updated } as Partial<ExtensionState>);
    }
  };

  const toggleOffDay = (day: number) => {
    const offDays = settings.offDays.includes(day)
      ? settings.offDays.filter((d) => d !== day)
      : [...settings.offDays, day];
    updateSettings({ offDays });
  };

  // Level info
  const levelInfo = getLevelForXp(user.totalXp);
  const xpProgress = getXpProgress(user.totalXp);
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === levelInfo.level + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-surface border border-themed-border rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              activeTab === tab.key
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Timer & Focus ─── */}
      {activeTab === 'timer' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Default Focus Duration
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {TIMER_PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => updateSettings({ defaultFocusDuration: p.seconds })}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    settings.defaultFocusDuration === p.seconds
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-surface text-secondary border border-themed-border hover:border-accent/30',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-4">
              Default Break Duration
            </h3>
            <div className="flex flex-wrap gap-2">
              {BREAK_PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => updateSettings({ defaultBreakDuration: p.seconds })}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    settings.defaultBreakDuration === p.seconds
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-surface text-secondary border border-themed-border hover:border-accent/30',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Hyperfocus Protection
            </h3>
            <p className="text-secondary text-sm mb-4">
              Get a nudge when you've been in deep focus too long without a break.
            </p>
            <SettingRow
              label="Threshold"
              description="How long before you get reminded to take a break"
            >
              <SelectDropdown
                value={hyperfocusThreshold}
                options={HYPERFOCUS_THRESHOLDS.map((t) => ({
                  label: t.label,
                  value: t.seconds,
                }))}
                onChange={(val) => setHyperfocusThreshold(Number(val))}
              />
            </SettingRow>
          </Card>
        </div>
      )}

      {/* ─── Tab 2: Blocking & Distractions ─── */}
      {activeTab === 'blocking' && (
        <div className="space-y-4">
          {/* Extension Connection Status */}
          <Card className={cn(
            'flex items-center justify-between',
            extensionConnected
              ? 'border-success/30'
              : 'border-warning/30',
          )}>
            <div className="flex items-center gap-3">
              {extensionConnected ? (
                <>
                  <Badge variant="success">Extension Connected</Badge>
                  {lastSyncTime && (
                    <span className="text-xs text-secondary">
                      Last synced at {lastSyncTime}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Badge variant="warning">Extension Not Installed</Badge>
                  <span className="text-sm text-secondary">
                    <a
                      href="https://chrome.google.com/webstore"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Install the Chrome extension
                    </a>{' '}
                    to enable blocking
                  </span>
                </>
              )}
            </div>
          </Card>

          {/* Distraction Sites List */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Distraction Sites
            </h3>
            <p className="text-secondary text-sm mb-4">
              Manage sites that get blocked or flagged during focus sessions.
            </p>

            <div className="space-y-2 mb-6">
              {settings.distractionSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface border border-themed-border"
                >
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={site.enabled}
                      onChange={() => toggleSite(site.id)}
                    />
                    <div>
                      <div className="text-sm text-foreground font-medium">
                        {site.label}
                      </div>
                      <div className="text-xs text-secondary">
                        {site.urlPattern}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSite(site.id)}
                    className="text-secondary hover:text-danger transition-colors cursor-pointer p-1 rounded-lg hover:bg-danger-soft"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL (e.g. discord.com)"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSite()}
                className="flex-1 bg-input border border-input-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
              <input
                type="text"
                placeholder="Label"
                value={newSiteLabel}
                onChange={(e) => setNewSiteLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSite()}
                className="w-28 bg-input border border-input-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
              />
              <Button size="sm" onClick={addSite}>
                Add
              </Button>
            </div>
          </Card>

          {/* Focus Mode Toggles */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Focus Mode Options
            </h3>
            <p className="text-secondary text-sm mb-4">
              These settings sync to the Chrome extension when connected.
            </p>

            <div className="divide-y divide-themed-border">
              <SettingRow
                label="Block distraction sites"
                description="Prevent access to listed sites during focus"
              >
                <Toggle
                  checked={blockSites}
                  onChange={(v) => {
                    setBlockSites(v);
                    syncFocusModeOption('blockSites', v);
                  }}
                />
              </SettingRow>

              <SettingRow
                label="Hide social feeds"
                description="Remove feed content from social sites"
              >
                <Toggle
                  checked={hideFeeds}
                  onChange={(v) => {
                    setHideFeeds(v);
                    syncFocusModeOption('hideFeeds', v);
                  }}
                />
              </SettingRow>

              <SettingRow
                label="Grayscale distracting sites"
                description="Make blocked sites black and white to reduce appeal"
              >
                <Toggle
                  checked={grayscaleSites}
                  onChange={(v) => {
                    setGrayscaleSites(v);
                    syncFocusModeOption('grayscale', v);
                  }}
                />
              </SettingRow>

              <SettingRow
                label="Limit open tabs"
                description="Cap the number of browser tabs during focus"
              >
                <div className="flex items-center gap-3">
                  {limitTabs && (
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={tabLimit}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(50, Number(e.target.value)));
                        setTabLimit(val);
                        syncExtensionToggle('tabLimit', val);
                      }}
                      className="w-16 bg-input border border-input-border rounded-xl px-2 py-1.5 text-sm text-foreground text-center focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                    />
                  )}
                  <Toggle
                    checked={limitTabs}
                    onChange={(v) => {
                      setLimitTabs(v);
                      syncFocusModeOption('limitTabs', v);
                    }}
                  />
                </div>
              </SettingRow>

              <SettingRow
                label="Mute notifications"
                description="Silence browser notifications during focus sessions"
              >
                <Toggle
                  checked={muteNotifications}
                  onChange={(v) => {
                    setMuteNotifications(v);
                    syncFocusModeOption('muteNotifications', v);
                  }}
                />
              </SettingRow>

              <SettingRow
                label="Focus nudge interval"
                description="How often to remind you to stay focused"
              >
                <SelectDropdown
                  value={nudgeInterval}
                  options={NUDGE_INTERVALS.map((n) => ({
                    label: n.label,
                    value: n.minutes,
                  }))}
                  onChange={(val) => {
                    const mins = Number(val);
                    setNudgeInterval(mins);
                    syncExtensionToggle('nudgeInterval', mins);
                  }}
                />
              </SettingRow>

              <SettingRow
                label="Break reminders"
                description="Get notified when it's time for a break"
              >
                <Toggle
                  checked={breakReminders}
                  onChange={(v) => {
                    setBreakReminders(v);
                    syncExtensionToggle('breakReminders', v);
                  }}
                />
              </SettingRow>

              <SettingRow
                label="Notification sound"
                description="Play a sound with notifications"
              >
                <Toggle
                  checked={notificationSound}
                  onChange={(v) => {
                    setNotificationSound(v);
                    syncExtensionToggle('notificationSound', v);
                  }}
                />
              </SettingRow>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Tab 3: Planning ─── */}
      {activeTab === 'planning' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Planned Off Days
            </h3>
            <p className="text-secondary text-sm mb-6">
              These days won't break your streak. Perfect for weekends or rest
              days.
            </p>

            <div className="flex gap-3">
              {DAY_LABELS.map((label, index) => (
                <button
                  key={label}
                  onClick={() => toggleOffDay(index)}
                  className={cn(
                    'w-12 h-12 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    settings.offDays.includes(index)
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-surface text-secondary border border-themed-border hover:border-accent/30',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Workload
            </h3>

            <div className="divide-y divide-themed-border">
              <SettingRow
                label="Default daily capacity"
                description="How many hours of focused work you plan per day"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={workloadCapacity}
                    onChange={(e) =>
                      setWorkloadCapacity(
                        Math.max(1, Math.min(16, Number(e.target.value))),
                      )
                    }
                    className="w-16 bg-input border border-input-border rounded-xl px-2 py-1.5 text-sm text-foreground text-center focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                  />
                  <span className="text-sm text-secondary">hours</span>
                </div>
              </SettingRow>

              <SettingRow
                label="Auto-carry incomplete tasks"
                description="Move unfinished tasks to tomorrow's plan automatically"
              >
                <Toggle
                  checked={autoCarryTasks}
                  onChange={setAutoCarryTasks}
                />
              </SettingRow>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Tab 4: Profile ─── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={() => {
                    /* In a real app, save to backend here */
                  }}
                  className="w-full max-w-xs bg-input border border-input-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Level & Progress
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">
                    {levelInfo.level}
                  </span>
                </div>
                <div>
                  <div className="text-foreground font-semibold text-lg">
                    {levelInfo.name}
                  </div>
                  <div className="text-secondary text-sm">
                    Level {levelInfo.level} &middot; {user.totalXp.toLocaleString()} XP total
                  </div>
                </div>
              </div>

              {nextLevel && (
                <div>
                  <div className="flex justify-between text-xs text-secondary mb-1.5">
                    <span>
                      {xpProgress.current} / {xpProgress.next} XP
                    </span>
                    <span>Level {nextLevel.level}: {nextLevel.name}</span>
                  </div>
                  <ProgressBar progress={xpProgress.progress} />
                </div>
              )}

              {!nextLevel && (
                <div className="text-sm text-accent font-medium">
                  Max level reached!
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Danger Zone
            </h3>
            <p className="text-secondary text-sm mb-4">
              Irreversible actions that reset your data.
            </p>

            {!showResetConfirm ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset All Data
              </Button>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-soft border border-danger/20">
                <div className="flex-1">
                  <div className="text-sm font-medium text-danger">
                    Are you sure?
                  </div>
                  <div className="text-xs text-secondary mt-0.5">
                    This will erase all sessions, streaks, XP, and settings.
                    This cannot be undone.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      // In a real app, this would clear the database
                      setShowResetConfirm(false);
                    }}
                  >
                    Confirm Reset
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
}
