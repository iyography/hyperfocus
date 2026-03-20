import type { UserProfile, StreakInfo } from '../types/user';

export const MOCK_USER: UserProfile = {
  id: 'demo-user-001',
  email: 'alex@example.com',
  displayName: 'Alex Rivera',
  totalXp: 847,
  level: 4,
  createdAt: '2026-03-01T08:00:00Z',
};

export const MOCK_STREAK: StreakInfo = {
  currentStreak: 12,
  longestStreak: 12,
  lastSessionDate: '2026-03-19',
  offDays: [0, 6], // Sat & Sun
};
