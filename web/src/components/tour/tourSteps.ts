import type { DriveStep } from 'driver.js';

export const dashboardTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Welcome to Hyperfocus!',
      description: 'This is your daily focus dashboard. Let me show you around.',
    },
  },
  {
    element: '[data-tour="today-card"]',
    popover: {
      title: 'Daily Check-In',
      description: 'Start here each day. Tell us your most important task and we\'ll help you lock in and finish it.',
    },
  },
  {
    element: '[data-tour="streak-display"]',
    popover: {
      title: 'Focus Streak',
      description: 'Complete at least one focus session per day to build your streak. Planned off days won\'t break it!',
    },
  },
  {
    element: '[data-tour="xp-bar"]',
    popover: {
      title: 'XP & Levels',
      description: 'Earn 10 XP per completed session, plus 5 bonus XP when you share your results. Level up as you stay consistent.',
    },
  },
  {
    element: '[data-tour="recent-sessions"]',
    popover: {
      title: 'Session History',
      description: 'Your recent focus sessions appear here. Track your progress over time.',
    },
  },
  {
    element: '[data-tour="nav-settings"]',
    popover: {
      title: 'Customize Your Experience',
      description: 'Set default timer durations, manage distraction sites, and choose your off days in Settings.',
    },
  },
  {
    element: '[data-tour="nav-extension"]',
    popover: {
      title: 'Chrome Extension',
      description: 'See how the browser extension detects distractions and keeps you focused during sessions.',
    },
  },
];

export const focusTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Focus Session',
      description: 'This is where the magic happens. Choose your duration and lock in.',
    },
  },
  {
    element: '[data-tour="duration-picker"]',
    popover: {
      title: 'Choose Your Duration',
      description: 'Pick a preset or enter a custom time. From quick 15-minute sprints to deep 2-hour sessions.',
    },
  },
  {
    element: '[data-tour="start-session"]',
    popover: {
      title: 'Start Your Session',
      description: 'Hit start and we\'ll minimize distractions while you work. The Chrome extension monitors your tabs in the background.',
    },
  },
];

export const extensionTourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Extension Preview',
      description: 'This shows how the Hyperfocus Chrome extension works alongside the web app.',
    },
  },
  {
    element: '[data-tour="extension-popup"]',
    popover: {
      title: 'Extension Popup',
      description: 'Quick access to your stats, current task, and controls — right from your browser toolbar.',
    },
  },
  {
    element: '[data-tour="trigger-distraction"]',
    popover: {
      title: 'Distraction Detection',
      description: 'When you visit a distracting site during a session, you\'ll see a gentle reminder asking if it\'s helping your task.',
    },
  },
  {
    element: '[data-tour="trigger-tabs"]',
    popover: {
      title: 'Tab Overload Warning',
      description: 'Too many tabs open? The extension notices and asks if you\'re still focused.',
    },
  },
];
