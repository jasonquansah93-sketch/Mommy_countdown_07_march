import type { DesignPreset } from '../types';

export const DESIGN_PRESETS: DesignPreset[] = [
  // ── Free Presets ────────────────────────────────────────────────────────
  {
    id: 'basic',
    name: 'Basic',
    description: 'Warm ivory, refined minimal — the signature look',
    themeId: 'basic',
    fontFamily: 'Poppins',
    filter: 'none',
    premium: false,
    hideGenderLabel: true,
  },
  {
    id: 'boy',
    name: 'Boy',
    description: 'Soft blue, clean modern sans-serif, light minimal',
    themeId: 'boy',
    fontFamily: 'Poppins',
    filter: 'none',
    premium: false,
    hideGenderLabel: false,
  },
  {
    id: 'girl',
    name: 'Girl',
    description: 'Soft rose, rounded sans-serif, soft pastel',
    themeId: 'girl',
    fontFamily: 'Quicksand',
    filter: 'soft',
    premium: false,
    hideGenderLabel: false,
  },
  {
    id: 'surprise',
    name: 'Surprise',
    description: 'Warm sand, elegant serif, minimal timeless',
    themeId: 'surprise',
    fontFamily: 'Lora',
    filter: 'neutral',
    premium: false,
    hideGenderLabel: false,
  },

  // ── Signature Collection (Premium) ─────────────────────────────────────
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Warm cream, refined editorial serif',
    themeId: 'basic',
    fontFamily: 'Cormorant Garamond',
    filter: 'neutral',
    premium: true,
    hideGenderLabel: true,
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Sunset warmth, luminous and timeless',
    themeId: 'sunset',
    fontFamily: 'Playfair Display',
    filter: 'warm',
    premium: true,
    hideGenderLabel: false,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    description: 'Soft rose, flowing script, tender',
    themeId: 'girl',
    fontFamily: 'Dancing Script',
    filter: 'soft',
    premium: true,
    hideGenderLabel: false,
  },
  {
    id: 'moonrise-preset',
    name: 'Moonrise',
    description: 'Slate blue, quiet and strong',
    themeId: 'moonrise',
    fontFamily: 'DM Serif Display',
    filter: 'neutral',
    premium: true,
    hideGenderLabel: true,
  },
  {
    id: 'terracotta-preset',
    name: 'Terracotta',
    description: 'Warm earth, deeply personal',
    themeId: 'terracotta',
    fontFamily: 'Merriweather',
    filter: 'warm',
    premium: true,
    hideGenderLabel: false,
  },
];

export const PRIMARY_FONTS = [
  { name: 'Fredoka',   premium: false },
  { name: 'Poppins',   premium: false },
  { name: 'Quicksand', premium: false },
  { name: 'Nunito',    premium: false },
  { name: 'Inter',     premium: false },
];

/** Typography-Tab: 6 free + 9 premium Signature fonts */
export const TYPOGRAPHY_FONTS = [
  // Free
  { name: 'Fredoka',   premium: false },
  { name: 'Poppins',   premium: false },
  { name: 'Quicksand', premium: false },
  { name: 'Nunito',    premium: false },
  { name: 'Inter',     premium: false },
  { name: 'Lora',      premium: false },
  // Signature (Premium)
  { name: 'Playfair Display',   premium: true },
  { name: 'Cormorant Garamond', premium: true },
  { name: 'DM Serif Display',   premium: true },
  { name: 'Merriweather',       premium: true },
  { name: 'Dancing Script',     premium: true },
  { name: 'Sacramento',         premium: true },
  { name: 'Satisfy',            premium: true },
  { name: 'Caveat',             premium: true },
  { name: 'Pacifico',           premium: true },
];

export const SCRIPT_FONTS = [
  { name: 'Dancing Script', premium: true },
  { name: 'Pacifico',       premium: true },
  { name: 'Satisfy',        premium: true },
  { name: 'Caveat',         premium: true },
  { name: 'Sacramento',     premium: true },
];

export const ELEGANT_FONTS = [
  { name: 'Playfair Display',   premium: true },
  { name: 'Cormorant',          premium: true },
  { name: 'Cormorant Garamond', premium: true },
  { name: 'DM Serif Display',   premium: true },
  { name: 'Lora',               premium: true },
  { name: 'Merriweather',       premium: true },
];

export const FILTERS = [
  { id: 'none',    name: 'None'    },
  { id: 'warm',    name: 'Warm'    },
  { id: 'soft',    name: 'Soft'    },
  { id: 'pastel',  name: 'Pastel'  },
  { id: 'bright',  name: 'Bright'  },
  { id: 'neutral', name: 'Neutral' },
];
