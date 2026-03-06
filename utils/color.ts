/**
 * Color utility functions.
 */

/**
 * Darken or lighten a hex color by a percentage.
 * Negative percent = darker, positive = lighter.
 */
export function shadeColor(hex: string, percent: number): string {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) return hex;
  const r = Math.min(255, Math.max(0, Math.round(parseInt(cleaned.slice(0, 2), 16) * (1 + percent / 100))));
  const g = Math.min(255, Math.max(0, Math.round(parseInt(cleaned.slice(2, 4), 16) * (1 + percent / 100))));
  const b = Math.min(255, Math.max(0, Math.round(parseInt(cleaned.slice(4, 6), 16) * (1 + percent / 100))));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * Blend two hex colors together.
 * weight = 0 → all color1, weight = 1 → all color2.
 *
 * Example: blendColors('#FFFFFF', '#FFB6D9', 0.5) → '#FFD8EC'
 * Used to create visible background gradient stops from theme accent colors.
 */
export function blendColors(hex1: string, hex2: string, weight: number): string {
  const c1 = hex1.replace('#', '');
  const c2 = hex2.replace('#', '');
  if (c1.length !== 6 || c2.length !== 6) return hex1;
  const r = Math.round(parseInt(c1.slice(0, 2), 16) * (1 - weight) + parseInt(c2.slice(0, 2), 16) * weight);
  const g = Math.round(parseInt(c1.slice(2, 4), 16) * (1 - weight) + parseInt(c2.slice(2, 4), 16) * weight);
  const b = Math.round(parseInt(c1.slice(4, 6), 16) * (1 - weight) + parseInt(c2.slice(4, 6), 16) * weight);
  return '#' + [r, g, b].map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
}
