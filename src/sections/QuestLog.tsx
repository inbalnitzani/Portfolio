import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { LevelHeader, Section, Window } from '../components/ui'
import { LEVELS, QUESTS, type Quest } from '../data/cv'

const L = LEVELS.find((l) => l.id === 'quests')!
const COLORS = ['var(--color-fur)', 'var(--color-sage)', 'var(--color-lilac)']

function Folder({ quest, color, open, onOpen, index }: { quest: Quest; color: string; open: boolean; onOpen: () => void; index: number }) {
  const reduce = useReducedMotion()
  const papers = quest.loot.slice(0, 3)
  return (
    <motion.button
      onClick={onOpen}
      aria-expanded={open}
      initial={reduce ? false : { opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 16, delay: index * 0.12 }}
      whileHover="peek"
      animate={open ? 'peek' : 'rest'}
      className="group relative block w-full pt-16 text-start"
    >
      {/* back panel with tab */}
      <span className="absolute inset-x-0 top-10 bottom-0 rounded-[22px] brightness-[.93]" style={{ background: color }} />
      <span className="absolute start-0 top-6 h-10 w-[42%] rounded-t-[18px] brightness-[.93]" style={{ background: color }} />
      {/* papers peeking out */}
      {papers.map((p, i) => (
        <motion.span
          key={p.title}
          variants={{ rest: { y: 44, rotate: (i - 1) * 3 }, peek: { y: -44 + i * 27, rotate: (i - 1) * 1.5 } }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.03 }}
          className="absolute top-8 h-32 w-[70%] truncate rounded-md bg-white px-3 py-1.5 text-[11px] leading-snug font-semibold shadow-soft sm:text-xs"
          style={{ insetInlineStart: `${8 + i * 7}%`, zIndex: 1 }}
        >
          {p.title}
        </motion.span>
      ))}
      {/* front panel */}
      <span className="relative z-10 block rounded-[22px] p-4 pt-16 shadow-soft sm:p-6 sm:pt-24" style={{ background: color }}>
        <span className="display block text-2xl sm:text-4xl">{quest.company}</span>
        <span className="mt-1 block font-serif text-base text-ink-soft italic sm:text-lg">
          {quest.when}
          <span className="hidden sm:inline"> · {quest.status === 'active' ? 'active quest' : 'complete'}</span>
        </span>
        {quest.status === 'active' && <span className="absolute end-4 top-4 size-3 rounded-full bg-hot ring-4 ring-white/60 motion-safe:animate-pulse" />}
      </span>
    </motion.button>
  )
}

export function QuestLog() {
  const [open, setOpen] = useState(0)
  const q = QUESTS[open]

  return (
    <Section id="quests" className="grain">
      <LevelHeader short={L.short} title={L.title} accent={L.accent} note="click a folder to open it" />

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {QUESTS.map((quest, i) => (
          <Folder key={quest.company} quest={quest} color={COLORS[i % 3]} index={i} open={open === i} onOpen={() => setOpen(i)} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.company}
          initial={{ opacity: 0, y: -24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="mt-10"
        >
          <Window title={`~/quests/${q.company.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.6fr]">
              <div>
                <p className="font-pixel text-[11px] text-hot">{q.status === 'active' ? '● ACTIVE QUEST' : 'QUEST COMPLETE ✓'}</p>
                <h3 className="display mt-3 text-5xl">{q.company}</h3>
                <p className="mt-2 font-serif text-2xl italic">{q.role}</p>
                <p className="mt-1 text-ink-soft">{q.when}</p>
                <p className="mt-5 leading-relaxed text-ink-soft">{q.tagline}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {q.stack.map((s) => (
                    <span key={s} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="space-y-4">
                {q.loot.map((l, i) => (
                  <motion.li
                    key={l.title}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl bg-paper/70 p-4 sm:p-5"
                  >
                    <p className="font-semibold">
                      {l.title} <span className="ms-1 font-pixel text-[10px] text-hot">+LOOT</span>
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{l.body}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Window>
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}
