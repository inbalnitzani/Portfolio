import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { useEffect, useState } from 'react'
import { PixelSprite } from '../components/PixelSprite'
import { LevelHeader, Section, Sparkle } from '../components/ui'
import { PROFILE } from '../data/cv'
import { useGame } from '../game/GameProvider'

type Move = { label: string; sub: string; dmg: number; href?: string; download?: boolean; copy?: string; tint: string }

const MOVES: Move[] = [
  { label: 'Download Save File', sub: 'CV · PDF', dmg: 40, href: PROFILE.cv, download: true, tint: 'bg-lime' },
  { label: 'Send Email', sub: PROFILE.email, dmg: 30, href: `mailto:${PROFILE.email}`, tint: 'bg-hot text-white' },
  { label: 'Call', sub: PROFILE.phone, dmg: 20, href: `tel:${PROFILE.phone.replace(/-/g, '')}`, tint: 'bg-bubble' },
  { label: 'LinkedIn', sub: 'connect', dmg: 20, href: PROFILE.links.linkedin, tint: 'bg-sky' },
  { label: 'GitHub', sub: '@inbalnitzani', dmg: 15, href: PROFILE.links.github, tint: 'bg-lilac' },
  { label: 'itch.io', sub: 'play more games', dmg: 15, href: PROFILE.links.itch, tint: 'bg-paper' },
  { label: 'Copy Email', sub: 'to clipboard', dmg: 10, copy: PROFILE.email, tint: 'bg-paper' },
]

const MAX_HP = 100

// Pixel "Hiring Pipeline" boss: an angry briefcase
const BOSS = [
  '.....kkkkkk.....',
  '....kk....kk....',
  'kkkkkkkkkkkkkkkk',
  'kppppppppppppppk',
  'kpkkpppppppkkppk',
  'kppkkpppppkkpppk',
  'kpwwkpppppkwwppk',
  'kpwkkpppppkkwppk',
  'kppppppppppppppk',
  'kkkkkkkggkkkkkkk',
  'kppppppggppppppk',
  'kpppkkkkkkkkpppk',
  'kpppkwkwkwkkpppk',
  'kppppppppppppppk',
  'kkkkkkkkkkkkkkkk',
]
const BOSS_COLORS: Record<string, string> = { k: '#2a0a1f', p: '#8f6bff', w: '#ffffff', g: '#c6ff3d' }

type Hit = { id: number; dmg: number; x: number }

