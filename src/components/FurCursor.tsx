import { useEffect, useRef } from 'react'
import { asset } from '../lib/asset'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Big on purpose. The arrow tip (the hotspot) sits ~7% in from the image's top-left.
const W = 130
const H = Math.round((W * 520) / 425)
const PAD = 22 // room for hair to stick out past the silhouette
const TIP_X = Math.round(W * 0.067) + PAD
const TIP_Y = Math.round(H * 0.07) + PAD
const STRANDS = 1400
const FLOW = 1.05 // the fur lies down-right, away from the tip (radians)

type Strand = {
  x: number
  y: number
  len: number
  angle: number
  width: number
  r: number
  g: number
  b: number
  phase: number
  edge: boolean
}

/**
 * Fur cursor, drawn as real hair. The arrow body (the fur photo) is rigid and follows the
 * pointer exactly; on top, ~1,400 fine strands grow out of it. Slow wind ripples travel across
 * them, each strand catches a sheen as it tilts, and when you move the strands drag behind and
 * settle. Only the hair moves — the shape never bends.
 * Canvas 2D, one rAF loop, no React renders per frame. Off for touch and reduced motion.
 */
export function FurCursor() {
  const root = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = root.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    if (!matchMedia('(pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, devicePixelRatio || 1)
    const CW = W + PAD * 2
    const CH = H + PAD * 2
    canvas.width = CW * dpr
    canvas.height = CH * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'

    const html = document.documentElement
    const img = new Image()
    img.src = asset('/cursor-fur.png')
    let strands: Strand[] = []

    // Grow strands from the image: roots where the fur is, colours sampled from it
    img.onload = () => {
      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const o = off.getContext('2d', { willReadFrequently: true })!
      o.drawImage(img, 0, 0, W, H)
      const px = o.getImageData(0, 0, W, H).data
      const alpha = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : px[(Math.floor(y) * W + Math.floor(x)) * 4 + 3])
      let tries = 0
      while (strands.length < STRANDS && tries++ < STRANDS * 20) {
        const x = Math.random() * W
        const y = Math.random() * H
        if (alpha(x, y) < 160) continue
        const i = (Math.floor(y) * W + Math.floor(x)) * 4
        // near the outline? look a few px out along the flow and sideways
        const edge = alpha(x + 7, y + 7) < 60 || alpha(x - 7, y) < 60 || alpha(x + 7, y - 4) < 60 || alpha(x, y + 8) < 60
        strands.push({
          x: x + PAD,
          y: y + PAD,
          len: edge ? 10 + Math.random() * 14 : 5 + Math.random() * 9,
          angle: FLOW + (Math.random() - 0.5) * (edge ? 1.2 : 0.7),
          width: 0.45 + Math.random() * 0.75,
          r: px[i],
          g: px[i + 1],
          b: px[i + 2],
          phase: Math.random() * Math.PI * 2,
          edge,
        })
      }
      // draw edge hair last so it sits on top and reads as the fluffy outline
      strands = strands.sort((a, b) => Number(a.edge) - Number(b.edge))
    }

    let x = innerWidth / 2,
      y = innerHeight / 2,
      lx = x,
      ly = y,
      vx = 0,
      vy = 0,
      dragX = 0,
      dragY = 0
    let gust = 0,
      press = 0,
      puff = 0
    let hover = false,
      down = false,
      seen = false
    let raf = 0,
      lastFluff = 0
    const t0 = performance.now()

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!seen) {
        seen = true
        lx = x
        ly = y
        html.classList.add('fur-on')
        el.style.opacity = '1'
      }
      const target = e.target as Element | null
      hover = !!target?.closest?.('a, button, [role="button"], input, select, textarea, label, summary, [data-fur-hover]')
    }
    const onDown = () => (down = true)
    const onUp = () => (down = false)
    const onLeave = () => (el.style.opacity = '0')
    const onEnter = () => seen && (el.style.opacity = '1')

    const shed = (speed: number) => {
      const now = performance.now()
      if (speed < 18 || now - lastFluff < 40 || !strands.length) return
      lastFluff = now
      const s = strands[Math.floor(Math.random() * strands.length)]
      const f = document.createElement('span')
      f.className = 'pointer-events-none fixed top-0 left-0 z-[9998] rounded-full'
      f.style.cssText += `width:${12 + Math.random() * 12}px;height:1.5px;background:rgb(${s.r},${s.g},${s.b});`
      const ang = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 0.7
      const dist = 50 + Math.random() * 70
      f.style.translate = `${x - TIP_X + s.x}px ${y - TIP_Y + s.y}px`
      document.body.appendChild(f)
      f.animate(
        [
          { transform: `rotate(${ang}rad)`, opacity: 0.9 },
          { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist + 30}px) rotate(${ang + 1.6}rad) scale(0.6)`, opacity: 0 },
        ],
        { duration: 1000 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' },
      ).onfinish = () => f.remove()
    }

    const frame = (now: number) => {
      const t = (now - t0) / 1000
      vx = lerp(vx, x - lx, 0.25)
      vy = lerp(vy, y - ly, 0.25)
      lx = x
      ly = y
      const speed = Math.hypot(vx, vy)
      gust = lerp(gust, clamp(speed / 25, 0, 1), 0.1)
      puff = lerp(puff, hover ? 1 : 0, 0.12)
      press = lerp(press, down ? 1 : 0, 0.3)
      // hair drags behind the motion with a springy lag, then settles
      dragX = lerp(dragX, clamp(-vx * 0.9, -14, 14), 0.12)
      dragY = lerp(dragY, clamp(-vy * 0.9, -14, 14), 0.12)

      // rigid: position + a uniform press/puff (never skewed or stretched)
      el.style.transform = `translate3d(${x - TIP_X}px, ${y - TIP_Y}px, 0) scale(${1 + puff * 0.05 - press * 0.07})`

      ctx.clearRect(0, 0, CW, CH)
      if (img.complete) ctx.drawImage(img, PAD, PAD, W, H)

      // wind: a slow wave rolling diagonally across the fur, stronger in a gust
      const amp = 0.22 + gust * 0.35 + puff * 0.12
      const lift = 1 + puff * 0.25
      for (const s of strands) {
        const wave = Math.sin(s.x * 0.06 + s.y * 0.045 - t * 2.1 + s.phase * 0.35) + 0.45 * Math.sin(s.y * 0.11 - t * 3.3 + s.phase)
        const a = s.angle + wave * amp
        const L = s.len * lift
        const k = L / 20
        const tx = s.x + Math.cos(a) * L + dragX * k
        const ty = s.y + Math.sin(a) * L + dragY * k + 0.6 * k // a touch of gravity
        const cx = s.x + Math.cos(s.angle + wave * amp * 0.4) * L * 0.55 + dragX * k * 0.3
        const cy = s.y + Math.sin(s.angle + wave * amp * 0.4) * L * 0.55 + dragY * k * 0.3
        // sheen: strands tilted toward the light pick up a white highlight
        const sheen = clamp(Math.cos(a + 0.9) * 0.5 + 0.5, 0, 1) ** 3
        const r = Math.round(s.r + (255 - s.r) * sheen * 0.9)
        const g = Math.round(s.g + (255 - s.g) * sheen * 0.9)
        const b = Math.round(s.b + (255 - s.b) * sheen * 0.9)
        ctx.strokeStyle = `rgba(${r},${g},${b},${s.edge ? 0.85 : 0.62})`
        ctx.lineWidth = s.width
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.quadraticCurveTo(cx, cy, tx, ty)
        ctx.stroke()
      }

      shed(speed)
      raf = requestAnimationFrame(frame)
    }

    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerdown', onDown)
    addEventListener('pointerup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onDown)
      removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      html.classList.remove('fur-on')
    }
  }, [])

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0 transition-opacity duration-200 will-change-transform"
      style={{ width: W + PAD * 2, height: H + PAD * 2, transformOrigin: `${TIP_X}px ${TIP_Y}px` }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" style={{ filter: 'drop-shadow(0 10px 12px rgb(58 42 32 / 0.25))' }} />
    </div>
  )
}
