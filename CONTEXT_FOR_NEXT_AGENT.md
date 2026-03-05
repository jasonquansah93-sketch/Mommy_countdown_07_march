# Kontext für nächsten Agent: "No script URL provided" Fehler

---

## TL;DR – Kernherausforderung

**Aufgabe:** Die App zeigt "No script URL provided" und lädt kein JavaScript. Der nächste Agent soll das so beheben, dass die App **zuverlässig startet, wenn Metro läuft** – egal ob der Nutzer sie über das App-Icon oder den QR-Code öffnet.

**Ursache in einem Satz:** `RCTBundleURLProvider` liefert `nil` (weil Metro nicht erreichbar erscheint oder ip.txt veraltet ist), und es gibt kein eingebettetes Bundle (SKIP_BUNDLING) → die App hat keine Script-URL.

**Nutzerfrage:** "Why does this mistake appear again?"

---

## 1. Fehlermeldung (Screenshot)

```
No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle. unsanitizedScriptURLString = (null)
```

Die App zeigt einen roten Banner, darunter einen schwarzen Bildschirm. Buttons: Dismiss, Reload JS, Copy, Extra Info.

---

## 2. Projekt-Übersicht

| Eigenschaft | Wert |
|-------------|------|
| **Projekt** | Mommy Countdown |
| **Projektpfad** | `/Users/Jason1/mommy-count` (absolut verwenden) |
| **Stack** | React Native / Expo SDK 54 |
| **Plattform** | iOS (physisches iPhone) |
| **Besonderheit** | Custom native module `video-composer` (AVFoundation) – funktioniert NICHT in Expo Go |

---

## 3. Technische Ursachenanalyse

### Ablauf beim App-Start (Debug-Build auf physischem Gerät)

1. **AppDelegate.swift** ruft `bundleURL()` auf:
   ```swift
   override func bundleURL() -> URL? {
   #if DEBUG
     return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
   #else
     return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
   #endif
   }
   ```

2. **RCTBundleURLProvider** (`node_modules/react-native/React/Base/RCTBundleURLProvider.mm`):
   - Ermittelt `packagerServerHostPort` über:
     - `jsLocation` (UserDefaults, manuell gesetzt) ODER
     - `guessPackagerHost()` – liest `ip.txt` aus dem App-Bundle, prüft dann `isPackagerRunning(host)`
   - Wenn `packagerServerHostPort == nil` → Fallback: `Bundle.main.url(forResource: "main", withExtension: "jsbundle")`
   - **SKIP_BUNDLING** ist aktiv → es gibt **kein** `main.jsbundle` in der App → Fallback gibt `nil` zurück
   - Ergebnis: `unsanitizedScriptURLString = (null)`

3. **Warum gibt `packagerServerHostPort` nil zurück?**
   - `guessPackagerHost()` liest `ip.txt` (Mac-IP zum Build-Zeitpunkt)
   - Ruft `isPackagerRunning(host)` auf – **synchroner** HTTP-Request zu `http://<host>:<port>/status`
   - Wenn Metro nicht läuft, Netzwerk fehlt, Firewall blockiert, oder IP sich geändert hat (DHCP) → `nil`
   - Ohne `jsLocation` (UserDefaults) und ohne laufenden Packager → `nil`

4. **ip.txt:**
   - Wird in `react-native-xcode.sh` geschrieben (vor dem SKIP_BUNDLING-Exit)
   - Enthält die Mac-IP zum Build-Zeitpunkt (z.B. 192.168.0.173)
   - Nach 24h oder neuem Netzwerk: IP kann sich geändert haben (DHCP)

### Wann tritt der Fehler auf?

- Metro-Server läuft nicht (z.B. 24h nach letztem Start)
- App wird über App-Icon gestartet (nicht über QR-Code/Deep-Link)
- Mac-IP hat sich geändert (DHCP)
- Netzwerkprobleme zwischen iPhone und Mac

### Wann funktioniert es?

- Metro läuft, App wird über QR-Code geöffnet → URL wird per Deep-Link übergeben (`sourceURL` nutzt `bridge.bundleURL`)
- Oder: Metro läuft, ip.txt ist aktuell, `isPackagerRunning` erfolgreich

### Port-Hinweis

- Metro (Expo) läuft typisch auf **8082**, React Native Default ist 8081
- `RCT_METRO_PORT` wird beim Build gesetzt und ist im App-Binary eingebaut
- Wenn Metro später auf anderem Port startet → potenzielle Port-Mismatch-Probleme

---

## 4. Bereits umgesetzte Fixes

### expo-file-system Build-Fix
- **Datei:** `node_modules/expo-file-system/ios/FileSystemModule.swift`
- **Fix:** `ExpoAppDelegate.getSubscriberOfType` → `ExpoAppDelegateSubscriberRepository.getSubscriberOfType`
- **Automatisierung:** `scripts/postinstall-fix.js` (postinstall in package.json)

### Projekt-Pfad
- Projekt liegt unter `/Users/Jason1/mommy-count` (ohne Leerzeichen)

### npm
- `.npmrc`: `legacy-peer-deps=true`
- **expo-dev-client** wurde entfernt (Version ~0.28.0 existiert nicht für SDK 54)

