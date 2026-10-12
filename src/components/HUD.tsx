import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { LEVELS, PROFILE } from '../data/cv'
import { useGame } from '../game/GameProvider'
import { scrollToLevel } from '../game/scroll'
import { PixelSprite } from './PixelSprite'
import { Heart, Trophy } from './ui'

/** Fixed top bar: logo, scroll-driven XP bar with running sprite, level select. */
export function HUD() {
  const { current, visited } = useGame()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 })
  const spriteX = useTransform(progress, (p) => `calc(${p * 100}% - ${p * 28}px)`)
  const [running, setRunning] = useState(false)
  const [facingBack, setFacingBack] = useState(false)
  const [xp, setXp] = useState(0)
  const stopTimer = useRef(0)
  const last = useRef(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setFacingBack(v < last.current)
    last.current = v
    setXp(Math.round(v * 100))
    setRunning(true)
    window.clearTimeout(stopTimer.current)
    stopTimer.current = window.setTimeout(() => setRunning(false), 160)
  })

  const level = LEVELS.find((l) => l.id === current)!
  const show = current !== 'start'

  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          aria-label="Level select"
          initial={{ y: -90 }}
          animate={{ y: 0 }}
          exit={{ y: -90 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border-[3px] border-ink bg-paper/85 px-3 py-2 shadow-sticker backdrop-blur-md">
            <button
              onClick={() => scrollToLevel('start')}
              className="hidden shrink-0 rounded-lg border-2 border-ink bg-hot px-2 py-1 font-pixel text-xs text-white sm:block"
            >
              {PROFILE.handle}
            </button>

            <div className="flex shrink-0 items-center gap-0.5" aria-label="3 lives">
              {[0, 1, 2].map((i) => (
                <Heart key={i} className="h-3.5 w-4" />
              ))}
            </div>

            {/* XP bar */}
            <div className="relative h-9 min-w-0 flex-1">
              <div className="absolute inset-x-0 bottom-0 h-3 overflow-hidden rounded-full border-2 border-ink bg-blush-deep">
                <motion.div
                  className="h-full origin-left bg-[repeating-linear-gradient(90deg,var(--color-hot)_0_10px,var(--color-bubble)_10px_20px)]"
                  style={{ scaleX: progress }}
                />
              </div>
              <motion.div className="absolute -top-1 left-0" style={{ x: spriteX }}>
                <div style={{ transform: facingBack ? 'scaleX(-1)' : undefined }}>
                  <PixelSprite size={2} running={running} />
                </div>
              </motion.div>
            </div>

            <span className="shrink-0 font-pixel text-[10px] text-ink-soft tabular-nums sm:text-xs">XP {xp}</span>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={level.id}
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                className="hidden shrink-0 rounded-lg border-2 border-ink bg-lime px-2 py-1 font-pixel text-xs md:block"
              >
                {level.short} · {level.title}
              </motion.span>
            </AnimatePresence>

            <ol className="hidden shrink-0 gap-1 lg:flex">
              {LEVELS.slice(1).map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToLevel(l.id)}
                    title={`${l.short}: ${l.title}`}
                    aria-current={current === l.id ? 'step' : undefined}
                    className={`grid size-7 place-items-center rounded-md border-2 border-ink font-pixel text-[9px] transition-transform hover:-translate-y-0.5 ${
                      current === l.id ? 'bg-hot text-white' : visited.has(l.id) ? 'bg-bubble' : 'bg-paper text-ink-soft'
                    }`}
                  >
                    {l.id === 'boss' ? <Trophy className="size-4" /> : l.short.replace('LVL ', '')}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

export function Toasts() {
  const { toasts, dismiss } = useGame()
  return (
    <div aria-live="polite" className="pointer-events-none fixed end-3 bottom-3 z-50 flex w-[min(320px,calc(100vw-24px))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => dismiss(t.id)}
            initial={{ x: 360, rotate: 6 }}
            animate={{ x: 0, rotate: 0 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-ink p-3 text-start text-white shadow-sticker"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-white/30 bg-hot">
              <Trophy className="size-6" />
            </span>
            <span className="min-w-0">
              <span className="block font-pixel text-[11px] text-lime">{t.title}</span>
              <span className="block truncate text-sm">{t.body}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
