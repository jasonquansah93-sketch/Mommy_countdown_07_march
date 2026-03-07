/**
 * Editorial Design System — warm, calm, premium.
 * Japandi / linen / beige / sepia / soft translucency.
 *
 * Design principles:
 * - weniger Linien, mehr Luft
 * - sanftere Kontraste
 * - weichere Cards
 * - subtilere Ränder
 * - kuratierte Typografie
 * - kein verspieltes Baby-App-Design
 */

export const EDITORIAL = {
  /** Background: sehr helles warmes Creme / Off-White */
  background: '#F8F4EE' as const,

  /** Surface: soft warm neutral — für Cards */
  surface: '#FFFFFF' as const,

  /** Surface muted: noch weicher für sekundäre Flächen */
  surfaceMuted: '#F5F2EC' as const,

  /** Primary Accent: dezentes Sand / Bronze / warm taupe */
  primary: '#B8A088' as const,

  /** Primary light: für Hover/Active */
  primaryLight: '#D4C4B0' as const,

  /** Text Primary: soft dark charcoal, nicht reines Schwarz */
  text: '#2C2825' as const,

  /** Text Secondary: warm muted taupe/stone */
  textSecondary: '#8A7F75' as const,

  /** Text muted: noch dezenter */
  textMuted: '#A89F95' as const,

  /** Borders: sehr subtil */
  border: 'rgba(0,0,0,0.06)' as const,
  borderStrong: 'rgba(0,0,0,0.10)' as const,

  /** Overlay für soft-translucent Effekte */
  overlay: 'rgba(248,244,238,0.85)' as const,
} as const;

export const EDITORIAL_SPACING = {
  screenH: 20,
  cardGap: 20,
  sectionGap: 36,
  cardPad: 24,
  heroPad: 32,
} as const;

export const EDITORIAL_RADIUS = {
  card: 24,
  inner: 16,
  pill: 28,
  button: 24,
} as const;

export const EDITORIAL_SHADOW = {
  /** Sehr weicher Schatten für Cards */
  card: {
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  } as const,
  /** Noch subtiler */
  subtle: {
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  } as const,
} as const;

export const EDITORIAL_TYPOGRAPHY = {
  /** Headlines: klar und ruhig */
  headline: {
    fontSize: 28,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
  },
  headlineLarge: {
    fontSize: 36,
    fontWeight: '200' as const,
    letterSpacing: -0.8,
  },
  /** Section titles */
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
  },
  /** Body */
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
} as const;
