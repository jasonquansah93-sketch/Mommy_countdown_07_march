/**
 * Maps design font names (used in presets/typography) to actual loaded font family names.
 * Fonts must be loaded via useFonts in app root.
 */
export const FONT_FAMILY_MAP: Record<string, string> = {
  Fredoka: 'Fredoka_400Regular',
  Poppins: 'Poppins_400Regular',
  Quicksand: 'Quicksand_400Regular',
  Lora: 'Lora_400Regular',
  Montserrat: 'Montserrat_400Regular',
  Nunito: 'Nunito_400Regular',
  Inter: 'Inter_400Regular',
  'Dancing Script': 'DancingScript_400Regular',
  Pacifico: 'Pacifico_400Regular',
  Satisfy: 'Satisfy_400Regular',
  Caveat: 'Caveat_400Regular',
  Sacramento: 'Sacramento_400Regular',
  'Playfair Display': 'PlayfairDisplay_400Regular',
  Cormorant: 'Cormorant_400Regular',
  'Cormorant Garamond': 'CormorantGaramond_400Regular',
  'DM Serif Display': 'DMSerifDisplay_400Regular',
  Merriweather: 'Merriweather_400Regular',
};

export function getResolvedFontFamily(designFont: string | undefined): string | undefined {
  if (!designFont) return undefined;
  return FONT_FAMILY_MAP[designFont] ?? designFont;
}
