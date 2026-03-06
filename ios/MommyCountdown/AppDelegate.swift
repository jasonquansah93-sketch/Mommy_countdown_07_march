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

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
       let metroURLString = components.queryItems?.first(where: { $0.name == "url" })?.value {
      UserDefaults.standard.set(metroURLString, forKey: "expo_metro_url")
    }
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
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
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    if let url = RCTBundleURLProvider.sharedSettings().jsBundleURL(
        forBundleRoot: ".expo/.virtual-metro-entry") {
      return url
    }
    if let savedURLString = UserDefaults.standard.string(forKey: "expo_metro_url"),
       let savedBaseURL = URL(string: savedURLString) {
      var components = URLComponents()
      components.scheme = "http"
      components.host = savedBaseURL.host
      components.port = savedBaseURL.port
      components.path = "/.expo/.virtual-metro-entry.bundle"
      components.queryItems = [
        URLQueryItem(name: "platform", value: "ios"),
        URLQueryItem(name: "dev", value: "true"),
        URLQueryItem(name: "hot", value: "false"),
        URLQueryItem(name: "lazy", value: "true")
      ]
      return components.url
    }
    if let ipPath = Bundle.main.path(forResource: "ip", ofType: "txt"),
       let raw = try? String(contentsOfFile: ipPath, encoding: .utf8) {
      let ip = raw.trimmingCharacters(in: .whitespacesAndNewlines)
      if !ip.isEmpty {
        return URL(string: "http://\(ip):8082/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&hot=false&lazy=true")
      }
    }
    return nil
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
