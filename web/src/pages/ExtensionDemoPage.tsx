import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDemo } from '@/providers/DemoProvider';
import { getLevelForXp } from '@shared/constants/xp';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function ExtensionDemoPage() {
  const { user, streak, todayCheckIn, settings } = useDemo();
  const level = getLevelForXp(user.totalXp);
  const [showDistraction, setShowDistraction] = useState(false);
  const [showTabOverload, setShowTabOverload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Chrome Extension Preview</h1>
        <p className="text-text-secondary mt-1">
          See how the extension works alongside the web app.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fake Browser Window with Extension */}
        <Card className="p-0 overflow-hidden" data-tour="extension-popup">
          {/* Fake browser toolbar */}
          <div className="bg-bg-elevated px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 bg-bg-surface rounded-lg px-3 py-1 text-xs text-text-secondary">
              chrome-extension://hyperfocus
            </div>
          </div>

          {/* Extension popup content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-accent font-bold">Hyper</span>
                <span className="text-text-primary font-bold">focus</span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            {/* User stats */}
            <div className="flex items-center gap-4 p-3 bg-bg-elevated rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[rgba(124,92,255,0.15)] flex items-center justify-center text-accent font-bold">
                {level.level}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{user.displayName}</div>
                <div className="text-xs text-text-secondary">{user.totalXp} XP</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 23c-3.866 0-7-2.686-7-6a7.003 7.003 0 014.13-6.388A4.002 4.002 0 0112 3a4.002 4.002 0 012.87 7.612A7.003 7.003 0 0119 17c0 3.314-3.134 6-7 6z" />
                  </svg>
                  <span className="text-sm font-bold text-text-primary">{streak.currentStreak}</span>
                </div>
              </div>
            </div>

            {/* Current task */}
            {todayCheckIn ? (
              <div className="p-3 bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] rounded-xl">
                <div className="text-xs text-accent mb-1">Current Focus</div>
                <div className="text-sm font-medium text-text-primary">{todayCheckIn.task}</div>
              </div>
            ) : (
              <div className="p-3 bg-bg-elevated rounded-xl text-center">
                <div className="text-sm text-text-secondary">No active session</div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs">
                Quick Focus
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setShowSettings(!showSettings)}
              >
                Settings
              </Button>
            </div>

            {/* Inline settings */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-bg-elevated rounded-xl space-y-2">
                    <div className="text-xs font-medium text-text-primary mb-2">Monitored Sites</div>
                    {settings.distractionSites.slice(0, 5).map((site) => (
                      <div key={site.id} className="flex items-center justify-between text-xs">
                        <span className={site.enabled ? 'text-text-primary' : 'text-text-secondary line-through'}>
                          {site.label}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${site.enabled ? 'bg-success' : 'bg-border'}`} />
                      </div>
                    ))}
                    {settings.distractionSites.length > 5 && (
                      <div className="text-xs text-text-secondary">
                        +{settings.distractionSites.length - 5} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Demo triggers */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Try It Out</h3>
            <p className="text-text-secondary text-sm mb-4">
              Trigger extension alerts to see how they work during a focus session.
            </p>
            <div className="space-y-3">
              <Button
                data-tour="trigger-distraction"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  setShowDistraction(true);
                  setShowTabOverload(false);
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                Trigger Distraction Alert
              </Button>
              <Button
                data-tour="trigger-tabs"
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  setShowTabOverload(true);
                  setShowDistraction(false);
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Trigger Tab Overload Warning
              </Button>
            </div>
          </Card>

          {/* Distraction Alert */}
          <AnimatePresence>
            {showDistraction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.05)]">
                  <div className="text-center">
                    <svg className="w-10 h-10 text-warning mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    <p className="text-text-secondary text-sm mb-2">You said you wanted to work on:</p>
                    <p className="text-text-primary font-bold mb-4">
                      {todayCheckIn?.task || 'Your important task'}
                    </p>
                    <p className="text-warning font-medium mb-4">Is this helping?</p>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowDistraction(false)}
                      >
                        Return to Focus
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowDistraction(false)}
                      >
                        Continue Anyway
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Overload Warning */}
          <AnimatePresence>
            {showTabOverload && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="border-[rgba(124,92,255,0.3)] bg-[rgba(124,92,255,0.05)]">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">23 tabs</div>
                    <p className="text-text-secondary text-sm mb-4">
                      You have a lot of tabs open. Are you still focused on your task?
                    </p>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowTabOverload(false)}
                      >
                        Return to Focus
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => setShowTabOverload(false)}
                      >
                        Continue Anyway
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
