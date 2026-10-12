import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { LevelHeader, Reveal, Section, tintClass } from '../components/ui'
import { SKILL_TREE } from '../data/cv'
import { useGame } from '../game/GameProvider'

export function SkillTree() {
  const reduce = useReducedMotion()
  const { notify } = useGame()
  const [equipped, setEquipped] = useState<Set<string>>(new Set())
  const total = SKILL_TREE.reduce((n, g) => n + g.items.length, 0)

  const toggle = (skill: string) => {
    const next = new Set(equipped)
    if (next.has(skill)) next.delete(skill)
    else next.add(skill)
    setEquipped(next)
    if (next.size === total) notify('Completionist!', 'You equipped every skill. Hire her already ♡')
  }

  return (
    <Section id="skills">
      <LevelHeader
        short="LVL 2"
        title="Skill Tree"
        blurb="Press the keys to equip skills to your loadout."
      />

      <Reveal className="mb-8 flex flex-wrap items-center gap-3">
        <span className="rounded-xl border-[3px] border-ink bg-ink px-3 py-1.5 font-pixel text-xs text-lime tabular-nums">
          LOADOUT {equipped.size}/{total}
        </span>
        <AnimatePresence>
          {equipped.size > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setEquipped(new Set())}
              className="font-pixel text-xs text-ink-soft underline underline-offset-4"
            >
              reset
            </motion.button>
          )}
        </AnimatePresence>
      </Reveal>

      <div className="space-y-10">
        {SKILL_TREE.map((group, gi) => (
          <div key={group.name} className="grid gap-4 md:grid-cols-[11rem_1fr] md:gap-8">
            <Reveal y={20} delay={gi * 0.05}>
              <div className="flex items-center gap-3 md:flex-col md:items-start">
                <span className={`rounded-lg border-2 border-ink px-2 py-0.5 font-pixel text-[10px] ${tintClass(group.tint)}`}>
                  BRANCH {String(gi + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl font-bold">{group.name}</h3>
              </div>
            </Reveal>
            <div className="flex flex-wrap gap-x-3 gap-y-4">
              {group.items.map((skill, i) => {
                const on = equipped.has(skill)
                return (
                  <motion.button
                    key={skill}
                    aria-pressed={on}
                    onClick={() => toggle(skill)}
                    initial={reduce ? false : { opacity: 0, y: -30, rotate: i % 2 ? 8 : -8 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, margin: '-8% 0px' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18, delay: i * 0.04 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ y: 5 }}
                    className={`relative rounded-xl border-[3px] border-ink px-4 pt-2 pb-3 text-sm font-bold transition-[box-shadow,background-color] duration-150 ${
                      on ? `${tintClass(group.tint)} translate-y-1 shadow-[0_2px_0_0_var(--color-ink)]` : 'bg-paper shadow-key'
                    }`}
                  >
                    {/* keycap top highlight */}
                    <span aria-hidden className="pointer-events-none absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/50" />
                    {skill}
                    {on && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -end-2 -top-2 grid size-5 place-items-center rounded-full border-2 border-ink bg-lime font-pixel text-[9px] text-ink"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
