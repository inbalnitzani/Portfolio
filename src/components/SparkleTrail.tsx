import { useEffect, useRef } from 'react'

const COLORS = ['#ff3ea5', '#c6ff3d', '#c9b6ff', '#9fe3ff', '#ffffff']

/** Y2K sparkle cursor trail (mouse only, off for reduced motion). Plain DOM: no React renders per frame. */
export function SparkleTrail() {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last = 0
    let n = 0
    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      if (now - last < 40 || !layer.current) return
      last = now
      const s = document.createElement('span')
      const size = 8 + Math.random() * 10
      s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;pointer-events:none;background:${
        COLORS[n++ % COLORS.length]
      };clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);translate:-50% -50%;`
      layer.current.appendChild(s)
      s.animate(
        [
          { transform: 'scale(1) rotate(0deg)', opacity: 1 },
          { transform: `translate(${(Math.random() - 0.5) * 30}px, ${18 + Math.random() * 20}px) scale(0) rotate(180deg)`, opacity: 0 },
        ],
        { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)' },
      ).onfinish = () => s.remove()
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[80]" />
}
