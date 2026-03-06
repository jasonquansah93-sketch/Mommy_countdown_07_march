/**
 * Design tokens — single source of truth for shadows, radii, spacing, and gradients.
 *
 * PREMIUM RULE: GRADIENT.cinematic must ONLY be used on premium-exclusive screens
 * (paywall, ambient mode). Do NOT apply it to any free-tier tab screen.
 */

import { blendColors } from '../utils/color';

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOW = {
  /** Barely-there elevation — inline text badges, minor elements */
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  /** Standard card elevation */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 7,
  },
  /** Featured / hero card elevation */
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
  },
  /** Modal / bottom sheet */
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  /**
   * Primary-colored glow — applied to gradient CTA buttons.
   * Call with the active theme's primary color.
   */
  glow: (primaryColor: string) => ({
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  }),
} as const;

// ─── Border radii ─────────────────────────────────────────────────────────────
export const RADIUS = {
  card: 20,
  inner: 14,
  pill: 28,
  button: 28,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = {
  screenH: 16,
  cardGap: 14,
  sectionGap: 28,
  cardPad: 22,
} as const;

// ─── Glass / Card surface ──────────────────────────────────────────────────────
/**
 * Card surface system — warm white cards floating on the ivory background.
 *
 * On light backgrounds:
 *   surface = pure white (#FFFFFF / rgba equivalent)
 *   border  = ultra-subtle warm dark border
 *   shadow  = soft warm shadow (Apple product-page style)
 *
 * Usage: backgroundColor: GLASS.surface, borderWidth: 1, borderColor: GLASS.border, ...GLASS.shadow
 */
export const GLASS = {
  /** White card surface — visibly lifted above the warm ivory background */
  surface: '#FFFFFF' as const,
  /** Ultra-subtle warm border — refines card edge without being harsh */
  border: 'rgba(0,0,0,0.06)' as const,
  /** Slightly stronger border for interactive or focused elements */
  borderStrong: 'rgba(0,0,0,0.12)' as const,
  /** Warm soft shadow — depth without darkness (Apple product style) */
  shadow: {
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  } as const,
  /** Lighter shadow for small inline elements */
  shadowSubtle: {
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  } as const,
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────
export const GRADIENT = {
  /**
   * PREMIUM cinematic gradient — MORE saturated and vivid than free dark screens.
   * Free screens use calm deep #0D0718. This is noticeably more vibrant.
   * Used exclusively on paywall.tsx and ambient.tsx.
   */
  cinematic: ['#0A0420', '#2A0A6A', '#5A14A0', '#7B24C4'] as const,

  /**
   * Free base warm gradient — VISIBLY tinted from white to a blended accent.
   *
   * Uses the theme's surface (white) as the top stop and blends it with the
   * accent color at 45% weight for the bottom stop. This produces a clearly
   * perceptible, elegant warm tint on every theme without being overpowering.
   *
   * Examples:
   *   Rose:     #FFFFFF → #FFD4E9
   *   Lavender: #FFFFFF → #E3DAFF
   *   Ocean:    #FFFFFF → #CEEEFF
   *   Sage:     #FFFFFF → #D5ECCE
   *   Sunset:   #FFFFFF → #FFE2C4
   */
  warmBase: (surface: string, accent: string): [string, string] => [
    surface,
    blendColors(surface, accent, 0.45),
  ],
} as const;
