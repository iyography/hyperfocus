export interface DistractionSite {
  id: string;
  urlPattern: string;
  label: string;
  enabled: boolean;
}

export interface UserSettings {
  defaultFocusDuration: number; // seconds
  defaultBreakDuration: number; // seconds
  distractionSites: DistractionSite[];
  offDays: number[]; // 0=Sunday, ..., 6=Saturday
}
