export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  totalXp: number;
  level: number;
  createdAt: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  offDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
}
