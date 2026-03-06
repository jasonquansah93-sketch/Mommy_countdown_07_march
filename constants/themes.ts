import type { AppTheme, ThemeColors } from '../types';

/**
 * Warm Ivory / Light palette — "Apple product page meets premium lifestyle"
 *
 * Color philosophy:
 * Warm, inviting, light. Not clinical white, not dark cinema.
 * Think: soft linen, warm sand, gentle morning light.
 * Designed for an emotionally warm, trust-building experience —
 * exactly right for the pregnancy/baby audience.
 *
 * background — warm ivory canvas
 * surface — clean white for cards (contrast vs. background)
 * primary — the signature warm accent (terracotta, muted rose, etc.)
 * secondary — lighter variant for gradients
 * text — very dark warm brown (not cold black)
 * textSecondary — warm stone / mid-tone
 * accent — light warm sand for borders / dividers
 *
 * Paywall stays dark/cinematic — that contrast is intentional and powerful.
 */

export const DEFAULT_COLORS: ThemeColors = {
  primary: '#C4906A',
  secondary: '#D4AE8A',
  background: '#F8F4EE',
  surface: '#FFFFFF',
  text: '#2C2825',
  textSecondary: '#9A8F80',
  accent: '#E8E2D9',
};

export const THEMES: AppTheme[] = [
  {
    id: 'rose',
    name: 'Rose',
    colors: DEFAULT_COLORS,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      primary: '#9878B8',
      secondary: '#B8A0D4',
      background: '#F6F4FA',
      surface: '#FFFFFF',
      text: '#2A2030',
      textSecondary: '#8A8098',
      accent: '#E4DFF0',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#4A8CB8',
      secondary: '#7AB0D0',
      background: '#F2F7FB',
      surface: '#FFFFFF',
      text: '#1E2C38',
      textSecondary: '#7090A8',
      accent: '#D8EBF5',
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    colors: {
      primary: '#5A9870',
      secondary: '#82BC90',
      background: '#F3F8F4',
      surface: '#FFFFFF',
      text: '#1E2E22',
      textSecondary: '#6A8870',
      accent: '#D8EFE0',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#D48050',
      secondary: '#E8A870',
      background: '#FBF5EF',
      surface: '#FFFFFF',
      text: '#2E1E12',
      textSecondary: '#A07850',
      accent: '#F0E0CC',
    },
  },
  {
    id: 'boy',
    name: 'Boy',
    colors: {
      primary: '#4A80C4',
      secondary: '#7AAAE0',
      background: '#F2F6FB',
      surface: '#FFFFFF',
      text: '#1A2638',
      textSecondary: '#6080A8',
      accent: '#D8E8F8',
    },
  },
  {
    id: 'girl',
    name: 'Girl',
    colors: {
      primary: '#C4607A',
      secondary: '#E08898',
      background: '#FBF4F6',
      surface: '#FFFFFF',
      text: '#2E1820',
      textSecondary: '#A07080',
      accent: '#F5E0E6',
    },
  },
  {
    id: 'surprise',
    name: 'Surprise',
    colors: {
      primary: '#C4A050',
      secondary: '#D8BF78',
      background: '#FBF8F0',
      surface: '#FFFFFF',
      text: '#2A2010',
      textSecondary: '#A09060',
      accent: '#F0E8CC',
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    colors: {
      primary: '#C4906A',
      secondary: '#D4AE8A',
      background: '#F8F4EE',
      surface: '#FFFFFF',
      text: '#2C2825',
      textSecondary: '#9A8F80',
      accent: '#E8E2D9',
    },
  },
];
