import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useState } from 'react'
import { LEVELS, PROFILE } from '../data/cv'
import { useGame } from '../game/GameProvider'
import { scrollToLevel } from '../game/scroll'
import { asset } from '../lib/asset'

/** Frosted top bar: logo, scroll-driven XP bar, current level, level select. */
export function HUD() {
  const { current, visited } = useGame()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 })
  const [xp, setXp] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setXp(Math.round(v * 100)))

  const level = LEVELS.find((l) => l.id === current)!
  const dark = current === 'boss'

  return (
    <AnimatePresence>
      {current !== 'start' && (
        <motion.nav
          aria-label="Level select"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5"
        >
          <div
            className={`mx-auto flex max-w-6xl items-center gap-3 rounded-full px-4 py-2.5 shadow-soft ring-1 backdrop-blur-xl transition-colors duration-500 sm:gap-5 sm:px-5 ${
              dark ? 'bg-ink/70 text-white ring-white/10' : 'bg-white/70 ring-ink/5'
            }`}
          >
            <button onClick={() => scrollToLevel('start')} className="shrink-0 font-pixel text-xs">
              {PROFILE.handle}
            </button>

            <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-current/10">
              <motion.div className="h-full origin-left rounded-full bg-hot" style={{ scaleX: progress }} />
            </div>

            <span className="shrink-0 font-pixel text-[10px] tabular-nums opacity-60">XP {xp}</span>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={level.id}
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 14, opacity: 0 }}
                className="hidden shrink-0 text-sm font-semibold md:block"
              >
                {level.title} <span className="accent text-base">{level.accent}</span>
              </motion.span>
            </AnimatePresence>

            <ol className="hidden shrink-0 gap-1.5 lg:flex">
              {LEVELS.slice(1).map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollToLevel(l.id)}
                    title={`${l.title} ${l.accent}`}
                    aria-label={`${l.short}: ${l.title} ${l.accent}`}
                    aria-current={current === l.id ? 'step' : undefined}
                    className={`block size-2.5 rounded-full transition-all duration-300 ${
                      current === l.id ? 'w-6 bg-hot' : visited.has(l.id) ? 'bg-current opacity-60' : 'bg-current opacity-20'
                    }`}
                  />
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
    <div aria-live="polite" className="pointer-events-none fixed end-3 bottom-3 z-50 flex w-[min(330px,calc(100vw-24px))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => dismiss(t.id)}
            initial={{ x: 380, rotate: 4 }}
            animate={{ x: 0, rotate: 0 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/85 p-2.5 pe-4 text-start shadow-lift ring-1 ring-ink/5 backdrop-blur-xl"
          >
            <img src={asset('/props/chrome-star.png')} alt="" className="size-11 shrink-0 motion-safe:animate-[spin_6s_linear_infinite]" />
            <span className="min-w-0">
              <span className="block font-pixel text-[10px] text-hot">{t.title}</span>
              <span className="block truncate text-sm font-medium">{t.body}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
