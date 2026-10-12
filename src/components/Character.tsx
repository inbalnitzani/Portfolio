import { AnimatePresence, motion, useAnimationControls, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { LevelId } from '../data/cv'
import { useGame } from '../game/GameProvider'
import { Bubble } from './ui'

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

/** Where the player stands on the START screen. The Player measures this box. */
export const PLAYER_SLOT_ID = 'player-slot'

const LEVEL_POSE: Partial<Record<LevelId, Pose>> = { profile: 'wave', skills: 'idle', quests: 'idle', side: 'idle' }
// Levels whose scene has its own copy of her (she steps into the scene there)
const HIDE_ON: LevelId[] = ['games', 'boss']

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * The one player character. She starts big on the START screen, waving "hi! wanna play?".
 * As soon as you scroll she runs off the hero down to the bottom of the screen, then keeps
 * running across the page with your scroll: left → right as you go down, back as you go up.
 * When you stop she strikes the level's pose, and she hops on each new level.
 */
export function Player({ hidden = false }: { hidden?: boolean }) {
  const { current } = useGame()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const hop = useAnimationControls()
  const [running, setRunning] = useState(false)
  const [facingLeft, setFacingLeft] = useState(false)
  const [atHero, setAtHero] = useState(true)
  const [H, setH] = useState(400)
  const stopTimer = useRef(0)
  const lastX = useRef(0)

  // Geometry: hero slot (document coords) + runner size, refreshed on resize
  const geo = useRef({ heroTop: 0, heroLeft: 0, heroH: 400, runH: 200, vw: 1280, vh: 800, doc: 4000 })
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  const place = (sy: number) => {
    const g = geo.current
    const handoff = g.vh * 0.65 // scroll distance over which she runs from the hero to the track
    const t = ease(clamp01(sy / handoff))
    const runW = g.runH * 0.6
    const track = clamp01((sy - handoff) / Math.max(1, g.doc - g.vh - handoff))
    const rx = 12 + track * (g.vw - runW - 24)
    const ry = g.vh - g.runH - 6
    const hx = g.heroLeft
    const hy = g.heroTop - sy
    const nx = hx + (rx - hx) * t
    x.set(nx)
    y.set(hy + (ry - hy) * t)
    scale.set(1 + (g.runH / g.heroH - 1) * t)
    if (Math.abs(nx - lastX.current) > 0.5) setFacingLeft(nx < lastX.current)
    lastX.current = nx
    setAtHero(sy < 24)
  }

  useLayoutEffect(() => {
    const measure = () => {
      const slot = document.getElementById(PLAYER_SLOT_ID)
      const r = slot?.getBoundingClientRect()
      const runH = innerWidth >= 1024 ? 210 : innerWidth >= 640 ? 170 : 112
      geo.current = {
        heroTop: (r?.top ?? 120) + window.scrollY,
        heroLeft: r ? r.left + r.width / 2 - (r.height * 0.6) / 2 : innerWidth * 0.6,
        heroH: r?.height || 400,
        runH,
        vw: innerWidth,
        vh: innerHeight,
        doc: document.documentElement.scrollHeight,
      }
      lastX.current = geo.current.heroLeft
      setH(geo.current.heroH)
      place(window.scrollY)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMotionValueEvent(scrollY, 'change', (sy) => {
    place(sy)
    setRunning(true)
    clearTimeout(stopTimer.current)
    // keep running a beat after the scroll stops so short flicks don't flicker
    stopTimer.current = window.setTimeout(() => setRunning(false), 320)
  })

  useEffect(() => {
    if (reduce || current === 'start') return
    hop.start({ y: [0, -38, 0, -8, 0], transition: { duration: 0.7, times: [0, 0.38, 0.65, 0.82, 1], ease: 'easeOut' } })
  }, [current, hop, reduce])

  const pose: Pose = running && !reduce ? 'run' : atHero ? 'wave' : (LEVEL_POSE[current] ?? 'idle')
  const visible = !hidden && !HIDE_ON.includes(current)

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-30 origin-top-left"
      style={{ x, y, scale, height: H, width: H * 0.6 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* entrance: drops onto the START screen with a squash */}
      <motion.div
        className="relative h-full origin-bottom"
        initial={reduce ? false : { y: -innerHeight, scaleY: 1.1 }}
        animate={{ y: 0, scaleY: [1.1, 0.88, 1.04, 1] }}
        transition={{ y: { type: 'spring', stiffness: 160, damping: 14, delay: 0.5 }, scaleY: { delay: 0.95, duration: 0.6 } }}
      >
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
              <div className="h-full" style={{ transform: p === 'run' && facingLeft ? 'scaleX(-1)' : undefined }}>
                <Character pose={p} breathe={p !== 'run'} className={p === 'run' ? 'motion-safe:animate-runbob' : ''} />
              </div>
            </motion.div>
          ))}
          <motion.div
            className="absolute start-1/2 bottom-0 h-[4%] w-[80%] -translate-x-1/2 rounded-[50%] bg-ink/15 blur-md"
            animate={{ scaleX: running ? 1.2 : 1 }}
          />
          {running && !reduce && <Dust left={!facingLeft} />}
        </motion.div>

        {/* her greeting, only while she's standing on the START screen */}
        <AnimatePresence>
          {atHero && !running && (
            <motion.div
              className="absolute end-[-30%] top-[4%] flex flex-col items-end gap-2"
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
            >
              <Bubble delay={1.6}>hi! wanna play?</Bubble>
              <Bubble delay={1.9}>:)</Bubble>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/** Little dust puffs kicked up behind her feet while running. */
function Dust({ left }: { left: boolean }) {
  return (
    <div className={`absolute bottom-[1%] ${left ? 'start-[10%]' : 'end-[10%]'}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 block size-[10px] rounded-full bg-paper-2 ring-1 ring-ink/10"
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0.9 }}
          animate={{ x: (left ? -1 : 1) * (26 + i * 10), y: -10 - i * 4, scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.6, delay: i * 0.18, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
