export type TimerDisplayMode = 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

export interface BabyProfile {
  name: string;
  dueDate: string; // ISO date string
  startDate: string; // ISO date string — beginning of pregnancy
  gender?: 'boy' | 'girl' | 'surprise';
  timerDisplayMode: TimerDisplayMode;
  countdownStarted: boolean;
}

export interface Moment {
  id: string;
  photoUri: string;
  caption: string;
  week: number;
  createdAt: string; // ISO date string
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  week: number;
  icon: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
}

export interface AppTheme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export type TextColorMode = 'auto' | 'light' | 'dark' | 'custom';

export interface DesignSettings {
  themeId: string;
  colors: ThemeColors;
  fontFamily: string;
  presetId: string | null;
  hideGenderLabel?: boolean;
  backgroundPhoto: string | null; // URI
  filter: string;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  headlineText: string; // Editable headline text for preview
  textColorMode?: TextColorMode;
  customTextColor?: string;
}

export interface DesignPreset {
  id: string;
  name: string;
  description: string;
  themeId: string;
  fontFamily: string;
  filter: string;
  premium: boolean;
  hideGenderLabel?: boolean;
}
