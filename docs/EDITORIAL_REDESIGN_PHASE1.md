# Editorial Redesign — Phase 1

## Zusammenfassung

Phase 1 des Editorial Redesigns ist umgesetzt. Der Home Screen nutzt eine neue, ruhigere Designsprache: warm, clean, editorial, mit mehr Luft und weicheren Kontrasten.

---

## Designsystem-Elemente

### Theme (`theme/editorialTheme.ts`)
- **EDITORIAL**: Farbpalette (background, surface, primary, text, textSecondary, border)
- **EDITORIAL_SPACING**: Mehr Abstand (screenH: 20, sectionGap: 36)
- **EDITORIAL_RADIUS**: Weichere Ecken (card: 24)
- **EDITORIAL_SHADOW**: Dezente Schatten
- **EDITORIAL_TYPOGRAPHY**: Headlines, Section Titles, Body

### Basiskomponenten (`components/editorial/`)
- **EditorialScreen**: Warm creme Hintergrund
- **EditorialHeader**: Ruhiger Header mit Brand (MommyCount), ohne harte Linien
- **EditorialCard**: Weiche Card mit subtilen Rändern
- **EditorialButton**: Dezenter CTA (primary, secondary, ghost)
- **EditorialSectionTitle**: Sektionsüberschriften
- **EditorialPill**: Dezentes Tag/Badge

---

## Geänderte / neue Dateien

### Neu erstellt
| Datei | Beschreibung |
|-------|--------------|
| `theme/editorialTheme.ts` | Editorial Design Tokens |
| `components/editorial/EditorialScreen.tsx` | Screen-Container |
| `components/editorial/EditorialHeader.tsx` | Header-Komponente |
| `components/editorial/EditorialCard.tsx` | Card-Komponente |
| `components/editorial/EditorialButton.tsx` | Button-Komponente |
| `components/editorial/EditorialSectionTitle.tsx` | Sektionsüberschrift |
| `components/editorial/EditorialPill.tsx` | Pill/Tag-Komponente |
| `components/editorial/index.ts` | Barrel-Export |
| `components/home/HomeScreenEditorial.tsx` | Redesign Home Screen |
| `constants/editorialFeature.ts` | Feature-Flag |
| `docs/EDITORIAL_REDESIGN_PHASE1.md` | Diese Dokumentation |

### Geändert
| Datei | Änderung |
|-------|----------|
| `app/(tabs)/index.tsx` | Import von HomeScreenEditorial, Feature-Flag-Check, bedingte Anzeige |

---

## Alt vs. Neu vergleichen

**Feature-Flag:** `constants/editorialFeature.ts`

```ts
export const USE_EDITORIAL_HOME = true;   // → Editorial Home
export const USE_EDITORIAL_HOME = false;  // → Original Home
```

1. `USE_EDITORIAL_HOME = true` setzen → Editorial Home anzeigen
2. `USE_EDITORIAL_HOME = false` setzen → Original Home anzeigen
3. App neu laden (Metro/Expo)

---

## Lokal testen

```bash
cd /Users/Jason1/mommy-count
npx expo start --ios
```

Der Home-Tab zeigt je nach Feature-Flag den Editorial- oder Original-Screen.

---

## Parallel vs. Überschrieben

- **Parallel:** Der neue Home Screen ist eine separate Komponente (`HomeScreenEditorial.tsx`)
- **Original:** `index.tsx` und alle bestehenden Home-Komponenten bleiben unverändert
- **Umschaltung:** Nur über den Feature-Flag in `editorialFeature.ts`

---

## Offene Punkte / Nicht angefasst

- **Design, Journey, Profile Tabs:** Unverändert
- **Tab Bar:** Verwendet weiterhin `constants/colors.ts`
- **HeroCountdownCard, TimeRemainingCard, etc.:** Unverändert, nutzen DesignContext-Farben
- **Premium:** Keine Änderungen
- **Medizinische Anmutung:** Keine
- **Neue Features:** Keine

---

## Risiken

- Die Child-Komponenten (HeroCountdownCard, JourneyProgress, …) nutzen weiterhin die DesignContext-Farben. Bei Theme „basic“ sind diese bereits warm; bei anderen Themes kann der Kontrast zum Editorial-Hintergrund variieren.
