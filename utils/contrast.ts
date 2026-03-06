/**
 * Text contrast utilities for accessibility.
 * Detects background brightness and returns readable text colors.
 */

export type TextColorMode = 'auto' | 'light' | 'dark' | 'custom';

const LIGHT_TEXT = '#FFFFFF';
const DARK_TEXT = '#1a1a1a';

/**
 * Parse hex or rgb/rgba color to RGB components (0-255).
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const cleaned = trimmed.slice(1);
    if (cleaned.length === 3) {
      const r = parseInt(cleaned[0] + cleaned[0], 16);
      const g = parseInt(cleaned[1] + cleaned[1], 16);
      const b = parseInt(cleaned[2] + cleaned[2], 16);
      return { r, g, b };
    }
    if (cleaned.length === 6) {
      const r = parseInt(cleaned.slice(0, 2), 16);
      const g = parseInt(cleaned.slice(2, 4), 16);
      const b = parseInt(cleaned.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return null;
}

/**
 * WCAG relative luminance (0–1). Higher = lighter background.
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = parseColor(hex);
  if (!rgb) return 0.5; // fallback to mid
  const { r, g, b } = rgb;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.587 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns true if background is light (use dark text).
 */
export function isLightBackground(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.5;
}

/**
 * Get badge text color - always auto contrast against badge background.
 * Badge decouples from global text color to ensure readability.
 */
export function getBadgeTextColor(badgeBackgroundHex: string): string {
  return getContrastingTextColor(badgeBackgroundHex, 'auto', undefined);
}

/**
 * Get contrasting text color for a background.
 * - auto: white on dark bg, dark on light bg
 * - light: always white
 * - dark: always dark
 * - custom: use provided color
 */
export function getContrastingTextColor(
  backgroundColor: string,
  mode: TextColorMode,
  customColor?: string
): string {
  if (mode === 'light') return LIGHT_TEXT;
  if (mode === 'dark') return DARK_TEXT;
  if (mode === 'custom' && customColor) return customColor;
  // auto
  return isLightBackground(backgroundColor) ? DARK_TEXT : LIGHT_TEXT;
}
