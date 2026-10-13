import { AnimatePresence, motion, useAnimationControls, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
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

// Her route: in each level she runs across the screen to this side, then stops and does the pose.
const ROUTE: { id: LevelId; side: 'left' | 'right'; pose: Pose }[] = [
  { id: 'profile', side: 'left', pose: 'wave' },
  { id: 'skills', side: 'right', pose: 'idle' },
  { id: 'quests', side: 'left', pose: 'idle' },
  { id: 'side', side: 'right', pose: 'idle' },
  { id: 'games', side: 'left', pose: 'play' },
]
// The boss arena has its own copy of her
const HIDE_ON: LevelId[] = ['boss']

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

type Geo = {
  heroTop: number
  heroLeft: number
  heroH: number
  runH: number
  vw: number
  vh: number
  sections: { id: LevelId; top: number; height: number }[]
}

/**
 * The one player character. She starts big on the right of the START screen, waving.
 * When you scroll she runs left and drops to the floor of the screen; then in every level she
 * runs across to the other side and stops there to wave, stand or play.
 * Scroll only sets where she's headed — her position follows with spring physics, so she
 * accelerates and slows down like a runner. She runs while she's actually moving and faces
 * the way she's going.
 */
export function Player({ hidden = false }: { hidden?: boolean }) {
  const { current } = useGame()
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const hop = useAnimationControls()
  const [moving, setMoving] = useState(false)
  const [facingLeft, setFacingLeft] = useState(true)
  const [stopPose, setStopPose] = useState<Pose>('wave')
  const [atHero, setAtHero] = useState(true)
  const [H, setH] = useState(400)
  const geo = useRef<Geo>({ heroTop: 0, heroLeft: 0, heroH: 400, runH: 200, vw: 1280, vh: 800, sections: [] })
  const stopTimer = useRef(0)

  // where she's headed (targets) and where she is (springs)
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const ts = useMotionValue(1)
  const x = useSpring(tx, { stiffness: 38, damping: 15, mass: 1 })
  const y = useSpring(ty, { stiffness: 60, damping: 18 })
  const scale = useSpring(ts, { stiffness: 60, damping: 18 })

  const aim = (sy: number) => {
    const g = geo.current
    const runW = g.runH * 0.6
    const side = { left: 12, right: g.vw - runW - 12 }
    const floor = g.vh - g.runH - 6
    const small = g.runH / g.heroH

    if (sy < 40 || !g.sections.length) {
      // standing on her spot on the START screen
      tx.set(g.heroLeft)
      ty.set(g.heroTop - sy)
      ts.set(1)
      setStopPose('wave')
    } else if (sy + g.vh * 0.5 < g.sections[0].top) {
      // the first scroll commits her: she runs all the way off the hero to the left floor
      tx.set(side.left)
      ty.set(floor)
      ts.set(small)
      setStopPose(ROUTE[0].pose)
    } else {
      // the level under the middle of the screen decides the leg of the route she's on
      const f = sy + g.vh * 0.5
      let i = 0
      for (let k = 0; k < ROUTE.length; k++) {
        const sec = g.sections.find((s) => s.id === ROUTE[k].id)
        if (sec && f >= sec.top) i = k
      }
      const leg = ROUTE[i]
      const sec = g.sections.find((s) => s.id === leg.id)!
      const from = i === 0 ? 'left' : ROUTE[i - 1].side
      // she runs during the first half of the level and stands still for the rest
      const p = easeInOut(clamp01((f - sec.top) / (sec.height * 0.5)))
      tx.set(side[from] + (side[leg.side] - side[from]) * p)
      ty.set(floor)
      ts.set(small)
      setStopPose(leg.pose)
    }
    setAtHero(sy < 24)
  }

  useLayoutEffect(() => {
    const measure = () => {
      const slot = document.getElementById(PLAYER_SLOT_ID)
      const r = slot?.getBoundingClientRect()
      const sy = window.scrollY
      const heroH = r?.height || 400
      geo.current = {
        heroTop: (r?.top ?? 120) + sy,
        heroLeft: r ? r.left + r.width / 2 - (heroH * 0.6) / 2 : innerWidth * 0.6,
        heroH,
        runH: innerWidth >= 1024 ? 210 : innerWidth >= 640 ? 170 : 112,
        vw: innerWidth,
        vh: innerHeight,
        sections: ROUTE.map(({ id }) => {
          const el = document.getElementById(id)
          const b = el?.getBoundingClientRect()
          return { id, top: (b?.top ?? 0) + sy, height: b?.height ?? innerHeight }
        }),
      }
      setH(heroH)
      aim(sy)
      // first placement: jump straight there, no spring run-in
      x.jump(tx.get())
      y.jump(ty.get())
      scale.jump(ts.get())
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMotionValueEvent(scrollY, 'change', aim)

  // She's "running" while her body actually moves, facing the way she's going
  useMotionValueEvent(x, 'change', () => {
    const v = x.getVelocity()
    if (Math.abs(v) > 40) {
      setMoving(true)
      setFacingLeft(v < 0)
      clearTimeout(stopTimer.current)
      stopTimer.current = window.setTimeout(() => setMoving(false), 140)
    }
  })

  useEffect(() => {
    if (reduce || current === 'start') return
    hop.start({ y: [0, -30, 0, -6, 0], transition: { duration: 0.6, times: [0, 0.38, 0.65, 0.82, 1], ease: 'easeOut' } })
  }, [stopPose, current, hop, reduce])

  const pose: Pose = moving && !reduce ? 'run' : stopPose
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
              transition={{ duration: 0.14, ease: 'easeOut' }}
              style={{ originY: 1 }}
            >
              {/* the run pose faces right; mirror it when she runs left */}
              <div className="h-full" style={{ transform: p === 'run' && facingLeft ? 'scaleX(-1)' : undefined }}>
                <Character pose={p} breathe={p !== 'run'} className={p === 'run' ? 'motion-safe:animate-runbob' : ''} />
              </div>
            </motion.div>
          ))}
          <motion.div
            className="absolute start-1/2 bottom-0 h-[4%] w-[80%] -translate-x-1/2 rounded-[50%] bg-ink/15 blur-md"
            animate={{ scaleX: moving ? 1.25 : 1 }}
          />
          {moving && !reduce && <Dust left={!facingLeft} />}
        </motion.div>

        {/* her greeting, only while she's standing on the START screen */}
        <AnimatePresence>
          {atHero && !moving && (
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
