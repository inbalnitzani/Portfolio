import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type Scene = { caption: string; ms: number }

const TOOLS = ['↖', '⬚', '✎', '🖌', 'A', '◯', '▭', '⌇', '🪣', '⌕']
const SWATCHES = ['#ff4fa3', '#f6a9cb', '#d9ccff', '#9dcb5a', '#bfe3ff', '#2b3ff5', '#f3e7a8', '#121212']

/**
 * A code-animated "video" playing inside an MS Paint window.
 * Each scene paints itself in with a brush-stroke wipe. Plays while on screen and loops;
 * the colour swatches double as chapter buttons.
 */
export function TrailerPlayer({ title, scenes, render }: { title: string; scenes: Scene[]; render: (scene: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.45 })
  const reduce = useReducedMotion()
  const [scene, setScene] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loop, setLoop] = useState(0)
  const playing = inView && !paused && !reduce

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      if (scene + 1 >= scenes.length) setLoop((l) => l + 1)
      setScene((s) => (s + 1) % scenes.length)
    }, scenes[scene].ms)
    return () => window.clearTimeout(id)
  }, [playing, scene, scenes])

  return (
    <div ref={ref} className="overflow-hidden rounded-xl bg-[#f6f3ee] shadow-lift ring-1 ring-ink/10">
      {/* title bar */}
      <div className="flex items-center gap-2 bg-butter px-3 py-2">
        <span className="size-3.5 rounded-sm bg-hot" aria-hidden />
        <span className="truncate font-mono text-xs">{title}.mp4 - Paint</span>
        <span className="ms-auto flex gap-1" aria-hidden>
          {['–', '□', '×'].map((g) => (
            <span key={g} className="grid size-5 place-items-center rounded bg-white/70 font-mono text-[10px]">
              {g}
            </span>
          ))}
        </span>
      </div>
      {/* menu */}
      <div className="flex gap-4 border-b border-ink/10 px-3 py-1.5 font-mono text-xs" aria-hidden>
        {['File', 'Edit', 'View', 'Image', 'Help'].map((m) => (
          <span key={m}>
            <u>{m[0]}</u>
            {m.slice(1)}
          </span>
        ))}
      </div>

      <div className="flex gap-2 p-2">
        {/* tools */}
        <div className="hidden grid-cols-2 content-start gap-1 sm:grid" aria-hidden>
          {TOOLS.map((t, i) => (
            <span key={i} className={`grid size-7 place-items-center rounded text-xs ${i === 2 ? 'bg-fur' : 'bg-white'} ring-1 ring-ink/10`}>
              {t}
            </span>
          ))}
        </div>

        {/* canvas */}
        <div className="relative aspect-[16/11] flex-1 overflow-hidden bg-white ring-1 ring-ink/10 sm:aspect-[16/10]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${loop}-${scene}`}
              className="absolute inset-0 grid place-items-center bg-blush/60 p-4 sm:p-6"
              initial={reduce ? false : { clipPath: 'inset(0 100% 0 0 round 0 40% 40% 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0 round 0 0% 0% 0)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
            >
              {render(scene)}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={scene}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="absolute inset-x-0 bottom-3 mx-auto w-max max-w-[90%] rounded-full bg-ink/85 px-3 py-1 text-center text-xs font-medium text-white sm:text-sm"
            >
              {scenes[scene].caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* palette = controls */}
      <div className="flex items-center gap-2 border-t border-ink/10 px-3 py-2">
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play trailer' : 'Pause trailer'}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs text-white"
        >
          {paused ? '▶' : 'II'}
        </button>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {scenes.map((s, i) => (
            <button
              key={i}
              onClick={() => setScene(i)}
              aria-label={`Chapter ${i + 1}: ${s.caption}`}
              className={`relative h-6 w-8 overflow-hidden rounded ring-1 ring-ink/15 transition-transform ${i === scene ? '-translate-y-0.5 scale-110' : ''}`}
              style={{ background: SWATCHES[i % SWATCHES.length] + '55' }}
            >
              <motion.span
                key={`${loop}-${scene}-${i}`}
                className="absolute inset-y-0 start-0"
                style={{ background: SWATCHES[i % SWATCHES.length] }}
                initial={{ width: i < scene ? '100%' : '0%' }}
                animate={{ width: i < scene ? '100%' : i === scene && playing ? '100%' : i === scene ? '50%' : '0%' }}
                transition={i === scene && playing ? { duration: s.ms / 1000, ease: 'linear' } : { duration: 0 }}
              />
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-ink-soft tabular-nums">
          {scene + 1}/{scenes.length}
        </span>
      </div>
    </div>
  )
}

/** Types text out character by character. */
export function Typewriter({ text, speed = 45, className = '' }: { text: string; speed?: number; className?: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= text.length) return
    const id = window.setTimeout(() => setN((x) => x + 1), speed)
    return () => window.clearTimeout(id)
  }, [n, text, speed])
  return (
    <span className={className}>
      {text.slice(0, n)}
      <span className="motion-safe:animate-blink">|</span>
    </span>
  )
}

/** Counts a number up from 0. */
export function CountUp({ to, ms = 900, className = '' }: { to: number; ms?: number; className?: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return <span className={`tabular-nums ${className}`}>{v.toLocaleString('en-US')}</span>
}
