import { useState } from 'react';
import { motion } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import { TIMER_PRESETS, BREAK_PRESETS } from '@shared/constants/defaults';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import { cn } from '@/lib/cn';

const TABS = ['Timer', 'Distractions', 'Off Days'] as const;
type Tab = (typeof TABS)[number];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Timer');
  const { settings, updateSettings } = useDemo();
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteLabel, setNewSiteLabel] = useState('');

  const addSite = () => {
    if (!newSiteUrl.trim() || !newSiteLabel.trim()) return;
    const newSite = {
      id: `custom-${Date.now()}`,
      urlPattern: newSiteUrl.trim(),
      label: newSiteLabel.trim(),
      enabled: true,
    };
    updateSettings({
      distractionSites: [...settings.distractionSites, newSite],
    });
    setNewSiteUrl('');
    setNewSiteLabel('');
  };

  const removeSite = (id: string) => {
    updateSettings({
      distractionSites: settings.distractionSites.filter((s) => s.id !== id),
    });
  };

  const toggleSite = (id: string) => {
    updateSettings({
      distractionSites: settings.distractionSites.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s,
      ),
    });
  };

  const toggleOffDay = (day: number) => {
    const offDays = settings.offDays.includes(day)
      ? settings.offDays.filter((d) => d !== day)
      : [...settings.offDays, day];
    updateSettings({ offDays });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-text-primary">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-surface rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              activeTab === tab
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timer Settings */}
      {activeTab === 'Timer' && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Default Focus Duration</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {TIMER_PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => updateSettings({ defaultFocusDuration: p.seconds })}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                  settings.defaultFocusDuration === p.seconds
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated text-text-secondary border border-border hover:border-[rgba(124,92,255,0.5)]',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-4">Default Break Duration</h3>
          <div className="flex flex-wrap gap-2">
            {BREAK_PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => updateSettings({ defaultBreakDuration: p.seconds })}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                  settings.defaultBreakDuration === p.seconds
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated text-text-secondary border border-border hover:border-[rgba(124,92,255,0.5)]',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Distraction Sites */}
      {activeTab === 'Distractions' && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Distraction Sites</h3>
          <p className="text-text-secondary text-sm mb-4">
            You'll be alerted when visiting these sites during a focus session.
          </p>

          <div className="space-y-2 mb-6">
            {settings.distractionSites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-elevated"
              >
                <div className="flex items-center gap-3">
                  <Toggle checked={site.enabled} onChange={() => toggleSite(site.id)} />
                  <div>
                    <div className="text-sm text-text-primary">{site.label}</div>
                    <div className="text-xs text-text-secondary">{site.urlPattern}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeSite(site.id)}
                  className="text-text-secondary hover:text-danger transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-[rgba(136,136,160,0.4)] focus:outline-none focus:border-accent transition-all"
            />
            <input
              type="text"
              placeholder="Label"
              value={newSiteLabel}
              onChange={(e) => setNewSiteLabel(e.target.value)}
              className="w-28 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-[rgba(136,136,160,0.4)] focus:outline-none focus:border-accent transition-all"
            />
            <Button size="sm" onClick={addSite}>
              Add
            </Button>
          </div>
        </Card>
      )}

      {/* Off Days */}
      {activeTab === 'Off Days' && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Planned Off Days</h3>
          <p className="text-text-secondary text-sm mb-6">
            These days won't break your streak. Perfect for weekends or rest days.
          </p>

          <div className="flex gap-3">
            {DAY_LABELS.map((label, index) => (
              <button
                key={label}
                onClick={() => toggleOffDay(index)}
                className={cn(
                  'w-12 h-12 rounded-xl text-sm font-medium transition-all cursor-pointer',
                  settings.offDays.includes(index)
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated text-text-secondary border border-border hover:border-[rgba(124,92,255,0.5)]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
