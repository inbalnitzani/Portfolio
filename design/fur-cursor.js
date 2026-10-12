// Fur cursor: follows the pointer, leans into its motion like fur in the wind,
// sheds fluff when moving fast, puffs up over interactive things, squishes on click.
// Plain DOM + one rAF loop (no re-renders). Disabled for touch and reduced motion.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t

export function mountFurCursor({ root = document.getElementById('fur') } = {}) {
  if (!root) return () => {}
  if (!matchMedia('(pointer: fine)').matches) return () => {}
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const noise = document.getElementById('windNoise')
  const map = document.getElementById('windMap')
  document.body.classList.add('fur-on')

  let x = innerWidth / 2, y = innerHeight / 2 // pointer
  let px = x, py = y // last frame
  let vx = 0, vy = 0 // smoothed velocity (px/frame)
  let lean = 0, stretch = 0, puff = 0, squish = 0
  let hover = false, down = false
  let t = 0, raf = 0, lastFluff = 0

  const onMove = (e) => {
    x = e.clientX
    y = e.clientY
    hover = !!e.target.closest?.('a, button, [role="button"], input, label, summary')
  }
  const onDown = () => (down = true)
  const onUp = () => (down = false)
  const onLeave = () => document.body.classList.remove('fur-on')
  const onEnter = () => document.body.classList.add('fur-on')

  function shed(speed) {
    const now = performance.now()
    if (speed < 14 || now - lastFluff < 28) return
    lastFluff = now
    const f = document.createElement('span')
    f.className = 'fluff'
    // spawn along the fur body, blown opposite to the motion
    const ox = 10 + Math.random() * 24, oy = 14 + Math.random() * 30
    const ang = Math.atan2(-vy, -vx) + (Math.random() - 0.5) * 0.9
    const dist = 26 + Math.random() * 40
    f.style.translate = `${x + ox}px ${y + oy}px`
    document.body.appendChild(f)
    f.animate(
      [
        { transform: `rotate(${ang}rad) scale(1)`, opacity: 0.95 },
        {
          transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist + 14}px) rotate(${ang + 2.4}rad) scale(0.4)`,
          opacity: 0,
        },
      ],
      { duration: 650 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).onfinish = () => f.remove()
  }

  function frame() {
    t += 1
    // velocity, smoothed so the fur reacts like it has mass
    vx = lerp(vx, x - px, 0.3)
    vy = lerp(vy, y - py, 0.3)
    px = x
    py = y
    const speed = Math.hypot(vx, vy)

    // lean: fur trails behind the motion (skew against horizontal velocity)
    lean = lerp(lean, clamp(-vx * 1.1, -22, 22), 0.18)
    stretch = lerp(stretch, clamp(speed / 60, 0, 0.18), 0.15)
    puff = lerp(puff, hover ? 1 : 0, 0.15)
    squish = lerp(squish, down ? 1 : 0, 0.35)

    const sx = 1 + puff * 0.14 - squish * 0.14 + stretch * 0.4
    const sy = 1 + puff * 0.14 - squish * 0.2 - stretch * 0.25
    root.style.transform = `translate3d(${x - 3}px, ${y - 4}px, 0) skewX(${lean}deg) rotate(${lean * 0.25}deg) scale(${sx}, ${sy})`

    // wind: always a gentle breeze; gusts with speed; extra fluffy on hover
    const gust = clamp(speed * 0.55, 0, 11)
    map.setAttribute('scale', (2.2 + gust + puff * 3 + Math.sin(t / 22) * 0.6).toFixed(2))
    // drift the noise so the fur keeps moving, faster in a gust
    const fx = 0.035 + Math.sin(t / (40 - gust * 2)) * 0.006
    const fy = 0.09 + Math.cos(t / (33 - gust * 1.5)) * 0.012
    noise.setAttribute('baseFrequency', `${fx.toFixed(4)} ${fy.toFixed(4)}`)

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
    document.body.classList.remove('fur-on')
  }
}
