import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { LevelHeader, Reveal, Scribble, Section } from '../components/ui'
import { GAMES, LEVELS, PROFILE, type Game } from '../data/cv'

const L = LEVELS.find((l) => l.id === 'games')!
const featured = GAMES.filter((g) => g.featured)
const shelf = GAMES.filter((g) => !g.featured)
// Screen rectangle inside /props/pink-computer.png, as % of the image
const SCREEN = { left: '25.3%', top: '15.6%', width: '47.8%', height: '36.4%' }

export function Games({ onModal }: { onModal: (open: boolean) => void }) {
  const [channel, setChannel] = useState(0)
  const [flicker, setFlicker] = useState(0)
  const [playing, setPlaying] = useState<Game | null>(null)
  const reduce = useReducedMotion()
  const crt = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: crt, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.82, 1])
  const tilt = useTransform(scrollYProgress, [0, 1], [8, 0])
  const g = featured[channel]

  const tune = (i: number) => {
    if (i === channel) return
    setChannel(i)
    setFlicker((f) => f + 1)
  }
  const play = (game: Game | null) => {
    setPlaying(game)
    onModal(!!game)
  }

  return (
    <Section id="games" className="bg-lilac">
      <LevelHeader short={L.short} title={L.title} accent={L.accent} />

      <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.6fr]">
        {/* Channel list */}
        <div className="order-2 lg:order-1">
          <p className="mb-3 font-pixel text-[11px] text-ink-soft">CHANNELS</p>
          <ul className="space-y-2.5">
            {featured.map((game, i) => (
              <li key={game.slug}>
                <button
                  onClick={() => tune(i)}
                  aria-pressed={channel === i}
                  className={`flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-start font-semibold shadow-soft transition-colors duration-300 ${
                    channel === i ? 'bg-ink text-white' : 'bg-white/80 hover:bg-white'
                  }`}
                >
                  <span className="font-pixel text-[10px] opacity-60">CH{i + 1}</span>
                  {game.title}
                  {channel === i && <span className="ms-auto text-hot">▶</span>}
                </button>
              </li>
            ))}
          </ul>

          <AnimatePresence mode="wait">
            <motion.div key={g.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-8">
              <div className="flex flex-wrap gap-1.5">
                {[g.credit, ...g.tags].filter(Boolean).map((t) => (
                  <span key={t} className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-lg leading-relaxed">{g.pitch}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {g.embedId && (
                  <button onClick={() => play(g)} className="rounded-full bg-hot px-6 py-3 font-semibold text-white shadow-[0_14px_30px_-12px_rgb(255_79_163/.7)] transition-transform hover:-translate-y-0.5">
                    ▶ Play here
                  </button>
                )}
                <a href={g.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-6 py-3 font-semibold shadow-soft transition-transform hover:-translate-y-0.5">
                  itch.io ↗
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The pink computer */}
        <motion.div ref={crt} style={reduce ? undefined : { scale, rotateX: tilt }} className="relative order-1 [perspective:1200px] lg:order-2">
          <div className="relative mx-auto w-[min(640px,100%)]">
            <img src="/props/pink-computer.png" alt="" className="relative w-full" loading="lazy" />
            <button
              onClick={() => g.embedId && play(g)}
              aria-label={`Play ${g.title}`}
              className="absolute overflow-hidden rounded-[6%] bg-ink"
              style={SCREEN}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={g.slug}
                  src={g.cover}
                  alt=""
                  initial={{ opacity: 0, scaleY: 0.02 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              {/* scanlines + glass glare */}
              <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/.14)_0_1px,transparent_1px_3px)]" />
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_10%,rgb(255_255_255/.35),transparent_55%)]" />
              {/* channel-switch static */}
              {flicker > 0 && (
                <motion.span
                  key={flicker}
                  className="grain pointer-events-none absolute inset-0 bg-white/70"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0.6, 0.9, 0] }}
                  transition={{ duration: 0.45 }}
                />
              )}
              <span className="absolute end-2 bottom-1.5 font-pixel text-[9px] text-white/80">CH{channel + 1}</span>
            </button>
          </div>
          <Scribble className="absolute start-[2%] bottom-[2%] hidden sm:block" rotate={-6} delay={0.4}>
            playable right here!
          </Scribble>
        </motion.div>
      </div>

      {/* Arcade shelf */}
      <div className="mt-28">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-serif text-4xl italic">Early builds</h3>
          <a href={PROFILE.links.itch} target="_blank" rel="noreferrer" className="text-sm font-semibold underline underline-offset-4">
            all games on itch.io ↗
          </a>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {shelf.map((game, i) => (
            <Reveal key={game.slug} delay={i * 0.08}>
              <a
                href={game.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-white p-3 pb-5 shadow-soft transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-0"
                style={{ rotate: `${(i - 1) * 2}deg` }}
              >
                <img src={game.cover} alt="" loading="lazy" className="aspect-[315/250] w-full object-cover" />
                <p className="mt-3 font-display text-xl font-extrabold">{game.title}</p>
                <p className="text-sm text-ink-soft">{game.pitch}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      <GameModal game={playing} onClose={() => play(null)} />
    </Section>
  )
}

function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  useEffect(() => {
    if (!game) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [game, onClose])

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-ink/70 p-3 backdrop-blur-md sm:p-8"
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
            initial={{ scale: 0.86, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl overflow-hidden rounded-3xl bg-ink shadow-lift"
          >
            <div className="flex items-center gap-3 px-5 py-3 text-white">
              <span className="font-pixel text-xs">▶ NOW PLAYING · {game.title}</span>
              <a href={game.url} target="_blank" rel="noreferrer" className="ms-auto text-sm underline underline-offset-4">
                open on itch.io ↗
              </a>
              <button onClick={onClose} aria-label="Close" autoFocus className="grid size-9 place-items-center rounded-full bg-white/10 text-lg">
                ×
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <p className="absolute inset-0 grid place-items-center font-pixel text-sm text-white/50">LOADING…</p>
              <iframe
                title={game.title}
                src={`https://itch.io/embed-upload/${game.embedId}?color=121212`}
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
