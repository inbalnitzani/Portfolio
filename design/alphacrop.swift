// Crops a transparent PNG to its visible pixels (+ small padding). Usage: swift alphacrop.swift in.png out.png
import AppKit
let a = CommandLine.arguments
let cg = NSImage(contentsOfFile: a[1])!.cgImage(forProposedRect: nil, context: nil, hints: nil)!
let w = cg.width, h = cg.height
let buf = UnsafeMutablePointer<UInt8>.allocate(capacity: w * h * 4)
let ctx = CGContext(data: buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
var x0 = w, y0 = h, x1 = 0, y1 = 0
for y in 0..<h { for x in 0..<w where buf[(y * w + x) * 4 + 3] > 40 { x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y) } }
let p = 6
let r = CGRect(x: max(0, x0 - p), y: max(0, y0 - p), width: min(w - 1, x1 + p) - max(0, x0 - p), height: min(h - 1, y1 + p) - max(0, y0 - p))
let out = ctx.makeImage()!.cropping(to: r)!
try! NSBitmapImageRep(cgImage: out).representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("\(a[2]) \(out.width)x\(out.height)")
