// Removes the flat studio background from a generated 3D asset → transparent PNG.
// Flood-fills from the image border through pixels close to the sampled corner color,
// then feathers the edge. Usage: swift cutout.swift in.jpg out.png [threshold]
import AppKit
import CoreGraphics

let args = CommandLine.arguments
guard args.count >= 3, let src = NSImage(contentsOfFile: args[1]),
      let cg = src.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  fatalError("usage: cutout in.jpg out.png [threshold]")
}
let threshold = args.count > 3 ? Double(args[3])! : 26
let w = cg.width, h = cg.height
let px = UnsafeMutablePointer<UInt8>.allocate(capacity: w * h * 4)
px.initialize(repeating: 0, count: w * h * 4)
let ctx = CGContext(data: px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                    space: CGColorSpaceCreateDeviceRGB(),
                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))

func rgb(_ i: Int) -> (Double, Double, Double) {
  (Double(px[i * 4]), Double(px[i * 4 + 1]), Double(px[i * 4 + 2]))
}
// Background = average of the four corners
let corners = [0, w - 1, (h - 1) * w, h * w - 1].map(rgb)
let bg = (corners.map { $0.0 }.reduce(0, +) / 4, corners.map { $0.1 }.reduce(0, +) / 4, corners.map { $0.2 }.reduce(0, +) / 4)
func dist(_ i: Int) -> Double {
  let c = rgb(i)
  return sqrt(pow(c.0 - bg.0, 2) + pow(c.1 - bg.1, 2) + pow(c.2 - bg.2, 2))
}

var isBg = [Bool](repeating: false, count: w * h)
var stack: [Int] = []
for x in 0..<w { stack.append(x); stack.append((h - 1) * w + x) }
for y in 0..<h { stack.append(y * w); stack.append(y * w + w - 1) }
while let i = stack.popLast() {
  if isBg[i] || dist(i) > threshold { continue }
  isBg[i] = true
  let x = i % w, y = i / w
  if x > 0 { stack.append(i - 1) }
  if x < w - 1 { stack.append(i + 1) }
  if y > 0 { stack.append(i - w) }
  if y < h - 1 { stack.append(i + w) }
}

// Alpha: 0 for background; feather foreground pixels that touch background
for i in 0..<(w * h) {
  var a: Double = isBg[i] ? 0 : 1
  if !isBg[i] {
    let x = i % w, y = i / w
    var near = 0
    for dy in -2...2 { for dx in -2...2 {
      let nx = x + dx, ny = y + dy
      if nx >= 0, ny >= 0, nx < w, ny < h, isBg[ny * w + nx] { near += 1 }
    } }
    if near > 0 { a = min(1, max(0.15, dist(i) / (threshold * 2.2))) * (1 - Double(near) / 40) }
  }
  // un-premultiplied write: store straight color, scale by alpha for premultiplied buffer
  for k in 0..<3 { px[i * 4 + k] = UInt8(Double(px[i * 4 + k]) * a) }
  px[i * 4 + 3] = UInt8(a * 255)
}

let out = ctx.makeImage()!
let rep = NSBitmapImageRep(cgImage: out)
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))
print("ok \(args[2]) \(w)x\(h)")
