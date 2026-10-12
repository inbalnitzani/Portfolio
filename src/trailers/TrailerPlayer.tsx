import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type Scene = { caption: string; ms: number }

/**
 * A fake video player for code-animated trailers.
 * Plays while on screen, loops, and can be paused or scrubbed by chapter.
 */
export function TrailerPlayer({
  title,
  scenes,
  render,
  className = '',
}: {
  title: string
  scenes: Scene[]
  render: (scene: number) => ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const reduce = useReducedMotion()
  const [scene, setScene] = useState(0)
  const [paused, setPaused] = useState(false)
  const [loop, setLoop] = useState(0)
  const playing = inView && !paused && !reduce

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => {
      setScene((s) => {
        if (s + 1 >= scenes.length) setLoop((l) => l + 1)
        return (s + 1) % scenes.length
      })
    }, scenes[scene].ms)
    return () => window.clearTimeout(id)
  }, [playing, scene, scenes])

  return (
    <div ref={ref} className={`overflow-hidden rounded-3xl border-[3px] border-ink bg-ink shadow-sticker-lg ${className}`}>
      <div className="dot-bg holo relative aspect-[16/11] overflow-hidden sm:aspect-[16/10]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${loop}-${scene}`}
            className="absolute inset-0 grid place-items-center p-4 sm:p-6"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
          >
            {render(scene)}
          </motion.div>
        </AnimatePresence>

        <span className="absolute top-3 start-3 rounded-md border-2 border-ink bg-paper px-2 py-0.5 font-pixel text-[10px]">
          {title}.mp4
        </span>
        <span className="absolute end-3 top-3 flex items-center gap-1.5 rounded-md border-2 border-ink bg-ink px-2 py-0.5 font-pixel text-[10px] text-white">
          <span className={`size-2 rounded-full ${playing ? 'bg-hot motion-safe:animate-blink' : 'bg-white/40'}`} />
          {playing ? 'REC' : 'PAUSED'}
        </span>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.p
            key={scene}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute inset-x-0 bottom-3 mx-auto w-max max-w-[90%] rounded-lg bg-ink/85 px-3 py-1 text-center text-sm font-semibold text-white"
          >
            {scenes[scene].caption}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-3 py-2.5 text-white">
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play' : 'Pause'}
          className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-white/30 bg-hot font-pixel text-xs"
        >
          {paused ? '▶' : 'II'}
        </button>
        <div className="flex flex-1 gap-1">
          {scenes.map((s, i) => (
            <button
              key={i}
              onClick={() => setScene(i)}
              aria-label={`Chapter ${i + 1}: ${s.caption}`}
              className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"
            >
              <motion.span
                key={`${loop}-${scene}-${i}`}
                className="block h-full bg-lime"
                initial={{ width: i < scene ? '100%' : '0%' }}
                animate={{ width: i < scene ? '100%' : i === scene && playing ? '100%' : '0%' }}
                transition={i === scene && playing ? { duration: s.ms / 1000, ease: 'linear' } : { duration: 0 }}
              />
            </button>
          ))}
        </div>
        <span className="shrink-0 font-pixel text-[10px] text-white/60 tabular-nums">
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
export function CountUp({ to, ms = 900, prefix = '', className = '' }: { to: number; ms?: number; prefix?: string; className?: string }) {
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
  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {v.toLocaleString('en-US')}
    </span>
  )
}