### Video-Feature
- Expo-Go-Check in `utils/journeyVideo.ts` entfernt

---

## 5. Relevante Dateien

| Datei | Beschreibung |
|-------|--------------|
| `ios/MommyCountdown/AppDelegate.swift` | bundleURL(), sourceURL() – zentrale URL-Logik |
| `ios/MommyCountdown/Info.plist` | scheme: com.anonymous.mommycount, NSAllowsLocalNetworking |
| `node_modules/react-native/React/Base/RCTBundleURLProvider.mm` | packagerServerHostPort, guessPackagerHost, isPackagerRunning |
| `node_modules/react-native/scripts/react-native-xcode.sh` | Schreibt ip.txt, SKIP_BUNDLING – **dieses** Script wird verwendet (via require in project.pbxproj) |
| `ios/MommyCountdown.xcodeproj/project.pbxproj` | Build-Phase "Bundle React Native code and images" |
| `app.json` | scheme: mommycount |
| `package.json` | Dependencies, postinstall |

---

## 6. AppDelegate.swift (vollständig)

```swift
import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
```

---

## 7. Erfolgskriterium

Nach dem Fix soll gelten: **Metro läuft → App startet und zeigt die UI** – unabhängig davon, ob die App über Icon oder QR-Code geöffnet wird.

---

## 8. Mögliche Lösungsansätze für den Agent

**Empfohlener erster Ansatz:** Option 3 (AppDelegate-Fallback aus ip.txt) – keine neue Dependency, geringer Eingriff, löst den häufigsten Fall (Metro läuft, App über Icon gestartet).

1. **expo-dev-client installieren** (passende Version für SDK 54)
   - Bietet URL-Weitergabe, Dev-Menü, Reload
   - Prüfen: `npm info expo-dev-client versions` für SDK 54

2. **AppDelegate anpassen: Fallback-URL mit aktueller IP**
   - Wenn `RCTBundleURLProvider` nil liefert, eigene Logik: z.B. IP aus ip.txt + RCT_METRO_PORT
   - Oder: `REACT_NATIVE_PACKAGER_HOSTNAME` / `RCT_jsLocation` zur Build-Zeit setzen

3. **ip.txt + isPackagerRunning umgehen**
   - In `bundleURL()`: Wenn `RCTBundleURLProvider` nil liefert, trotzdem URL aus ip.txt + Port bauen (ohne isPackagerRunning-Check)
   - Risiko: App hängt, wenn Metro nicht läuft (aber gleicher Effekt wie jetzt)

4. **Release-Build mit eingebettetem Bundle**
   - Für Tests ohne Metro: `npx expo run:ios --device --configuration Release`
   - Erfordert ggf. Anpassung der Build-Phase (SKIP_BUNDLING nur für Debug)

5. **Dev-Menü / Reload**
   - Wenn die App einmal startet (z.B. über QR-Code), könnte "Reload JS" helfen – aber bei null URL bringt das nichts

6. **REACT_NATIVE_PACKAGER_HOSTNAME**
   - Beim Start von Metro: `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.173 npx expo start`
   - Das betrifft den Metro-Server, nicht die App – die App liest aus ip.txt / UserDefaults

---

## 9. Befehle zum Reproduzieren

```bash
cd /Users/Jason1/mommy-count
npm install
npx expo run:ios --device
# iPhone wählen, warten bis Build fertig
# App öffnet sich automatisch → ggf. "No script URL provided"
```

**Metro-URL (wenn Build läuft):**  
`com.anonymous.mommycount://expo-development-client/?url=http://192.168.0.173:8082`

---

## 10. Wichtige Hinweise

- **expo-dev-client** ist aktuell **nicht** installiert
- Nutzer spricht **Deutsch**
- Der Fehler tritt auch auf, wenn Metro läuft – z.B. wenn die App über das App-Icon statt über den QR-Code gestartet wird
- Nach 24h Inaktivität: Metro läuft vermutlich nicht mehr

---

## 11. Nächste Schritte (Priorität)

1. **AppDelegate prüfen:** Fallback, wenn `RCTBundleURLProvider` nil liefert (z.B. URL aus ip.txt + Port)
2. **expo-dev-client:** Prüfen, ob es eine kompatible Version für SDK 54 gibt und ob es das Problem löst
3. **Build-Script:** Sicherstellen, dass ip.txt korrekt ins App-Bundle geschrieben wird
4. **Dokumentation:** Nutzer anleiten, Metro vor App-Start zu starten und ggf. über QR-Code zu öffnen

---

## 12. Was ggf. noch zu klären ist (die restlichen ~1%)

- **Liegt ip.txt tatsächlich im finalen .app-Bundle?** (z.B. in `MommyCountdown.app/ip.txt` prüfen)
- **Expo SDK 54 + expo-dev-client:** Welche exakte Version ist kompatibel? (`npm info expo-dev-client` prüfen)
- **RCT_METRO_PORT zur Laufzeit:** Wird er aus dem Binary gelesen? (kRCTBundleURLProviderDefaultPort in RCTBundleURLProvider.mm)
