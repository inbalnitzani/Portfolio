import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Chip, LevelHeader, Reveal } from '../components/ui'
import { GAMES, PROFILE, type Game } from '../data/cv'
import { useMediaQuery } from '../game/useMediaQuery'

const featured = GAMES.filter((g) => g.featured)
const shelf = GAMES.filter((g) => !g.featured)

export function Games() {
  const [playing, setPlaying] = useState<Game | null>(null)
  const wide = useMediaQuery('(min-width: 1024px)')

  return (
    <section id="games" data-level="games" className="relative scroll-mt-20 bg-ink text-blush">
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-8 sm:pt-32">
        <LevelHeader
          short="LVL 4"
          title="Games I Made"
          blurb="Made in game jams, in class, and for fun. They all play in the browser, so press play."
          dark
        />
      </div>

      {wide ? (
        <HorizontalRail onPlay={setPlaying} />
      ) : (
        <div className="space-y-10 px-4 pb-8 sm:px-8">
          {featured.map((g, i) => (
            <Reveal key={g.slug} delay={i * 0.05}>
              <Cartridge game={g} index={i} onPlay={setPlaying} />
            </Reveal>
          ))}
        </div>
      )}

      {/* Arcade shelf */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-8 sm:pb-32">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h3 className="font-pixel text-sm text-lime">✦ ARCADE SHELF: EARLY BUILDS</h3>
            <a href={PROFILE.links.itch} target="_blank" rel="noreferrer" className="font-pixel text-xs underline underline-offset-4">
              all games on itch.io ↗
            </a>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {shelf.map((g, i) => (
            <Reveal key={g.slug} delay={i * 0.08}>
              <motion.a
                href={g.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }}
                className="block overflow-hidden rounded-2xl border-[3px] border-blush bg-blush text-ink shadow-[6px_6px_0_0_var(--color-hot)]"
              >
                <img src={g.cover} alt="" loading="lazy" className="aspect-[315/250] w-full border-b-[3px] border-ink object-cover" />
                <div className="p-4">
                  <p className="font-display font-bold">{g.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{g.pitch}</p>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>

      <GameModal game={playing} onClose={() => setPlaying(null)} />
    </section>
  )
}

function HorizontalRail({ onPlay }: { onPlay: (g: Game) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26 })
  // Slide the rail from the first card to the last
  const x = useTransform(p, [0, 1], ['0vw', `-${(featured.length - 1) * 68}vw`])

  return (
    <div ref={ref} style={{ height: `${featured.length * 85}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-[6vw] ps-[8vw]">
          {featured.map((g, i) => (
            <div key={g.slug} className="w-[62vw] max-w-[980px] shrink-0">
              <Cartridge game={g} index={i} onPlay={onPlay} />
            </div>
          ))}
        </motion.div>
        <motion.div className="absolute inset-x-[8vw] bottom-10 h-1.5 overflow-hidden rounded-full bg-blush/20">
          <motion.div className="h-full origin-left bg-lime" style={{ scaleX: p }} />
        </motion.div>
      </div>
    </div>
  )
}

/** Featured game card with mouse-follow 3D tilt and a glare. */
function Cartridge({ game: g, index, onPlay }: { game: Game; index: number; onPlay: (g: Game) => void }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.35), transparent 50%)`
  const tints = ['bg-hot', 'bg-lilac', 'bg-lime']

  return (
    <div className="[perspective:1200px]">
      <motion.article
        style={{ rotateX: srx, rotateY: sry }}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          const r = e.currentTarget.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          ry.set((px - 0.5) * 10)
          rx.set((0.5 - py) * 8)
          gx.set(px * 100)
          gy.set(py * 100)
        }}
        onPointerLeave={() => {
          rx.set(0)
          ry.set(0)
        }}
        className={`relative grid overflow-hidden rounded-[28px] border-[3px] border-blush text-ink shadow-[10px_10px_0_0_var(--color-hot)] md:grid-cols-2 ${tints[index % 3]}`}
      >
        <div className="relative min-h-60 overflow-hidden border-b-[3px] border-ink bg-ink md:border-e-[3px] md:border-b-0">
          <img src={g.cover} alt={`${g.title} cover`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
          <span className="absolute top-4 start-4 rounded-lg border-2 border-ink bg-paper px-2 py-0.5 font-pixel text-[10px]">
            CART {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <div className="flex flex-col gap-4 bg-paper p-6 sm:p-8">
          <div className="flex flex-wrap gap-1.5">
            {g.credit && <Chip tint="bubble">{g.credit}</Chip>}
            {g.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
          <h3 className="font-display text-4xl leading-none font-black uppercase lg:text-5xl">{g.title}</h3>
          <p className="leading-relaxed text-ink-soft">{g.pitch}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            {g.embedId && (
              <motion.button
                whileTap={{ y: 4 }}
                onClick={() => onPlay(g)}
                className="rounded-xl border-[3px] border-ink bg-hot px-5 py-2.5 font-pixel text-sm text-white shadow-key active:shadow-none"
              >
                ▶ PLAY HERE
              </motion.button>
            )}
            <a
              href={g.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border-[3px] border-ink bg-paper px-5 py-2.5 font-pixel text-sm shadow-key active:translate-y-1 active:shadow-none"
            >
              itch.io ↗
            </a>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  useEffect(() => {
    if (!game) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [game, onClose])

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink/80 p-3 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Play ${game.title}`}
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl overflow-hidden rounded-3xl border-[3px] border-blush bg-ink shadow-[10px_10px_0_0_var(--color-hot)]"
          >
            <div className="flex items-center gap-3 border-b-[3px] border-blush bg-hot px-4 py-2.5 text-white">
              <span className="font-pixel text-sm">▶ NOW PLAYING: {game.title}</span>
              <a href={game.url} target="_blank" rel="noreferrer" className="ms-auto font-pixel text-xs underline underline-offset-4">
                open on itch.io ↗
              </a>
              <button
                onClick={onClose}
                aria-label="Close"
                autoFocus
                className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-paper font-pixel text-ink"
              >
                ×
              </button>
            </div>
            <div className="relative aspect-video w-full bg-ink">
              <p className="absolute inset-0 grid place-items-center font-pixel text-sm text-blush/60">LOADING…</p>
              <iframe
                title={game.title}
                src={`https://itch.io/embed-upload/${game.embedId}?color=2a0a1f`}
                allow="autoplay; fullscreen; gamepad"
                allowFullScreen
                className="relative h-full w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
