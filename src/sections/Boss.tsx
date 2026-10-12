import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { useEffect, useState } from 'react'
import { Character } from '../components/Character'
import { LevelHeader, Section } from '../components/ui'
import { LEVELS, PROFILE } from '../data/cv'
import { useGame } from '../game/GameProvider'

const L = LEVELS.find((l) => l.id === 'boss')!
const MAX_HP = 100

type Move = { label: string; sub: string; dmg: number; href?: string; download?: boolean; copy?: string }
const MOVES: Move[] = [
  { label: 'Download save file', sub: 'CV · PDF', dmg: 40, href: PROFILE.cv, download: true },
  { label: 'Send email', sub: PROFILE.email, dmg: 30, href: `mailto:${PROFILE.email}` },
  { label: 'Call', sub: PROFILE.phone, dmg: 20, href: `tel:${PROFILE.phone.replace(/-/g, '')}` },
  { label: 'LinkedIn', sub: 'connect', dmg: 20, href: PROFILE.links.linkedin },
  { label: 'GitHub', sub: '@inbalnitzani', dmg: 15, href: PROFILE.links.github },
  { label: 'itch.io', sub: 'more games', dmg: 15, href: PROFILE.links.itch },
  { label: 'Copy email', sub: 'to clipboard', dmg: 10, copy: PROFILE.email },
]

type Hit = { id: number; dmg: number; x: number }

