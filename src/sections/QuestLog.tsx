import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { Chip, LevelHeader, Reveal, Section, Sparkle } from '../components/ui'
import { QUESTS, type Quest } from '../data/cv'

export function QuestLog() {
  const track = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 70%', 'end 60%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  return (
    <Section id="quests" className="bg-blush-deep/60">
      <LevelHeader short="LVL 3" title="Quest Log" blurb="Main quests so far, and the loot from each one." />

      <div ref={track} className="relative">
        {/* Path: dashed rail + scroll-drawn fill */}
        <div aria-hidden className="absolute top-0 bottom-0 start-[19px] w-[6px] rounded-full bg-[repeating-linear-gradient(to_bottom,var(--color-ink)_0_10px,transparent_10px_18px)] opacity-25 md:start-1/2 md:-translate-x-1/2" />
        <motion.div
          aria-hidden
          style={{ scaleY: draw }}
          className="absolute top-0 bottom-0 start-[19px] w-[6px] origin-top rounded-full bg-hot md:start-1/2 md:-translate-x-1/2"
        />

        <ol className="space-y-16 md:space-y-24">
          {QUESTS.map((q, i) => (
            <QuestItem key={q.company} quest={q} index={i} />
          ))}
        </ol>
      </div>
    </Section>
  )
}

function QuestItem({ quest: q, index }: { quest: Quest; index: number }) {
  const right = index % 2 === 1
  return (
    <li className="relative grid ps-14 md:grid-cols-2 md:ps-0">
      {/* Node */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, margin: '-30% 0px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        className={`absolute top-2 start-0 z-10 grid size-11 place-items-center rounded-full border-[3px] border-ink shadow-sticker md:start-1/2 md:-translate-x-1/2 ${
          q.status === 'active' ? 'bg-hot' : 'bg-lime'
        }`}
      >
        {q.status === 'active' ? (
          <Sparkle className="size-6 motion-safe:animate-spin-slow" fill="#fff" />
        ) : (
          <span className="font-pixel text-sm">✓</span>
        )}
      </motion.div>

      <div className={right ? 'md:col-start-2 md:ps-14' : 'md:pe-14'}>
        <Reveal y={60}>
          <article className="rounded-3xl border-[3px] border-ink bg-paper shadow-sticker-lg">
            <header className="border-b-[3px] border-ink p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border-2 border-ink px-2 py-0.5 font-pixel text-[10px] ${
                    q.status === 'active' ? 'bg-hot text-white' : 'bg-lime'
                  }`}
                >
                  {q.status === 'active' ? '● ACTIVE QUEST' : 'QUEST COMPLETE'}
                </span>
                <span className="font-pixel text-[10px] text-ink-soft">{q.when}</span>
              </div>
              <h3 className="font-display text-3xl leading-none font-black">{q.company}</h3>
              <p className="mt-1 font-semibold text-hot">{q.role}</p>
              <p className="mt-2 text-ink-soft">{q.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {q.stack.map((s) => (
                  <Chip key={s} tint="lilac">
                    {s}
                  </Chip>
                ))}
              </div>
            </header>
            <ul className="divide-y-2 divide-dashed divide-ink/20">
              {q.loot.map((l, li) => (
                <motion.li
                  key={l.title}
                  initial={{ opacity: 0, x: right ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ delay: li * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
                  className="flex gap-3 p-5 sm:px-6"
                >
                  <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-bubble font-pixel text-[10px]">
                    {li + 1}
                  </span>
                  <div>
                    <p className="font-bold">
                      {l.title}
                      <span className="ms-2 align-middle font-pixel text-[10px] text-lilac-deep">+LOOT</span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{l.body}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </article>
        </Reveal>
      </div>
    </li>
  )
}
