// Clears enclosed background (e.g. the holes in A, R, O) by flood-filling from seed points.
// Grows through light, low-saturation pixels only, then feathers the rim.
// Usage: swift seedclear.swift in.png out.png fx,fy [fx,fy ...]   (seeds as 0–1 fractions)
import AppKit

let a = CommandLine.arguments
let LUM = Double(ProcessInfo.processInfo.environment["LUM"] ?? "236")!
let SAT = Double(ProcessInfo.processInfo.environment["SAT"] ?? "16")!
let cg = NSImage(contentsOfFile: a[1])!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
let w = cg.width, h = cg.height
let px = UnsafeMutablePointer<UInt8>.allocate(capacity: w * h * 4)
px.initialize(repeating: 0, count: w * h * 4)
let ctx = CGContext(data: px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))

// straight (un-premultiplied) colour of pixel i
func col(_ i: Int) -> (Double, Double, Double, Double) {
  let al = Double(px[i * 4 + 3])
  if al == 0 { return (255, 255, 255, 0) }
  let k = 255 / al
  return (Double(px[i * 4]) * k, Double(px[i * 4 + 1]) * k, Double(px[i * 4 + 2]) * k, al)
}
func light(_ i: Int) -> Bool {
  let c = col(i)
  let lum = (c.0 + c.1 + c.2) / 3
  let sat = max(c.0, c.1, c.2) - min(c.0, c.1, c.2)
  return c.3 == 0 || (lum > LUM && sat < SAT)
}

var clear = [Bool](repeating: false, count: w * h)
for s in a.dropFirst(3) {
  let f = s.split(separator: ",").map { Double($0)! }
  // bitmap memory row 0 is the top of the image, matching top-left fractions
  let sx = Int(f[0] * Double(w)), sy = Int(f[1] * Double(h))
  var stack = [sy * w + sx]
  while let i = stack.popLast() {
    if clear[i] || !light(i) { continue }
    clear[i] = true
    let x = i % w, y = i / w
    if x > 0 { stack.append(i - 1) }
    if x < w - 1 { stack.append(i + 1) }
    if y > 0 { stack.append(i - w) }
    if y < h - 1 { stack.append(i + w) }
  }
}
var n = 0
for i in 0..<(w * h) where clear[i] { for k in 0..<4 { px[i * 4 + k] = 0 }; n += 1 }
// feather: rim pixels next to a cleared pixel get half alpha
for i in 0..<(w * h) where !clear[i] {
  let x = i % w, y = i / w
  let near = (x > 0 && clear[i - 1]) || (x < w - 1 && clear[i + 1]) || (y > 0 && clear[i - w]) || (y < h - 1 && clear[i + w])
  if near { for k in 0..<4 { px[i * 4 + k] = UInt8(Double(px[i * 4 + k]) * 0.55) } }
}
let out = ctx.makeImage()!
try! NSBitmapImageRep(cgImage: out).representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("cleared \(n) px")
