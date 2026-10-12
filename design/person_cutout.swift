// Cuts a person out of a photo with Apple Vision person segmentation → transparent PNG,
// cropped to the subject. Usage: swift person_cutout.swift in.jpg out.png [cropX0 cropX1 as 0–1]
import AppKit
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count >= 3, let ns = NSImage(contentsOfFile: args[1]),
      var cg = ns.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  fatalError("usage: person_cutout in out.png [x0 x1]")
}
// Optional horizontal crop (to exclude other people in the frame)
if args.count >= 5, let x0 = Double(args[3]), let x1 = Double(args[4]) {
  let r = CGRect(x: Double(cg.width) * x0, y: 0, width: Double(cg.width) * (x1 - x0), height: Double(cg.height))
  cg = cg.cropping(to: r)!
}

let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(cgImage: cg).perform([req])
guard let mask = req.results?.first?.pixelBuffer else { fatalError("no person found") }

let image = CIImage(cgImage: cg)
var maskImage = CIImage(cvPixelBuffer: mask)
maskImage = maskImage.transformed(by: CGAffineTransform(
  scaleX: image.extent.width / maskImage.extent.width,
  y: image.extent.height / maskImage.extent.height))

let blend = CIFilter(name: "CIBlendWithMask")!
blend.setValue(image, forKey: kCIInputImageKey)
blend.setValue(CIImage(color: .clear).cropped(to: image.extent), forKey: kCIInputBackgroundImageKey)
blend.setValue(maskImage, forKey: kCIInputMaskImageKey)
let ctx = CIContext()
let outCG = ctx.createCGImage(blend.outputImage!, from: image.extent)!

// Crop to the alpha bounding box
let w = outCG.width, h = outCG.height
let buf = UnsafeMutablePointer<UInt8>.allocate(capacity: w * h * 4)
let bctx = CGContext(data: buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                     space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
bctx.draw(outCG, in: CGRect(x: 0, y: 0, width: w, height: h))
var minX = w, minY = h, maxX = 0, maxY = 0
for y in 0..<h { for x in 0..<w where buf[(y * w + x) * 4 + 3] > 24 {
  minX = min(minX, x); maxX = max(maxX, x); minY = min(minY, y); maxY = max(maxY, y)
} }
let pad = 8
let box = CGRect(x: max(0, minX - pad), y: max(0, minY - pad),
                 width: min(w, maxX + pad) - max(0, minX - pad), height: min(h, maxY + pad) - max(0, minY - pad))
let cropped = bctx.makeImage()!.cropping(to: box)!
let rep = NSBitmapImageRep(cgImage: cropped)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))
print("ok \(args[2]) \(cropped.width)x\(cropped.height)")
