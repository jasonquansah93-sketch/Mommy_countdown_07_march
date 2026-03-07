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
  sectionGap: 44,
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
  /** Sehr weicher Schatten — warm paper / linen feel */
  card: {
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  } as const,
  /** Noch subtiler — tonale Schichtung */
  subtle: {
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  } as const,
} as const;

export const EDITORIAL_TYPOGRAPHY = {
  /** Hero headline — ruhig, editorial */
  headline: {
    fontSize: 26,
    fontWeight: '300' as const,
    letterSpacing: 0.2,
  },
  headlineLarge: {
    fontSize: 36,
    fontWeight: '200' as const,
    letterSpacing: -0.8,
  },
  /** Section titles — leiser, uppercase feel */
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
  /** Support text — noch ruhiger */
  support: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.8,
  },
} as const;