export function Boss() {
  const { notify } = useGame()
  const [hp, setHp] = useState(MAX_HP)
  const [hits, setHits] = useState<Hit[]>([])
  const shake = useAnimationControls()
  const defeated = hp <= 0

  const attack = (m: Move) => {
    if (m.copy) navigator.clipboard?.writeText(m.copy).then(() => notify('Copied!', `${m.copy} is on your clipboard`), () => {})
    if (defeated) return
    const id = Date.now() + Math.random()
    setHits((h) => [...h, { id, dmg: m.dmg, x: Math.random() * 80 - 40 }])
    window.setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 900)
    shake.start({ x: [0, -18, 14, -9, 5, 0], rotate: [0, -6, 5, -2, 0], transition: { duration: 0.45 } })
    setHp((h) => Math.max(0, h - m.dmg))
  }

  useEffect(() => {
    if (defeated) notify('BOSS DEFEATED', "You win! Can't wait to hear from you ♡")
  }, [defeated, notify])

  return (
    <Section id="boss" className="overflow-hidden bg-ink text-white">
      <LevelHeader short={L.short} title={L.title} accent={L.accent} dark />

      <h3 className="display -mt-6 mb-16 text-[clamp(2.6rem,7vw,5.5rem)]">
        Let’s build <span className="accent !text-fur">something.</span>
      </h3>

      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        {/* Arena */}
        <div className="relative rounded-[32px] bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
          <div className="mb-1.5 flex justify-between font-pixel text-[11px]">
            <span>{defeated ? 'HIRED ♡' : 'THE HIRING PIPELINE'}</span>
            <span className="tabular-nums">
              HP {hp}/{MAX_HP}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full ${hp > 50 ? 'bg-key' : hp > 20 ? 'bg-butter' : 'bg-hot'}`}
              animate={{ width: `${(hp / MAX_HP) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            />
          </div>

          <div className="relative mt-6 flex h-72 items-end justify-between sm:h-80">
            <motion.div
              className="relative z-10 h-[88%] origin-bottom"
              animate={defeated ? { y: [0, -60, 0, -30, 0], scaleY: [1, 1.05, 0.9, 1.02, 1] } : {}}
              transition={{ duration: 0.9, repeat: defeated ? Infinity : 0, repeatDelay: 0.6 }}
            >
              <Character pose="wave" />
            </motion.div>

            <div className="relative me-2 w-40 sm:w-52">
              <AnimatePresence>
                {hits.map((h) => (
                  <motion.span
                    key={h.id}
                    className="absolute -top-4 left-1/2 z-20 font-display text-3xl font-black whitespace-nowrap text-key"
                    initial={{ y: 0, x: h.x, opacity: 1, scale: 0.6 }}
                    animate={{ y: -80, opacity: 0, scale: 1.3 }}
                    transition={{ duration: 0.9 }}
                  >
                    -{h.dmg}
                    {h.dmg >= 40 ? ' CRIT!' : ''}
                  </motion.span>
                ))}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {defeated ? (
                  <motion.img
                    key="win"
                    src="/props/chrome-star.png"
                    alt="Defeated, a chrome star"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                    className="w-full motion-safe:animate-[spin_8s_linear_infinite]"
                  />
                ) : (
                  <motion.div key="boss" animate={shake} exit={{ scale: 0, rotate: 120, opacity: 0, transition: { duration: 0.4 } }} className="relative">
                    <img src="/props/disco-folder.png" alt="The hiring pipeline boss, a disco-ball folder" className="w-full motion-safe:animate-float" />
                    {/* angry eyes */}
                    <span className="absolute top-[46%] left-[30%] flex gap-[18%]" aria-hidden>
                      <i className="block h-3 w-5 rotate-12 rounded-b-full bg-ink" />
                      <i className="block h-3 w-5 -rotate-12 rounded-b-full bg-ink" />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="absolute inset-x-6 bottom-0 h-4 rounded-full bg-hot/30 blur-xl" />
          </div>

          <AnimatePresence>
            {defeated && (
              <>
                <Confetti />
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <p className="display text-5xl">
                    You <span className="accent !text-fur">win!</span>
                  </p>
                  <button onClick={() => setHp(MAX_HP)} className="mt-3 text-sm text-white/70 underline underline-offset-4">
                    play again
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Moves */}
        <div>
          <p className="mb-4 font-pixel text-[11px] text-fur">▶ CHOOSE YOUR MOVE</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {MOVES.map((m, i) => {
              const cls = `group flex w-full items-center justify-between gap-3 rounded-full px-6 py-4 text-start ring-1 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 ${
                i === 0 ? 'bg-hot ring-hot shadow-[0_18px_40px_-16px_rgb(255_79_163/.8)]' : 'bg-white/[0.07] ring-white/15 hover:bg-white/[0.12]'
              }`
              const body = (
                <>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-extrabold">{m.label}</span>
                    <span className="block truncate text-sm text-white/65">{m.sub}</span>
                  </span>
                  <span className="shrink-0 font-pixel text-[10px] text-white/80">{m.dmg} DMG</span>
                </>
              )
              return (
                <motion.li
                  key={m.label}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={i === 0 ? 'sm:col-span-2' : ''}
                >
                  {m.href ? (
                    <a
                      href={m.href}
                      onClick={() => attack(m)}
                      className={cls}
                      {...(m.download ? { download: 'Inbal_Nitzani_CV.pdf' } : m.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {body}
                    </a>
                  ) : (
                    <button onClick={() => attack(m)} className={cls}>
                      {body}
                    </button>
                  )}
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>

      <footer className="mt-32 flex flex-col items-center gap-3 text-center text-sm text-white/50">
        <img src="/props/chrome-star.png" alt="" className="size-10" />
        <p>
          © {new Date().getFullYear()} {PROFILE.name} · built with React, Motion &amp; a lot of pink
        </p>
        <p className="font-hand text-2xl text-white/70">thanks for playing ♡</p>
      </footer>
    </Section>
  )
}

function Confetti() {
  const colors = ['#ff4fa3', '#9dcb5a', '#d9ccff', '#bfe3ff', '#f3e7a8', '#ffffff']
  const [pieces] = useState(() =>
    Array.from({ length: 44 }, (_, i) => ({ x: (Math.random() - 0.5) * 640, y: Math.random() * 420 - 140, d: 1.6 + Math.random(), c: colors[i % colors.length] })),
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-1/3 left-1/2 size-2.5 rounded-sm"
          style={{ background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: i * 23 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: 360 + i * 30 }}
          transition={{ duration: p.d, ease: [0.2, 0.7, 0.3, 1] }}
        />
      ))}
    </div>
  )
}
