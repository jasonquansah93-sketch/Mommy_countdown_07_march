# App per Kabel auf dem iPhone installieren

So installierst du **Mommy Countdown** direkt auf deinem iPhone, um alle Features (inkl. Video erstellen) vor dem App-Store-Release zu testen.

---

## Voraussetzungen

- **Mac** mit macOS
- **Xcode** aus dem App Store (aktuellste Version empfohlen)
- **Apple-ID** (kostenlos reicht für Installation auf dein Gerät)
- **iPhone** mit USB-Kabel
- **Projektordner** auf dem Mac: `mommy-count`

---

## Schritt 1: Terminal öffnen und ins Projekt wechseln

```bash
cd "/Users/Jason1/Claude code mommy countdown/mommy-count"
```

---

## Schritt 2: Abhängigkeiten installieren

```bash
npm install
```

Warte, bis alle Pakete installiert sind.

---

## Schritt 3: Native iOS-App erzeugen (Prebuild)

Damit FFmpeg und andere native Module eingebaut werden:

```bash
npx expo prebuild --clean
```

- Erstellt bzw. überschreibt den Ordner `ios/`.
- `--clean` sorgt für einen frischen Build.

---

## Schritt 4: iPhone verbinden

1. iPhone mit dem Mac per **USB-Kabel** verbinden.
2. Auf dem iPhone: Bei der Meldung **„Diesem Computer vertrauen?“** → **Vertrauen** tippen und ggf. Code eingeben.
3. iPhone entsperren, damit der Mac es erkennt.

---

## Schritt 5: App auf dem iPhone bauen und installieren

```bash
npx expo run:ios --device
```

- Es erscheint eine Liste mit Geräten. **Dein iPhone** auswählen (z. B. mit Pfeiltasten + Enter).
- Beim **ersten Mal** fragt Xcode nach deinem **Apple-ID-Login** (Signing). Apple-ID und Passwort eingeben.
- Auf dem iPhone: **Einstellungen → Allgemein → VPN & Geräteverwaltung** → dein Apple-ID-Developer-Eintrag → **Vertrauen** tippen.
- Der Build kann einige Minuten dauern. Danach wird die App **automatisch auf dem iPhone installiert** und gestartet.

---

## Schritt 6: Metro (Entwicklungs-Server) starten

Die App braucht Metro, um den JavaScript-Code zu laden:

1. **Neues Terminal-Fenster** öffnen (das andere mit dem Build kannst du schließen oder offen lassen).
2. Wieder ins Projekt wechseln und Metro starten:

```bash
cd "/Users/Jason1/Claude code mommy countdown/mommy-count"
npx expo start
```

3. **iPhone und Mac** sollten im **gleichen WLAN** sein.
4. App auf dem iPhone öffnen – sie verbindet sich mit Metro und lädt die App.

Wenn „No script URL“ o. Ä. erscheint: Prüfen, ob Mac und iPhone im gleichen WLAN sind; ggf. in Metro **„t“** drücken, um die App neu zu laden.

---

## Kurz-Checkliste

| Schritt | Befehl / Aktion |
|--------|------------------|
| 1 | `cd ".../mommy-count"` |
| 2 | `npm install` |
| 3 | `npx expo prebuild --clean` |
| 4 | iPhone per Kabel verbinden, „Vertrauen“ bestätigen |
| 5 | `npx expo run:ios --device` → iPhone wählen, ggf. Apple-ID für Signing angeben |
| 6 | In neuem Terminal: `npx expo start` – App auf dem iPhone öffnen |

---

## Häufige Probleme

**„xcodebuild requires Xcode, but active developer directory is Command Line Tools“**

- Xcode muss als aktives Developer-Tool gesetzt sein. Im Terminal:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```
- Xcode einmal öffnen und ggf. Lizenz bestätigen.

**„No signing certificate“ / Signing-Fehler**

- In Xcode: Projekt `ios/mommycount.xcworkspace` öffnen, links dein Projekt wählen, Tab **Signing & Capabilities** → **Team** deine Apple-ID wählen („Personal Team“ reicht).
- Oder beim ersten `npx expo run:ios --device` die angezeigte Apple-ID bestätigen.

**„No script URL provided“ auf dem iPhone**

- Metro muss laufen: `npx expo start` in einem Terminal.
- Mac und iPhone im gleichen WLAN.

**„Video erstellen“ zeigt Hinweis / funktioniert nicht**

- Das Video-Feature ist derzeit deaktiviert (FFmpeg-Kit-Projekt archiviert, Downloads nicht mehr verfügbar). Der Button zeigt einen Hinweis. Alle anderen Features können getestet werden.

**App erscheint nicht auf dem iPhone**

- In Xcode prüfen: Oben als Ziel **dein iPhone** (nicht Simulator) ausgewählt?
- Nochmals `npx expo run:ios --device` ausführen und das richtige Gerät wählen.

---

## Später: Nur Code-Änderungen testen

Wenn die App schon einmal installiert wurde:

1. iPhone verbinden (optional, für Debugging).
2. Im Projektordner: `npx expo start` starten.
3. App auf dem iPhone öffnen – sie lädt den aktuellen Code von Metro.

Einen neuen **nativen** Build (z. B. nach `npm install` neuer Pakete oder Änderungen an `app.json` / Plugins) erzeugst du wieder mit:

```bash
npx expo prebuild --clean
npx expo run:ios --device
```

Damit hast du eine klare Anleitung, die App per Kabel auf dem iPhone zu installieren und alle Features vor dem App-Store-Release zu testen.
