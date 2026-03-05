# Video-Integration – Finale Spezifikation

> **Status:** Alle Punkte bestätigt – bereit für Implementierung  
> **Stand:** 4. März 2025

---

## Zielgruppe & Design

- First-time mothers, planned pregnancy, urban/US
- Instagram & Pinterest aesthetic
- Japandi, sand, wood, linen, soft neutrals
- Calm, intentional, editorial – kein kitschiges Pink/Blau

---

## 1. Architektur

| Punkt | Entscheidung |
|-------|--------------|
| Integration | Direkt in Mommy Countdown |
| Technik | Native AVFoundation (Swift) – kein FFmpeg, keine Cloud |
| Plattform v1 | Nur iOS |
| Abhängigkeiten | Keine externen Drittanbieter |

---

## 2. Wizard-Flow (8 Schritte)

1. **Seitenverhältnis** – 9:16 oder 16:9 (am Anfang, damit Bilder angepasst werden)
2. **Bilder** – Moments mit Fotos + optional „Aus Galerie hinzufügen“, Reihenfolge per Drag & Drop
3. **Pro Bild** – Scrollbare Liste, pro Bild: Text (Position, Größe, Farbe) + Dauer (2–10 s, Default 4 s)
4. **Filter** – 1 von 3: Sepia, Schwarz-Weiß, Vintage
5. **Übergang** – 1 von 3: Fade, Wischen, Zoom (fürs ganze Video)
6. **Erzeugen** – Fortschrittsanzeige
7. **Trimmen** – Anfang/Ende kürzen
8. **Export** – In Fotos-App speichern

---

## 3. Bild-Zuschnitt

| Option | Default | Beschreibung |
|--------|---------|--------------|
| **B) Letterbox/Pillarbox** | ✅ | Bild voll sichtbar, Blur-Balken oben/unten oder links/rechts |
| **C) Manueller Zuschnitt** | Optional | Nutzer kann pro Bild auf manuellen Zuschnitt umstellen |

- Default: B (Letterbox mit Blur)
- Toggle pro Bild: „Automatisch“ / „Manuell zuschneiden“

---

## 4. Pro-Bild-Editor

- **Ein Schritt** mit scrollbarer Liste
- Jedes Bild ausklappbar: Text, Dauer, Zuschnitt (Auto/Manuell)
- Optional: „Überspringen“ für Bilder ohne Text

---

## 5. Dauer pro Bild

| Parameter | Wert |
|-----------|------|
| Standard | 4 Sekunden |
| Minimum | 2 Sekunden |
| Maximum | 10 Sekunden |

---

## 6. Wasserzeichen (Free)

| Parameter | Wert |
|-----------|------|
| Text | „Mommy Countdown“ |
| Position | Unten mittig |
| Stil | Weiß, halbtransparent, dezente Schrift |
| Premium | Kein Wasserzeichen |

---

## 7. Technische Spezifikationen

| Parameter | Wert |
|-----------|------|
| Auflösung | 1080p (1920×1080 bzw. 1080×1920) |
| Qualität | Instagram/TikTok-ready |
| Filter | Sepia, Schwarz-Weiß, Vintage |
| Übergänge | Fade, Wischen, Zoom (einer fürs ganze Video) |

---

## 8. Implementierungs-Komponenten

### Native (Swift)
- `VideoComposer` – AVFoundation-basierte Video-Erstellung
- Bild → Video, Filter (CIFilter), Übergänge, Text-Overlay, Wasserzeichen
- Letterbox/Pillarbox und manueller Zuschnitt
- Export in Fotos-App

### React Native
- Wizard-UI (8 Schritte)
- `createJourneyVideo()` erweitern – ruft natives Modul auf
- Premium-Erkennung (Wasserzeichen ja/nein)

---

## 9. Premium-Logik

- **Free:** Wasserzeichen „Mommy Countdown“
- **Premium:** Kein Wasserzeichen
- Premium-System (RevenueCat o.ä.) muss für Wasserzeichen-Logik angebunden werden

---

*Spezifikation abgeschlossen – bereit für Implementierung*
