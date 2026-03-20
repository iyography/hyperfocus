import type { DistractionSite, UserSettings } from '../types/settings';

export const TIMER_PRESETS = [
  { label: '15 min', seconds: 15 * 60 },
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
  { label: '2 hrs', seconds: 120 * 60 },
] as const;

export const BREAK_PRESETS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '20 min', seconds: 20 * 60 },
] as const;

export const DEFAULT_DISTRACTION_SITES: DistractionSite[] = [
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

export const HYPERFOCUS_THRESHOLD_SECONDS = 60 * 60; // 60 minutes

export const DEFAULT_SETTINGS: UserSettings = {
  defaultFocusDuration: 25 * 60,
  defaultBreakDuration: 5 * 60,
  distractionSites: DEFAULT_DISTRACTION_SITES,
  offDays: [0, 6], // Saturday and Sunday off by default
};
