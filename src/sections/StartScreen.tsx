import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { PLAYER_SLOT_ID } from '../components/Character'
import { Prop, ScribbleArrow } from '../components/ui'
import { PROFILE } from '../data/cv'
import { scrollToLevel } from '../game/scroll'

const TICKER = ['Full-stack engineer', 'Game developer', 'M.Des game design', 'AWS', 'React', 'Kubernetes', 'Unity', 'Claude Agent SDK', 'Tel Aviv']

export function StartScreen() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [zoom, setZoom] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -160])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const start = () => {
    setZoom(true)
    window.setTimeout(() => scrollToLevel('profile'), 180)
    window.setTimeout(() => setZoom(false), 900)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && scrollY < innerHeight * 0.5 && document.activeElement === document.body) start()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <section id="start" ref={ref} data-level="start" className="grain relative flex min-h-[100svh] flex-col overflow-hidden">
      <Prop src="/props/chrome-star.png" depth={1.4} rotate={-14} className="start-[52%] top-[10%] w-20 sm:w-28" />
      <Prop src="/props/chrome-star.png" depth={0.7} rotate={18} className="end-[4%] bottom-[22%] w-12 opacity-80 sm:w-16" />

      <motion.div
        animate={zoom ? { scale: 1.12, opacity: 0.4, filter: 'blur(6px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-4 pt-16 pb-8 sm:px-8 lg:grid-cols-[1.4fr_1fr]"
      >
        {/* Name + intro */}
        <motion.div style={{ y: nameY, opacity: fade }} className="relative z-10">
          <p className="mb-6 font-pixel text-xs text-ink-soft">{PROFILE.handle} · new game</p>
          <h1 className="display text-[clamp(4rem,12.5vw,10.5rem)]" aria-label={PROFILE.name}>
            {['Inbal', 'Nitzani'].map((word, w) => (
              <span key={word} className="block overflow-hidden pb-[0.06em] whitespace-nowrap" aria-hidden>
                {[...word].map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={reduce ? false : { y: '105%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 + w * 0.18 + i * 0.04 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-6 font-serif text-[clamp(1.4rem,2.6vw,2.1rem)] leading-tight text-ink-soft italic"
          >
            Full-stack engineer by day,
            <br />
            game developer by night.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="mt-10 flex items-center gap-4">
            <motion.button
              onClick={start}
              whileHover={reduce ? undefined : { scaleX: [1, 1.1, 0.95, 1.04, 1], scaleY: [1, 0.9, 1.06, 0.98, 1], transition: { duration: 0.6 } }}
              whileTap={{ scale: 0.92 }}
              aria-label="Press start"
              className="relative w-48 shrink-0 rounded-3xl sm:w-64"
            >
              {/* glossy jelly-glass lettering (generated 3D render, background removed) */}
              <img
                src="/props/start-jelly.png"
                alt=""
                draggable={false}
                className="w-full drop-shadow-[0_14px_18px_rgb(255_79_163/0.35)] motion-safe:animate-jelly"
              />
            </motion.button>
            <div className="relative min-w-0 ps-8 text-ink sm:ps-10">
              <ScribbleArrow className="absolute start-0 -top-3 w-10 -scale-x-100" d="M6 40 C 30 10, 70 10, 108 30" head="M96 22 L108 30 L96 38" />
              <p className="font-hand text-xl font-semibold whitespace-nowrap -rotate-3 sm:text-4xl">psst… press start</p>
              <p className="mt-1 hidden font-pixel text-[10px] text-ink-soft sm:block">or hit enter · or scroll</p>
            </div>
          </motion.div>
        </motion.div>

        {/* The player stands here; <Player> (App) is the one character that then runs down the page */}
        <div id={PLAYER_SLOT_ID} className="relative mx-auto h-[46svh] w-[28svh] lg:mx-0 lg:h-[min(68svh,640px)] lg:w-[min(41svh,384px)] lg:justify-self-end" />
      </motion.div>

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-ink/10 bg-white/50 py-3 backdrop-blur">
        <div className="flex w-max motion-safe:animate-marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {TICKER.map((t) => (
                <span key={t} className="flex items-center gap-6 px-4 font-display text-lg font-extrabold whitespace-nowrap sm:text-xl">
                  {t}
                  <img src="/props/chrome-star.png" alt="" className="size-6" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
