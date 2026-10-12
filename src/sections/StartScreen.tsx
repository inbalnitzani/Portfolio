import { motion, type MotionValue, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { PixelSprite } from '../components/PixelSprite'
import { Chip, Sparkle } from '../components/ui'
import { PROFILE } from '../data/cv'
import { scrollToLevel } from '../game/scroll'

const TICKER = ['Full-Stack Engineer', 'Game Developer', 'M.Des Game Design', 'AWS', 'React', 'Kubernetes', 'Unity', 'Claude Agent SDK', 'Tel Aviv']

// Floating decorations: [x%, y%, size px, depth, kind, rotation]
const FLOATIES: [number, number, number, number, 'star' | 'orb' | 'heart', number][] = [
  [8, 18, 64, 1.4, 'star', -12],
  [86, 14, 90, 0.8, 'orb', 0],
  [78, 62, 54, 1.8, 'star', 18],
  [12, 70, 110, 0.6, 'orb', 0],
  [92, 40, 40, 2.2, 'heart', 10],
  [4, 44, 34, 2.4, 'heart', -14],
  [62, 8, 30, 2, 'star', 0],
  [30, 84, 38, 1.6, 'star', 22],
]

export function StartScreen() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [flash, setFlash] = useState(false)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 60, damping: 18 })
  const smy = useSpring(my, { stiffness: 60, damping: 18 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.7])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const floorY = useTransform(scrollYProgress, [0, 1], [0, 200])

  const start = () => {
    setFlash(true)
    window.setTimeout(() => setFlash(false), 380)
    window.setTimeout(() => scrollToLevel('profile'), 120)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && window.scrollY < window.innerHeight * 0.5 && document.activeElement === document.body) start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section
      id="start"
      ref={ref}
      data-level="start"
      onPointerMove={(e) => {
        if (reduce) return
        mx.set(e.clientX / window.innerWidth - 0.5)
        my.set(e.clientY / window.innerHeight - 0.5)
      }}
      className="holo relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Perspective grid floor */}
      <motion.div
        aria-hidden
        style={{ y: floorY }}
        className="pointer-events-none absolute inset-x-[-50%] bottom-[-10%] h-[55%] [perspective:500px]"
      >
        <div className="grid-floor h-full w-full origin-bottom [transform:rotateX(62deg)] [mask-image:linear-gradient(to_top,black_30%,transparent)] motion-safe:animate-[floor_2.4s_linear_infinite]" />
      </motion.div>
      <style>{`@keyframes floor { to { background-position: 0 64px } }`}</style>

      {/* Floaties with mouse parallax */}
      {FLOATIES.map(([x, y, size, depth, kind, r], i) => (
        <Floaty key={i} x={x} y={y} size={size} depth={depth} kind={kind} r={r} mx={smx} my={smy} i={i} />
      ))}

      <motion.div
        style={{ scale: titleScale, y: titleY, opacity: fade }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pt-16 pb-28 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-full border-[3px] border-ink bg-paper px-4 py-1.5 font-pixel text-xs shadow-sticker sm:text-sm"
        >
          ✦ {PROFILE.handle} ✦ new game
        </motion.div>

        <h1 className="font-display leading-[0.86] font-black tracking-tight uppercase" aria-label={PROFILE.name}>
          {['Inbal', 'Nitzani'].map((word, w) => (
            <span key={word} className="block" aria-hidden>
              {[...word].map((ch, i) => (
                <motion.span
                  key={i}
                  className="chrome-text inline-block text-[clamp(3.4rem,14vw,9.5rem)]"
                  initial={reduce ? false : { y: -260, opacity: 0, rotate: -20 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 15, delay: 0.25 + w * 0.35 + i * 0.05 }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.05, type: 'spring' }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          <Chip tint="hot" className="text-sm">Full-Stack Software Engineer</Chip>
          <Chip tint="lime" className="text-sm">Game Developer</Chip>
          <Chip tint="lilac" className="text-sm">M.Des @ Shenkar</Chip>
        </motion.div>

        {/* Player on a platform */}
        <motion.div
          initial={reduce ? false : { y: -400 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 1.25 }}
          className="relative mt-8 flex flex-col items-center"
        >
          <div className="relative">
            <motion.div
              className="absolute -top-12 start-1/2 w-max sm:-top-2 sm:start-full sm:ms-1 rounded-2xl rounded-es-none border-[3px] border-ink bg-paper px-3 py-1.5 text-sm font-semibold shadow-sticker"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 4 }}
              transition={{ delay: 2, type: 'spring', stiffness: 300 }}
            >
              hi! wanna play? ♡
            </motion.div>
            <PixelSprite size={6} />
          </div>
          <div className="h-5 w-40 rounded-md border-[3px] border-ink bg-lime shadow-sticker [background-image:repeating-linear-gradient(90deg,transparent_0_14px,rgb(42_10_31/0.2)_14px_16px)]" />
        </motion.div>

        <motion.button
          onClick={start}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          whileHover={{ scale: 1.06, rotate: -2 }}
          whileTap={{ scale: 0.94, y: 4 }}
          className="group mt-8 rounded-2xl border-[3px] border-ink bg-hot px-8 py-4 font-pixel text-lg text-white shadow-[0_8px_0_0_var(--color-ink)] active:shadow-[0_2px_0_0_var(--color-ink)] sm:text-2xl"
        >
          <span className="me-2 inline-block motion-safe:animate-blink">▶</span>PRESS START
        </motion.button>
        <p className="mt-4 hidden font-pixel text-xs text-ink-soft sm:block">or hit enter · or just scroll</p>
      </motion.div>

      {/* Ticker */}
      <div className="relative z-10 overflow-hidden border-y-[3px] border-ink bg-ink py-3 text-blush">
        <div className="flex w-max motion-safe:animate-marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {TICKER.map((t) => (
                <span key={t} className="flex items-center gap-6 px-3 font-pixel text-sm whitespace-nowrap sm:text-base">
                  {t}
                  <Sparkle className="size-4" fill="#c6ff3d" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* START flash */}
      {flash && <div className="pointer-events-none fixed inset-0 z-[60] bg-white motion-safe:animate-[flash_380ms_ease-out_forwards]" />}
      <style>{`@keyframes flash { from { opacity: .9 } to { opacity: 0 } }`}</style>
    </section>
  )
}

function Floaty({
  x,
  y,
  size,
  depth,
  kind,
  r,
  mx,
  my,
  i,
}: {
  x: number
  y: number
  size: number
  depth: number
  kind: 'star' | 'orb' | 'heart'
  r: number
  mx: MotionValue<number>
  my: MotionValue<number>
  i: number
}) {
  const tx = useTransform(mx, (v) => v * -60 * depth)
  const ty = useTransform(my, (v) => v * -60 * depth)
  return (
    <motion.div
      aria-hidden
      style={{ left: `${x}%`, top: `${y}%`, x: tx, y: ty, width: size, height: size }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
      className="pointer-events-none absolute z-0 max-sm:opacity-60"
    >
      <div className="h-full w-full motion-safe:animate-float" style={{ ['--r' as string]: `${r}deg`, animationDelay: `${i * -0.7}s` }}>
        {kind === 'star' && <Sparkle className="h-full w-full drop-shadow-[4px_4px_0_#2a0a1f]" fill="url(#chrome)" />}
        {kind === 'orb' && (
          <div className="h-full w-full rounded-full border-[3px] border-ink bg-[radial-gradient(circle_at_32%_28%,#fff_0%,#ffd3ea_18%,#ff9ad5_45%,#8f6bff_100%)] shadow-sticker" />
        )}
        {kind === 'heart' && (
          <svg viewBox="0 0 24 22" className="h-full w-full drop-shadow-[3px_3px_0_#2a0a1f]">
            <path
              d="M12 21S2 14.5 2 7.5A5 5 0 0 1 12 5a5 5 0 0 1 10 2.5C22 14.5 12 21 12 21z"
              fill="url(#chrome)"
              stroke="#2a0a1f"
              strokeWidth="1.6"
            />
          </svg>
        )}
      </div>
    </motion.div>
  )
}
