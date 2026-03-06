import { useFonts } from 'expo-font';
import { Fredoka_400Regular } from '@expo-google-fonts/fredoka';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { Quicksand_400Regular } from '@expo-google-fonts/quicksand';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Satisfy_400Regular } from '@expo-google-fonts/satisfy';
import { Caveat_400Regular } from '@expo-google-fonts/caveat';
import { Sacramento_400Regular } from '@expo-google-fonts/sacramento';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { Cormorant_400Regular } from '@expo-google-fonts/cormorant';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather';

const FONT_MAP = {
  Fredoka_400Regular,
  Poppins_400Regular,
  Quicksand_400Regular,
  Lora_400Regular,
  Montserrat_400Regular,
  Nunito_400Regular,
  Inter_400Regular,
  DancingScript_400Regular,
  Pacifico_400Regular,
  Satisfy_400Regular,
  Caveat_400Regular,
  Sacramento_400Regular,
  PlayfairDisplay_400Regular,
  Cormorant_400Regular,
  CormorantGaramond_400Regular,
  DMSerifDisplay_400Regular,
  Merriweather_400Regular,
};

export function useAppFonts() {
  const [loaded, error] = useFonts(FONT_MAP);
  return [loaded, error] as const;
}
