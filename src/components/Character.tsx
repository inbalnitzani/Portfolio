import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { LevelId } from '../data/cv'
import { useGame } from '../game/GameProvider'

export type Pose = 'idle' | 'wave' | 'run' | 'play'

const POSES: Pose[] = ['idle', 'wave', 'run', 'play']
// The idle render came out a touch taller than the others — normalise visually
const SCALE: Record<Pose, number> = { idle: 0.94, wave: 1, run: 0.86, play: 1 }

/** The player character in one pose, with a gentle breathing loop. */
export function Character({ pose, className = '', breathe = true }: { pose: Pose; className?: string; breathe?: boolean }) {
  return (
    <img
      src={`/character/${pose}.png`}
      alt="Inbal as a 3D game character"
      draggable={false}
      className={`h-full w-auto origin-bottom select-none ${breathe ? 'motion-safe:animate-breathe' : ''} ${className}`}
      style={{ scale: SCALE[pose] }}
    />
  )
}

const LEVEL_POSE: Partial<Record<LevelId, Pose>> = { profile: 'wave', side: 'idle', skills: 'idle', quests: 'idle' }
// Levels that already show the character in the scene
const HIDE_ON: LevelId[] = ['start', 'games', 'boss']

/**
 * Companion: the character rides along the bottom corner. Runs while you scroll
 * (faces the scroll direction), strikes a level pose when you stop, hops on level change.
 */
export function Companion({ hidden = false }: { hidden?: boolean }) {
  const { current } = useGame()
  const reduce = useReducedMotion()
  const [running, setRunning] = useState(false)
  const [up, setUp] = useState(false)
  const hop = useAnimationControls()
  const last = useRef(0)
  const timer = useRef(0)

  useEffect(() => {
    last.current = scrollY
    const onScroll = () => {
      const dy = scrollY - last.current
      last.current = scrollY
      if (Math.abs(dy) < 2) return
      setUp(dy < 0)
      setRunning(true)
      clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setRunning(false), 220)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  // Level-up hop
  useEffect(() => {
    if (reduce) return
    hop.start({ y: [0, -46, 0, -12, 0], scaleY: [1, 1.06, 0.92, 1.02, 1], transition: { duration: 0.75, times: [0, 0.35, 0.6, 0.8, 1] } })
  }, [current, hop, reduce])

  const pose: Pose = running && !reduce ? 'run' : (LEVEL_POSE[current] ?? 'idle')
  const show = !hidden && !HIDE_ON.includes(current)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ x: -160, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -160, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="pointer-events-none fixed start-2 bottom-0 z-30 h-24 w-14 sm:start-4 sm:h-32 sm:w-20"
        >
          <motion.div animate={hop} className="relative h-full origin-bottom">
            {/* all poses stay mounted so swapping never flashes */}
            {POSES.map((p) => (
              <div
                key={p}
                className="absolute bottom-0 start-0 h-full transition-opacity duration-100"
                style={{ opacity: p === pose ? 1 : 0, transform: p === 'run' && up ? 'scaleX(-1)' : undefined }}
              >
                <Character pose={p} breathe={p !== 'run'} className={p === 'run' ? 'motion-safe:animate-runbob' : ''} />
              </div>
            ))}
            <div className="absolute start-1/2 bottom-0 h-3 w-16 -translate-x-1/2 rounded-[50%] bg-ink/15 blur-[3px]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
