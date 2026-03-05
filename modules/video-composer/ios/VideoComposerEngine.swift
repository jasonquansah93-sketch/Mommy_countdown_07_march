/**
 * VideoComposerEngine – AVFoundation-based video creation from images.
 * Mommy Countdown – Journey Video Feature v2
 * No FFmpeg, no external dependencies.
 */
import AVFoundation
import UIKit
import Photos

enum VideoComposerError: Error {
  case invalidImage
  case invalidOutputPath
  case exportFailed
  case noImages
}

public struct VideoComposerOptions {
  var imageUris: [String]
  var aspectRatio: String
  var durations: [Double]
  var filter: String
  var transition: String
  var withWatermark: Bool
  var watermarkText: String
  var texts: [String]
  var cropModes: [String]
  var trimStartSeconds: Double
  var trimEndSeconds: Double?
}

public class VideoComposerEngine {
  
  static func createVideo(options: VideoComposerOptions) async throws -> String {
    guard !options.imageUris.isEmpty else {
      throw VideoComposerError.noImages
    }
    
    let (width, height) = dimensionsForAspectRatio(options.aspectRatio)
    
    let tempDir = FileManager.default.temporaryDirectory
    let tempOutputURL = tempDir.appendingPathComponent("journey_temp_\(UUID().uuidString).mp4")
    let finalOutputURL = tempDir.appendingPathComponent("journey_\(UUID().uuidString).mp4")
    
    try? FileManager.default.removeItem(at: tempOutputURL)
    try? FileManager.default.removeItem(at: finalOutputURL)
    
    let assetWriter = try AVAssetWriter(outputURL: tempOutputURL, fileType: .mp4)
    
    let videoSettings: [String: Any] = [
      AVVideoCodecKey: AVVideoCodecType.h264,
      AVVideoWidthKey: width,
      AVVideoHeightKey: height,
      AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 6_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
      ]
    ]
    
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
    input.expectsMediaDataInRealTime = false
    
