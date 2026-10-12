import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { LevelHeader, Prop, Reveal, Section } from '../components/ui'
import { LEVELS, SIDE_QUESTS, type SideQuest } from '../data/cv'
import { MusicTrailer, RouterTrailer, TrakabooTrailer } from '../trailers/trailers'

const L = LEVELS[5]
const TRAILERS: Record<SideQuest['slug'], () => React.JSX.Element> = {
  music: MusicTrailer,
  trakaboo: TrakabooTrailer,
  router: RouterTrailer,
}

export function SideQuests() {
  const [active, setActive] = useState(0)
  const q = SIDE_QUESTS[active]
  const Trailer = TRAILERS[q.slug]

  return (
    <Section id="side" className="grain">
      <LevelHeader short={L.short} title={L.title} accent={L.accent} note="software I build when I spot a gap" />
      <Prop src="/props/fur-gamepad.png" depth={1.1} rotate={12} className="end-[-3%] top-[-4%] hidden w-40 lg:block" />

      <div className="grid items-start gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
        <Reveal y={60}>
          {/* key remounts the trailer so each project starts at scene 1 */}
          <AnimatePresence mode="wait">
            <motion.div key={q.slug} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <Trailer />
            </motion.div>
          </AnimatePresence>
        </Reveal>

        <div className="space-y-4">
          {SIDE_QUESTS.map((s, i) => {
            const on = i === active
            return (
              <Reveal key={s.slug} delay={i * 0.08} y={30}>
                <button
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={`w-full rounded-3xl p-5 text-start shadow-soft transition-all duration-300 sm:p-6 ${on ? 'bg-ink text-white' : 'bg-white hover:-translate-y-0.5'}`}
                >
                  <span className={`font-pixel text-[10px] ${on ? 'text-fur' : 'text-hot'}`}>SIDE QUEST 0{i + 1}</span>
                  <span className="mt-1 block font-serif text-3xl italic">{s.title}</span>
                  <span className={`block text-sm ${on ? 'text-white/70' : 'text-ink-soft'}`}>{s.kicker}</span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="block overflow-hidden"
                      >
                        <span className="mt-4 block leading-relaxed text-white/85">{s.body}</span>
                        <span className="mt-4 flex flex-wrap gap-1.5">
                          {s.stack.map((t) => (
                            <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                              {t}
                            </span>
                          ))}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            )
          })}
          {q.link && (
            <a href={q.link.href} target="_blank" rel="noreferrer" className="inline-block ps-2 text-sm font-semibold underline underline-offset-4">
              {q.link.label} ↗
            </a>
          )}
        </div>
      </div>
    </Section>
  )
}
