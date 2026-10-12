import { useEffect, useRef } from 'react'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Big on purpose. The arrow tip (the hotspot) sits ~7% in from the image's top-left.
const W = 130
const H = Math.round((W * 520) / 425)
const TIP_X = Math.round(W * 0.067)
const TIP_Y = Math.round(H * 0.07)

/**
 * Fur cursor. The arrow itself is rigid and follows the pointer exactly; only the fur moves.
 * An SVG filter splits the image into a solid core (alpha eroded) and an outer band of hair.
 * The band is displaced by drifting noise, biased against the direction of travel, so the hair
 * tips trail behind like fur in the wind while the silhouette keeps its shape. A finer noise
 * makes the strands inside shimmer. Fluff sheds when you move fast.
 * One rAF loop writing attributes directly — no React renders per frame.
 * Off for touch devices and reduced motion (the system cursor stays).
 */
export function FurCursor() {
  const root = useRef<HTMLDivElement>(null)
  const wind = useRef<SVGFETurbulenceElement>(null)
  const windMap = useRef<SVGFEDisplacementMapElement>(null)
  const biasR = useRef<SVGFEFuncRElement>(null)
  const biasG = useRef<SVGFEFuncGElement>(null)
  const shimmer = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    const el = root.current
    const n = wind.current
    const m = windMap.current
    const br = biasR.current
    const bg = biasG.current
    const sh = shimmer.current
    if (!el || !n || !m || !br || !bg || !sh) return
    if (!matchMedia('(pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const html = document.documentElement

    let x = innerWidth / 2,
      y = innerHeight / 2,
      px = x,
      py = y,
      vx = 0,
      vy = 0
    let gust = 0,
      press = 0,
      puff = 0
    let hover = false,
      down = false,
      seen = false
    let t = 0,
      raf = 0,
      lastFluff = 0

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!seen) {
        seen = true
        px = x
        py = y
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
      if (speed < 16 || now - lastFluff < 34) return
      lastFluff = now
      const f = document.createElement('span')
      const len = 10 + Math.random() * 12
      f.className = 'pointer-events-none fixed top-0 left-0 z-[9998] rounded-full'
      f.style.cssText += `width:${len}px;height:2px;background:${Math.random() > 0.5 ? '#f6a9cb' : '#f2b9d2'};`
      // spawn somewhere on the fur, blown opposite to the motion
      const ox = TIP_X + Math.random() * W * 0.55
      const oy = TIP_Y + Math.random() * H * 0.75
      const ang = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 0.8
      const dist = 40 + Math.random() * 60
      f.style.translate = `${x - TIP_X + ox}px ${y - TIP_Y + oy}px`
      document.body.appendChild(f)
      f.animate(
        [
          { transform: `rotate(${ang}rad)`, opacity: 0.9 },
          { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist + 26}px) rotate(${ang + 1.8}rad) scale(0.5)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' },
      ).onfinish = () => f.remove()
    }

    const frame = () => {
      t += 1
      // smoothed velocity gives the fur a sense of mass
      vx = lerp(vx, x - px, 0.25)
      vy = lerp(vy, y - py, 0.25)
      px = x
      py = y
      const speed = Math.hypot(vx, vy)

      gust = lerp(gust, clamp(speed / 22, 0, 1), 0.12)
      puff = lerp(puff, hover ? 1 : 0, 0.12)
      press = lerp(press, down ? 1 : 0, 0.3)

      // rigid: position + a uniform press (never skewed or stretched)
      el.style.transform = `translate3d(${x - TIP_X}px, ${y - TIP_Y}px, 0) scale(${1 + puff * 0.06 - press * 0.08})`

      // Hair tips: a soft breeze at rest, long sweeps in a gust, a little fluffier over buttons
      m.setAttribute('scale', (5 + gust * 20 + puff * 4 + Math.sin(t / 37) * 1.2).toFixed(2))
      // Push the tips opposite to the motion (displacement samples from +bias, so hair moves -bias)
      const bx = clamp(vx / 30, -0.32, 0.32)
      const by = clamp(vy / 30, -0.32, 0.32) - 0.04 // a hint of gravity
      br.setAttribute('intercept', (0.25 + bx).toFixed(3))
      bg.setAttribute('intercept', (0.25 + by).toFixed(3))
      // drift the noise so the strands keep moving (faster in a gust)
      const k = 1 + gust * 2.5
      n.setAttribute('baseFrequency', `${(0.045 + Math.sin((t * k) / 70) * 0.008).toFixed(4)} ${(0.11 + Math.cos((t * k) / 55) * 0.015).toFixed(4)}`)
      sh.setAttribute('baseFrequency', `${(0.32 + Math.sin(t / 45) * 0.03).toFixed(3)}`)

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
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="fur-wind" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          {/* outer hair: drifting noise, biased against the motion, displaces the edge band */}
          <feTurbulence ref={wind} type="fractalNoise" baseFrequency="0.045 0.11" numOctaves={3} seed={11} result="noise" />
          <feComponentTransfer in="noise" result="windField">
            <feFuncR ref={biasR} type="linear" slope="0.5" intercept="0.25" />
            <feFuncG ref={biasG} type="linear" slope="0.5" intercept="0.25" />
          </feComponentTransfer>
          <feDisplacementMap ref={windMap} in="SourceGraphic" in2="windField" scale={5} xChannelSelector="R" yChannelSelector="G" result="blown" />
          {/* inner strands: fine, small shimmer that can't change the outline */}
          <feTurbulence ref={shimmer} type="fractalNoise" baseFrequency="0.32" numOctaves={1} seed={3} result="fine" />
          <feDisplacementMap in="SourceGraphic" in2="fine" scale={2.2} xChannelSelector="R" yChannelSelector="G" result="shimmered" />
          {/* solid core = the silhouette shrunk a few px; it never moves */}
          <feMorphology in="SourceAlpha" operator="erode" radius={7} result="core" />
          <feGaussianBlur in="core" stdDeviation={2.5} result="softCore" />
          <feComposite in="shimmered" in2="softCore" operator="in" result="body" />
          <feMerge>
            <feMergeNode in="blown" />
            <feMergeNode in="body" />
          </feMerge>
        </filter>
      </svg>
      <div
        ref={root}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0 transition-opacity duration-200 will-change-transform"
        style={{ width: W, height: H, transformOrigin: `${TIP_X}px ${TIP_Y}px` }}
      >
        <img
          src="/cursor-fur.png"
          alt=""
          className="block h-full w-full max-w-none"
          style={{ filter: 'url(#fur-wind) drop-shadow(0 10px 12px rgb(58 42 32 / 0.28))' }}
        />
      </div>
    </>
  )
}
