import type { UserSettings } from '../types/settings';
import { DEFAULT_DISTRACTION_SITES } from '../constants/defaults';

export const MOCK_SETTINGS: UserSettings = {
  defaultFocusDuration: 25 * 60,
  defaultBreakDuration: 5 * 60,
  distractionSites: DEFAULT_DISTRACTION_SITES,
  offDays: [0, 6],
};
