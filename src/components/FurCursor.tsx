import { useEffect, useRef } from 'react'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Fur cursor: follows the pointer and leans into its motion like fur in the wind,
 * sheds fluff when moving fast, puffs up over interactive things, squishes on click.
 * One rAF loop writing styles directly — no React renders per frame.
 * Off for touch devices and reduced motion (the system cursor stays).
 */
export function FurCursor() {
  const root = useRef<HTMLDivElement>(null)
  const noise = useRef<SVGFETurbulenceElement>(null)
  const map = useRef<SVGFEDisplacementMapElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || !noise.current || !map.current) return
    if (!matchMedia('(pointer: fine)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const n = noise.current
    const m = map.current
    const html = document.documentElement

    let x = innerWidth / 2,
      y = innerHeight / 2,
      px = x,
      py = y,
      vx = 0,
      vy = 0
    let lean = 0,
      stretch = 0,
      puff = 0,
      squish = 0
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
      hover = !!target?.closest?.('a, button, [role="button"], input, label, summary, [data-fur-hover]')
    }
    const onDown = () => (down = true)
    const onUp = () => (down = false)
    const onLeave = () => (el.style.opacity = '0')
    const onEnter = () => seen && (el.style.opacity = '1')

    const shed = (speed: number) => {
      const now = performance.now()
      if (speed < 14 || now - lastFluff < 28) return
      lastFluff = now
      const f = document.createElement('span')
      f.className = 'pointer-events-none fixed top-0 left-0 z-[9998] h-[2px] w-[7px] rounded-full bg-fur'
      const ox = 10 + Math.random() * 24
      const oy = 14 + Math.random() * 30
      const ang = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 0.9
      const dist = 26 + Math.random() * 40
      f.style.translate = `${x + ox}px ${y + oy}px`
      document.body.appendChild(f)
      f.animate(
        [
          { transform: `rotate(${ang}rad) scale(1)`, opacity: 0.95 },
          { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist + 14}px) rotate(${ang + 2.4}rad) scale(0.4)`, opacity: 0 },
        ],
        { duration: 650 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)' },
      ).onfinish = () => f.remove()
    }

    const frame = () => {
      t += 1
      vx = lerp(vx, x - px, 0.3)
      vy = lerp(vy, y - py, 0.3)
      px = x
      py = y
      const speed = Math.hypot(vx, vy)

      lean = lerp(lean, clamp(-vx * 1.1, -22, 22), 0.18)
      stretch = lerp(stretch, clamp(speed / 60, 0, 0.18), 0.15)
      puff = lerp(puff, hover ? 1 : 0, 0.15)
      squish = lerp(squish, down ? 1 : 0, 0.35)

      const sx = 1 + puff * 0.14 - squish * 0.14 + stretch * 0.4
      const sy = 1 + puff * 0.14 - squish * 0.2 - stretch * 0.25
      el.style.transform = `translate3d(${x - 3}px, ${y - 4}px, 0) skewX(${lean}deg) rotate(${lean * 0.25}deg) scale(${sx}, ${sy})`

      const gust = clamp(speed * 0.55, 0, 11)
      m.setAttribute('scale', (2.2 + gust + puff * 3 + Math.sin(t / 22) * 0.6).toFixed(2))
      const fx = 0.035 + Math.sin(t / (40 - gust * 2)) * 0.006
      const fy = 0.09 + Math.cos(t / (33 - gust * 1.5)) * 0.012
      n.setAttribute('baseFrequency', `${fx.toFixed(4)} ${fy.toFixed(4)}`)

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
        <filter id="fur-wind" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence ref={noise} type="fractalNoise" baseFrequency="0.035 0.09" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap ref={map} in="SourceGraphic" in2="n" scale={2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div
        ref={root}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-14 w-[46px] opacity-0 transition-opacity duration-200 will-change-transform"
        style={{ transformOrigin: '3px 4px' }}
      >
        <img
          src="/cursor-fur.png"
          alt=""
          className="block h-full w-full"
          style={{ filter: 'url(#fur-wind) drop-shadow(0 6px 6px rgb(58 42 32 / 0.25))' }}
        />
      </div>
    </>
  )
}