export function Boss() {
  const { notify } = useGame()
  const [hp, setHp] = useState(MAX_HP)
  const [hits, setHits] = useState<Hit[]>([])
  const controls = useAnimationControls()
  const defeated = hp <= 0

  const attack = (m: Move) => {
    if (m.copy) {
      navigator.clipboard?.writeText(m.copy).then(
        () => notify('Copied!', `${m.copy} is on your clipboard`),
        () => {},
      )
    }
    if (defeated) return
    const id = Date.now() + Math.random()
    setHits((h) => [...h, { id, dmg: m.dmg, x: Math.random() * 60 - 30 }])
    window.setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), 900)
    controls.start({ x: [0, -14, 12, -8, 6, 0], rotate: [0, -4, 4, -2, 0], transition: { duration: 0.45 } })
    setHp((h) => Math.max(0, h - m.dmg))
  }

  useEffect(() => {
    if (defeated) notify('BOSS DEFEATED', "You win! Can't wait to hear from you ♡")
  }, [defeated, notify])

  return (
    <Section id="boss" className="overflow-hidden bg-ink text-blush">
      <LevelHeader short="BOSS" title="Final Boss" blurb="The Hiring Pipeline blocks your path. Use any contact move to attack." dark />

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* Arena */}
        <div className="relative rounded-3xl border-[3px] border-blush bg-[linear-gradient(to_bottom,#3d1230,#2a0a1f)] p-6 shadow-[10px_10px_0_0_var(--color-hot)] sm:p-8">
          <div className="mb-6">
            <div className="mb-1.5 flex justify-between font-pixel text-xs">
              <span>{defeated ? 'HIRED ♡' : 'THE HIRING PIPELINE'}</span>
              <span className="tabular-nums">
                HP {hp}/{MAX_HP}
              </span>
            </div>
            <div className="h-5 overflow-hidden rounded-md border-[3px] border-blush bg-ink">
              <motion.div
                className={`h-full ${hp > 50 ? 'bg-lime' : hp > 20 ? 'bg-[#fff36b]' : 'bg-hot'}`}
                animate={{ width: `${(hp / MAX_HP) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            </div>
          </div>

          <div className="relative flex h-64 items-end justify-between px-2 sm:h-72">
            <div className="relative z-10">
              <PixelSprite size={6} />
            </div>

            <div className="relative">
              <AnimatePresence>
                {hits.map((h) => (
                  <motion.span
                    key={h.id}
                    className="absolute -top-6 left-1/2 z-20 font-pixel text-2xl whitespace-nowrap text-lime [text-shadow:3px_3px_0_#2a0a1f]"
                    initial={{ y: 0, x: h.x, opacity: 1, scale: 0.6 }}
                    animate={{ y: -70, opacity: 0, scale: 1.3 }}
                    transition={{ duration: 0.9 }}
                  >
                    -{h.dmg}
                    {h.dmg >= 40 ? ' CRIT!' : ''}
                  </motion.span>
                ))}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {defeated ? (
                  <motion.div
                    key="win"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                    className="flex flex-col items-center"
                  >
                    <svg viewBox="0 0 24 22" className="size-40 drop-shadow-[6px_6px_0_#ff3ea5]">
                      <path d="M12 21S2 14.5 2 7.5A5 5 0 0 1 12 5a5 5 0 0 1 10 2.5C22 14.5 12 21 12 21z" fill="url(#chrome)" stroke="#ffe8f4" strokeWidth="1.2" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.svg
                    key="boss"
                    animate={controls}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    viewBox={`0 0 16 ${BOSS.length}`}
                    className="w-40 sm:w-48"
                    shapeRendering="crispEdges"
                    role="img"
                    aria-label="Hiring pipeline boss"
                  >
                    <g className="motion-safe:animate-[bossbob_1.6s_ease-in-out_infinite]">
                      {BOSS.map((row, y) =>
                        [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={BOSS_COLORS[c]} />)),
                      )}
                    </g>
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <style>{`@keyframes bossbob { 50% { transform: translateY(-0.6px) } }`}</style>
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 rounded-full bg-hot/40 blur-md" />
          </div>

          <AnimatePresence>
            {defeated && (
              <>
                <Confetti />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <p className="chrome-text font-display text-4xl font-black uppercase">You win!</p>
                  <p className="mt-2 text-blush/80">Let's build something together ♡</p>
                  <button onClick={() => setHp(MAX_HP)} className="mt-3 font-pixel text-xs underline underline-offset-4">
                    play again
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Move list */}
        <div>
          <p className="mb-4 font-pixel text-xs text-lime">▶ CHOOSE YOUR MOVE</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {MOVES.map((m, i) => {
              const content = (
                <>
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-bold">{m.label}</span>
                    <span className="shrink-0 rounded-md border-2 border-ink bg-ink px-1.5 font-pixel text-[10px] text-lime">
                      {m.dmg} DMG
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm opacity-80">{m.sub}</span>
                </>
              )
              const cls = `block w-full rounded-2xl border-[3px] border-ink px-4 py-3 text-start text-ink shadow-[0_6px_0_0_var(--color-blush)] transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-none ${m.tint} ${
                i === 0 ? 'sm:col-span-2' : ''
              }`
              return (
                <motion.li
                  key={m.label}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 220, damping: 22 }}
                  className={i === 0 ? 'sm:col-span-2' : ''}
                >
                  {m.href ? (
                    <a
                      href={m.href}
                      onClick={() => attack(m)}
                      className={cls}
                      {...(m.download ? { download: 'Inbal_Nitzani_CV.pdf' } : m.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {content}
                    </a>
                  ) : (
                    <button onClick={() => attack(m)} className={cls}>
                      {content}
                    </button>
                  )}
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>

      <footer className="mt-24 flex flex-col items-center gap-3 text-center font-pixel text-xs text-blush/60">
        <Sparkle className="size-6" fill="#ff3ea5" />
        <p>
          © {new Date().getFullYear()} {PROFILE.name} · built with React, Motion & a lot of pink
        </p>
        <p>thanks for playing ♡</p>
      </footer>
    </Section>
  )
}

function Confetti() {
  const colors = ['#ff3ea5', '#c6ff3d', '#c9b6ff', '#9fe3ff', '#fff36b', '#ffffff']
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: (Math.random() - 0.5) * 600,
      y: Math.random() * 400 - 120,
      d: 1.6 + Math.random(),
      c: colors[i % colors.length],
    })),
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-1/3 left-1/2 size-2.5"
          style={{ background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: i * 23 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: 360 + i * 30 }}
          transition={{ duration: p.d, ease: [0.2, 0.7, 0.3, 1] }}
        />
      ))}
    </div>
  )
}
