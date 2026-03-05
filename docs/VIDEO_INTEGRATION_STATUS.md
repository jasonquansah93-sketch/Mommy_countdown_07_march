# Video-Integration – Vollständige Checkliste & Status

> **Hinweis:** Diese Zusammenfassung wurde aus dem vorherigen Chat (vor dem Cursor-Update) extrahiert.  
> Chat-ID: `a2f0d101-9f2b-462d-aba3-93d8d701c599`  
> **Letzte Aktualisierung:** 4. März 2025 – Übergänge: **Option A** (ein Übergang fürs ganze Video)

---

## 📋 VOLLSTÄNDIGE CHECKLISTE ZUM DOUBLE-CHECK

### 1. Architektur & Plattform
| Punkt | Entscheidung | ✓ |
|-------|--------------|---|
| Integration in Mommy Countdown (nicht eigene App) | ✅ | |
| On-Device (keine Cloud, keine Drittanbieter) | ✅ | |
| Plattform v1 | Nur iOS | |
| Technologie | React Native / Expo | |

### 2. Bildquelle
| Punkt | Entscheidung | ✓ |
|-------|--------------|---|
| Quelle | Nur Moments mit Fotos (aus Journey) | |
| Reihenfolge | Nutzer legt fest (per Drag & Drop) | |
| Zusätzliche Fotos aus Galerie | Nein (v1 nur Moments) | |

### 3. Video-Features (v1)
| Feature | Status | Details |
|---------|--------|---------|
| Fotos → Video-Slideshow | ✅ Pflicht | Basis-Funktion |
| Dauer pro Bild | ✅ Pflicht | Pro Bild unterschiedlich einstellbar |
| Wasserzeichen | ✅ Pflicht | Free: „Mommy Countdown“, Premium: ohne |
| Hintergrundmusik | ⏳ Später | Lizenzen müssen geklärt werden |
| Trimmen | ✅ Pflicht | Video kürzen (Anfang/Ende abschneiden) |
| Filter | ✅ Pflicht | 3 Filter (z.B. Sepia, Schwarz-Weiß, Vintage) |
| Übergänge | ✅ Pflicht | **3 Übergänge, EINER fürs ganze Video** (Option A) |
| Text auf Frames | ✅ Pflicht | Pro Bild: eigener Text, Position/Größe/Farbe einstellbar |
| Export | ✅ Pflicht | In Fotos-App speichern |

### 4. Technische Spezifikationen
| Punkt | Entscheidung | ✓ |
|-------|--------------|---|
| Seitenverhältnis | Auswahl durch Nutzer (9:16 oder 16:9) | |
| Auflösung | 1080p (1920×1080 bzw. 1080×1920) | |
| Qualität | High Quality, Instagram/TikTok-ready | |

### 5. Geplanter Flow (Reihenfolge)
1. **Bilder auswählen** – Moments mit Fotos, Reihenfolge festlegen
2. **Pro Bild** – Text (Position, Größe, Farbe) + Dauer einstellen
3. **Filter** – 1 von 3 wählen (fürs ganze Video)
4. **Übergang** – 1 von 3 wählen (fürs ganze Video)
5. **Wasserzeichen** – automatisch (Free) oder ohne (Premium)
6. **Video erzeugen** – mit Fortschrittsanzeige
7. **Trimmen** – Anfang/Ende kürzen
8. **Export** – in Fotos-App speichern

### 6. Premium-Logik
| Nutzer | Wasserzeichen |
|--------|---------------|
| Free | „Mommy Countdown“ sichtbar |
| Premium | Kein Wasserzeichen |

### 7. Aktueller technischer Stand
| Komponente | Status |
|------------|--------|
| FFmpeg-Kit | ❌ Entfernt (404 bei GitHub, Projekt archiviert) |
| journeyVideo.ts | Stub – zeigt nur Hinweismeldung |
| createJourneyVideo() | Signatur: `(imageUris: string[], withWatermark: boolean)` |
| Button „Video erstellen“ | Laut Chat vorhanden, sichtbar ab 1 Moment |
| Modal/UI | Laut Chat vorhanden – muss für vollen Flow erweitert werden |

### 8. Offene technische Entscheidung
| Option | Beschreibung | Aufwand |
|--------|---------------|---------|
| **A) On-Device** | FFmpeg-Fork oder alternatives Paket | Risiko: Fork kann verschwinden |
| **B) Server/Cloud** | Backend mit FFmpeg | Kosten: ~10–20 €/Monat (10–100 Nutzer) |

---

## ❓ KLÄRUNGSFRAGEN (für 99% sicher)

Bevor wir mit der Implementierung starten, bitte kurz bestätigen oder korrigieren:

1. **Filter:** Sind **Sepia, Schwarz-Weiß, Vintage** die gewünschten 3 Filter, oder andere?
2. **Übergänge:** Sind **Fade, Wischen, Zoom** die gewünschten 3 Übergänge, oder andere?
3. **Seitenverhältnis:** Wann wählt der Nutzer – am **Anfang** (vor Bildauswahl) oder **vor dem Export**?
4. **Bildquelle:** Nur Moments mit Fotos – oder soll der Nutzer auch **Fotos aus der Galerie** hinzufügen können?
5. **UI-Struktur:** Soll der Flow als **Schritt-für-Schritt-Wizard** (ein Screen pro Schritt) oder als **scrollbare Seite** mit allen Optionen umgesetzt werden?

---

*Erstellt am 4. März 2025 – Fortsetzung des Chats a2f0d101-9f2b-462d-aba3-93d8d701c599*
