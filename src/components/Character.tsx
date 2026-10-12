import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { LevelId } from '../data/cv'
import { useGame } from '../game/GameProvider'

export type Pose = 'idle' | 'wave' | 'run' | 'play'

const POSES: Pose[] = ['idle', 'wave', 'run', 'play']
// Poses are cropped to the figure. The raised hand makes "wave" taller and the stride makes
// "run" shorter than her body, so scale them to keep her the same size in every pose.
const SCALE: Record<Pose, number> = { idle: 1, wave: 1.07, run: 0.9, play: 1 }

/** The player character in one pose, standing on the bottom edge, with a breathing loop. */
export function Character({ pose, className = '', breathe = true }: { pose: Pose; className?: string; breathe?: boolean }) {
  return (
    <img
      src={`/character/${pose}.png`}
      alt="Inbal as a 3D game character"
      draggable={false}
      className={`h-full w-auto max-w-none origin-bottom select-none ${breathe ? 'motion-safe:animate-breathe' : ''} ${className}`}
      style={{ scale: SCALE[pose] }}
    />
  )
}

const LEVEL_POSE: Partial<Record<LevelId, Pose>> = { profile: 'wave', skills: 'idle', quests: 'idle', side: 'idle' }
// Levels that already show the character in the scene
const HIDE_ON: LevelId[] = ['start', 'games', 'boss']

/**
 * Companion: the character rides along the bottom corner. She runs while you scroll,
 * strikes the level's pose when you stop, and hops when you reach a new level.
 */
export function Companion({ hidden = false }: { hidden?: boolean }) {
  const { current } = useGame()
  const reduce = useReducedMotion()
  const [running, setRunning] = useState(false)
  const hop = useAnimationControls()
  const last = useRef(0)
  const stopTimer = useRef(0)

  useEffect(() => {
    last.current = scrollY
    const onScroll = () => {
      const dy = Math.abs(scrollY - last.current)
      last.current = scrollY
      if (dy < 3) return
      setRunning(true)
      clearTimeout(stopTimer.current)
      // stay in the run a beat after scrolling stops so short flicks don't flicker
      stopTimer.current = window.setTimeout(() => setRunning(false), 320)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (reduce) return
    hop.start({ y: [0, -38, 0, -8, 0], transition: { duration: 0.7, times: [0, 0.38, 0.65, 0.82, 1], ease: 'easeOut' } })
  }, [current, hop, reduce])

  const pose: Pose = running && !reduce ? 'run' : (LEVEL_POSE[current] ?? 'idle')
  const show = !hidden && !HIDE_ON.includes(current)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ x: -220, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -220, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          className="pointer-events-none fixed start-1 bottom-2 z-30 h-32 w-28 sm:start-3 sm:h-48 sm:w-40 lg:h-60 lg:w-48"
        >
          {/* ground shadow: stretches while running */}
          <motion.div
            className="absolute start-1/2 bottom-0 h-3 w-[70%] -translate-x-1/2 rounded-[50%] bg-ink/20 blur-[4px]"
            animate={{ scaleX: running ? 1.2 : 1, opacity: running ? 0.7 : 1 }}
          />
          <motion.div animate={hop} className="relative h-full">
            {POSES.map((p) => (
              <motion.div
                key={p}
                className="absolute bottom-0 start-1/2 h-full -translate-x-1/2"
                initial={false}
                animate={p === pose ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                style={{ originY: 1 }}
              >
                <Character pose={p} breathe={p !== 'run'} className={p === 'run' ? 'motion-safe:animate-runbob' : ''} />
              </motion.div>
            ))}
          </motion.div>
          {running && !reduce && <Dust />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Little dust puffs kicked up behind her feet while running. */
function Dust() {
  return (
    <div className="absolute start-[8%] bottom-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 block size-3 rounded-full bg-paper-2 ring-1 ring-ink/10"
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.9 }}
          animate={{ x: -26 - i * 10, y: -10 - i * 4, scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.18, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
