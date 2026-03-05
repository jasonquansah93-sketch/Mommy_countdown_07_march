# Video-Integration – Implementierungsplan

> **Stand:** 4. März 2025  
> **Basis:** VIDEO_INTEGRATION_SPEC.md

---

## Übersicht

| Phase | Inhalt | Geschätzte Dauer |
|-------|--------|------------------|
| **M1** | Native VideoComposer (Swift) – Kern | 2–3 Tage |
| **M2** | Expo Module + React Native Bridge | 0.5–1 Tag |
| **M3** | Wizard UI (8 Schritte) | 2–3 Tage |
| **M4** | Integration & Polish | 1 Tag |

**Gesamt:** ca. 6–8 Tage

---

## Meilenstein 1: Native VideoComposer (Swift) ✅

### 1.1 AVFoundation-Kern
- [x] `VideoComposerEngine.swift` – Hauptklasse
- [ ] Bilder → Video (AVAssetWriter, CMSampleBuffer)
- [ ] Seitenverhältnis 9:16 / 16:9
- [ ] Letterbox/Pillarbox mit Blur
- [ ] Dauer pro Bild (2–10 s)

### 1.2 Filter (CIFilter)
- [x] Sepia
- [x] Schwarz-Weiß
- [x] Vintage

### 1.3 Übergänge
- [x] Fade (Basis – Crossfade via Frame-Dauer)
- [ ] Wischen (Wipe) – v2
- [ ] Zoom – v2

### 1.4 Text & Wasserzeichen
- [x] Text-Overlay pro Bild (zentriert)
- [x] Wasserzeichen „Mommy Countdown" (unten mittig, halbtransparent)

### 1.5 Trimmen & Export
- [x] Trimmen (Anfang/Ende) – AVAssetExportSession
- [x] Export in Fotos-App (PHPhotoLibrary)

### 1.6 Zuschnitt pro Bild
- [x] Letterbox (Automatisch)
- [x] Crop (Manuell / Center-Crop)

---

## Meilenstein 2: Expo Module + Bridge

### 2.1 Native Module
- [ ] Expo Config Plugin für VideoComposer
- [ ] Swift-Modul in `ios/` einbinden (über Config Plugin)
- [ ] RCTBridgeModule oder Expo Modules API

### 2.2 JavaScript-Interface
- [ ] `createJourneyVideo(options)` erweitern
- [ ] Parameter: images, aspectRatio, durations, filter, transition, watermark, trimStart, trimEnd
- [ ] Fortschritts-Callback
- [ ] Fehlerbehandlung

---

## Meilenstein 3: Wizard UI ✅

### 3.1 App-Struktur
- [x] `app/` Verzeichnis mit expo-router
- [x] `main: "expo-router/entry"` in package.json
- [x] Journey-Screen/Tab

### 3.2 Wizard-Screens (v2)
- [x] Step 1: Seitenverhältnis (9:16 / 16:9)
- [x] Step 2: Bilder (Galerie, Reihenfolge)
- [x] Step 3: Pro Bild (Text, Dauer, Zuschnitt Letterbox/Crop)
- [x] Step 4: Filter (none, Sepia, BW, Vintage)
- [x] Step 5: Übergang (Fade, Wischen, Zoom)
- [x] Step 6: Trimmen (Start/Ende Slider)
- [x] Step 7: Erzeugen (Fortschrittsanzeige)
- [x] Step 8: Export (Fertig-Screen)

### 3.3 Design
- [x] Japandi / warm minimal (colors.ts)
- [x] Fortschrittsanzeige (z.B. 3/8)
- [x] Zurück-Button

---

## Meilenstein 4: Integration & Polish

- [ ] Premium-Erkennung (Wasserzeichen ja/nein)
- [ ] Fehlerbehandlung (Expo Go, fehlende Berechtigungen)
- [ ] Tests auf echtem Gerät

---

## Technische Abhängigkeiten

| Komponente | Status |
|------------|--------|
| expo-media-library | ✅ Berechtigungen für Fotos |
| expo-file-system | ✅ Temporäre Dateien |
| PregnancyContext / Moments | ⚠️ Prüfen ob vorhanden |
| Premium-System | ⚠️ Später ergänzen |

---

## Nächster Schritt

**Start:** Meilenstein 1 – Native VideoComposer (Swift)