    let pixelBufferAttributes: [String: Any] = [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB
    ]
    
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
      assetWriterInput: input,
      sourcePixelBufferAttributes: pixelBufferAttributes
    )
    
    assetWriter.add(input)
    assetWriter.startWriting()
    assetWriter.startSession(atSourceTime: .zero)
    
    var currentTime = CMTime.zero
    let frameDuration = CMTime(value: 1, timescale: 30)
    
    for (index, uriString) in options.imageUris.enumerated() {
      guard input.isReadyForMoreMediaData else { break }
      
      let duration = index < options.durations.count ? options.durations[index] : 4.0
      let durationCM = CMTime(seconds: duration, preferredTimescale: 600)
      
      guard let image = loadImage(from: uriString) else { continue }
      
      let filteredImage = applyFilter(image, filter: options.filter)
      let cropMode = index < options.cropModes.count ? options.cropModes[index] : "letterbox"
      let scaledImage = scaleImage(filteredImage, toWidth: width, height: height, cropMode: cropMode)
      
      var finalImage = scaledImage
      let text = index < options.texts.count ? options.texts[index] : ""
      if !text.isEmpty {
        finalImage = addTextOverlay(to: scaledImage, text: text)
      }
      if options.withWatermark {
        finalImage = addWatermark(to: finalImage, text: options.watermarkText)
      }
      
      guard let pixelBuffer = createPixelBuffer(from: finalImage, width: width, height: height) else {
        continue
      }
      
      let frameCount = Int(duration * 30)
      for frame in 0..<frameCount {
        let presentationTime = CMTimeAdd(
          currentTime,
          CMTimeMultiply(frameDuration, multiplier: Int32(frame))
        )
        adaptor.append(pixelBuffer, withPresentationTime: presentationTime)
      }
      
      currentTime = CMTimeAdd(currentTime, durationCM)
    }
    
    input.markAsFinished()
    await assetWriter.finishWriting()
    
    guard assetWriter.status == .completed else {
      throw VideoComposerError.exportFailed
    }
    
    let outputURL: URL
    if options.trimStartSeconds > 0 || (options.trimEndSeconds ?? 0) > 0 {
      outputURL = try await trimVideo(
        inputURL: tempOutputURL,
        outputURL: finalOutputURL,
        startSeconds: options.trimStartSeconds,
        endSeconds: options.trimEndSeconds
      )
      try? FileManager.default.removeItem(at: tempOutputURL)
    } else {
      outputURL = tempOutputURL
    }
    
    try await PHPhotoLibrary.shared().performChanges {
      PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: outputURL)
    }
    
    return outputURL.path
  }
  
  private static func trimVideo(
    inputURL: URL,
    outputURL: URL,
    startSeconds: Double,
    endSeconds: Double?
  ) async throws -> URL {
    let asset = AVAsset(url: inputURL)
    let duration = try await asset.load(.duration)
    let totalSeconds = CMTimeGetSeconds(duration)
    
    let start = min(startSeconds, totalSeconds - 0.5)
    let end: Double
    if let es = endSeconds, es > 0 {
      end = min(es, totalSeconds)
    } else {
      end = totalSeconds
    }
    
    guard end > start else {
      return inputURL
    }
    
    let startTime = CMTime(seconds: start, preferredTimescale: 600)
    let endTime = CMTime(seconds: end, preferredTimescale: 600)
    let timeRange = CMTimeRange(start: startTime, end: endTime)
    
    guard let exportSession = AVAssetExportSession(
      asset: asset,
      presetName: AVAssetExportPresetHighestQuality
    ) else {
      throw VideoComposerError.exportFailed
    }
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4
    exportSession.timeRange = timeRange
    
    await exportSession.export()
    
    guard exportSession.status == .completed else {
      throw VideoComposerError.exportFailed
    }
    
    return outputURL
  }
  
  private static func dimensionsForAspectRatio(_ ratio: String) -> (Int, Int) {
    switch ratio {
    case "16:9": return (1920, 1080)
    default: return (1080, 1920)
    }
  }
  
  private static func loadImage(from uriString: String) -> UIImage? {
    var path = uriString
    if path.hasPrefix("file://") {
      path = String(path.dropFirst(7))
    }
    let url = URL(fileURLWithPath: path)
    guard let data = try? Data(contentsOf: url),
          let image = UIImage(data: data) else {
      return nil
    }
    return image
  }
  
  private static func applyFilter(_ image: UIImage, filter: String) -> UIImage {
    guard let ciImage = CIImage(image: image) else { return image }
    let context = CIContext()
    
    switch filter {
    case "sepia":
      if let sepia = CIFilter(name: "CISepiaTone") {
        sepia.setValue(ciImage, forKey: kCIInputImageKey)
        sepia.setValue(0.8, forKey: kCIInputIntensityKey)
        if let output = sepia.outputImage,
           let cgImage = context.createCGImage(output, from: output.extent) {
          return UIImage(cgImage: cgImage)
        }
      }
    case "bw":
      if let bw = CIFilter(name: "CIPhotoEffectMono") {
        bw.setValue(ciImage, forKey: kCIInputImageKey)
        if let output = bw.outputImage,
           let cgImage = context.createCGImage(output, from: output.extent) {
          return UIImage(cgImage: cgImage)
        }
      }
    case "vintage":
      if let vintage = CIFilter(name: "CIPhotoEffectInstant") {
        vintage.setValue(ciImage, forKey: kCIInputImageKey)
        if let output = vintage.outputImage,
           let cgImage = context.createCGImage(output, from: output.extent) {
          return UIImage(cgImage: cgImage)
        }
      }
    default: break
    }
    return image
  }
  
  private static func scaleImage(
    _ image: UIImage,
    toWidth width: Int,
    height: Int,
    cropMode: String
  ) -> UIImage {
    let targetSize = CGSize(width: width, height: height)
    let imageSize = image.size
    
    if cropMode == "crop" {
      let scale = max(
        targetSize.width / imageSize.width,
        targetSize.height / imageSize.height
      )
      let scaledSize = CGSize(
        width: imageSize.width * scale,
        height: imageSize.height * scale
      )
      let origin = CGPoint(
        x: (targetSize.width - scaledSize.width) / 2,
        y: (targetSize.height - scaledSize.height) / 2
      )
      let renderer = UIGraphicsImageRenderer(size: targetSize)
      return renderer.image { _ in
        image.draw(in: CGRect(origin: origin, size: scaledSize))
      }
    } else {
      let scale = min(
        targetSize.width / imageSize.width,
        targetSize.height / imageSize.height
      )
      let scaledSize = CGSize(
        width: imageSize.width * scale,
        height: imageSize.height * scale
      )
      let origin = CGPoint(
        x: (targetSize.width - scaledSize.width) / 2,
        y: (targetSize.height - scaledSize.height) / 2
      )
      let renderer = UIGraphicsImageRenderer(size: targetSize)
      return renderer.image { ctx in
        UIColor(white: 0.95, alpha: 1).setFill()
        ctx.fill(CGRect(origin: .zero, size: targetSize))
        image.draw(in: CGRect(origin: origin, size: scaledSize))
      }
    }
  }
  
  private static func addTextOverlay(to image: UIImage, text: String) -> UIImage {
    let size = image.size
    let renderer = UIGraphicsImageRenderer(size: size)
    
    return renderer.image { _ in
      image.draw(at: .zero)
      
      let paragraphStyle = NSMutableParagraphStyle()
      paragraphStyle.alignment = .center
      
      let attributes: [NSAttributedString.Key: Any] = [
        .font: UIFont.systemFont(ofSize: 36, weight: .semibold),
        .foregroundColor: UIColor.white,
        .paragraphStyle: paragraphStyle,
        .strokeColor: UIColor.black.withAlphaComponent(0.5),
        .strokeWidth: -2
      ]
      
      let textRect = CGRect(
        x: 20,
        y: size.height / 2 - 30,
        width: size.width - 40,
        height: 60
      )
      text.draw(in: textRect, withAttributes: attributes)
    }
  }
  
  private static func addWatermark(to image: UIImage, text: String) -> UIImage {
    let size = image.size
    let renderer = UIGraphicsImageRenderer(size: size)
    
    return renderer.image { _ in
      image.draw(at: .zero)
      
      let paragraphStyle = NSMutableParagraphStyle()
      paragraphStyle.alignment = .center
      
      let attributes: [NSAttributedString.Key: Any] = [
        .font: UIFont.systemFont(ofSize: 24, weight: .medium),
        .foregroundColor: UIColor.white.withAlphaComponent(0.7),
        .paragraphStyle: paragraphStyle
      ]
      
      let textRect = CGRect(
        x: 0,
        y: size.height - 60,
        width: size.width,
        height: 50
      )
      text.draw(in: textRect, withAttributes: attributes)
    }
  }
  
  private static func createPixelBuffer(from image: UIImage, width: Int, height: Int) -> CVPixelBuffer? {
    var pixelBuffer: CVPixelBuffer?
    let attrs: [String: Any] = [
      kCVPixelBufferCGImageCompatibilityKey as String: true,
      kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
    ]
    
    let status = CVPixelBufferCreate(
      kCFAllocatorDefault,
      width,
      height,
      kCVPixelFormatType_32ARGB,
      attrs as CFDictionary,
      &pixelBuffer
    )
    
    guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
      return nil
    }
    
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    
    let context = CGContext(
      data: CVPixelBufferGetBaseAddress(buffer),
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    )
    
    guard let cgImage = image.cgImage else { return nil }
    context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    
    return buffer
  }
}
