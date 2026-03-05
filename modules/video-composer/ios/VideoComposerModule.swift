import ExpoModulesCore

public class VideoComposerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VideoComposer")

    AsyncFunction("createVideo") { (options: [String: Any]) -> [String: Any] in
      guard let imageUris = options["imageUris"] as? [String], !imageUris.isEmpty else {
        return ["success": false, "error": "Mindestens ein Foto nötig."]
      }
      
      let aspectRatio = options["aspectRatio"] as? String ?? "9:16"
      let durationsArray = options["durations"] as? [Double]
      let durations = durationsArray ?? Array(repeating: 4.0, count: imageUris.count)
      let filter = options["filter"] as? String ?? "none"
      let transition = options["transition"] as? String ?? "fade"
      let withWatermark = options["withWatermark"] as? Bool ?? true
      let watermarkText = options["watermarkText"] as? String ?? "Mommy Countdown"
      let texts = options["texts"] as? [String] ?? []
      let cropModes = options["cropModes"] as? [String] ?? []
      let trimStartSeconds = options["trimStartSeconds"] as? Double ?? 0
      let trimEndSeconds = options["trimEndSeconds"] as? Double
      
      let opts = VideoComposerOptions(
        imageUris: imageUris,
        aspectRatio: aspectRatio,
        durations: durations,
        filter: filter,
        transition: transition,
        withWatermark: withWatermark,
        watermarkText: watermarkText,
        texts: texts,
        cropModes: cropModes,
        trimStartSeconds: trimStartSeconds,
        trimEndSeconds: trimEndSeconds
      )
      
      do {
        let path = try await VideoComposerEngine.createVideo(options: opts)
        return ["success": true, "path": path]
      } catch VideoComposerError.noImages {
        return ["success": false, "error": "Mindestens ein Foto nötig."]
      } catch VideoComposerError.exportFailed {
        return ["success": false, "error": "Video-Export fehlgeschlagen."]
      } catch {
        return ["success": false, "error": error.localizedDescription]
      }
    }
  }
}
