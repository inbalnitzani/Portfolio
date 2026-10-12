import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { LevelHeader, Section } from '../components/ui'
import { LEVELS, SKILL_TREE, type SkillGroup } from '../data/cv'
import { useGame } from '../game/GameProvider'

const L = LEVELS[2]

// Keycap colourways: skirt (sides) + top face gradient
const CAPS: Record<SkillGroup['tint'], { skirt: string; top: string; text: string }> = {
  lime: { skirt: '#7ba83c', top: 'linear-gradient(180deg,#c4e58a,#a6d364)', text: '#1d2a0c' },
  hot: { skirt: '#e58bb4', top: 'linear-gradient(180deg,#ffd3e6,#f7b2d0)', text: '#3b0d22' },
  lilac: { skirt: '#b9a6f2', top: 'linear-gradient(180deg,#efe9ff,#dccfff)', text: '#22174a' },
  sky: { skirt: '#8fc3e8', top: 'linear-gradient(180deg,#e2f3ff,#c4e6ff)', text: '#0d2a40' },
  bubble: { skirt: '#d9d0c2', top: 'linear-gradient(180deg,#ffffff,#f1ece3)', text: '#121212' },
}

function Keycap({ label, tint, on, onPress, index }: { label: string; tint: SkillGroup['tint']; on: boolean; onPress: () => void; index: number }) {
  const reduce = useReducedMotion()
  const c = CAPS[tint]
  return (
    <motion.button
      aria-pressed={on}
      onClick={onPress}
      initial={reduce ? false : { opacity: 0, y: -40, rotate: index % 2 ? 6 : -6 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ type: 'spring', stiffness: 380, damping: 20, delay: index * 0.035 }}
      className="group relative rounded-[14px] pb-2 text-start"
      style={{ background: c.skirt, boxShadow: on ? '0 4px 10px -4px rgb(58 42 32 / .35)' : '0 14px 22px -10px rgb(58 42 32 / .45)' }}
    >
      <span
        className="relative block rounded-[11px] px-4 py-3 text-[15px] font-semibold transition-transform duration-100 ease-out group-hover:-translate-y-0.5 group-active:translate-y-1.5"
        style={{
          background: c.top,
          color: c.text,
          transform: on ? 'translateY(6px)' : undefined,
          boxShadow: 'inset 0 1.5px 0 rgb(255 255 255 / .7), inset 0 -2px 4px rgb(0 0 0 / .06)',
        }}
      >
        {label}
        {on && <span className="absolute -end-1.5 -top-1.5 size-3 rounded-full bg-hot ring-2 ring-white" />}
      </span>
    </motion.button>
  )
}

export function SkillTree() {
  const { notify } = useGame()
  const [equipped, setEquipped] = useState<Set<string>>(new Set())
  const total = SKILL_TREE.reduce((n, g) => n + g.items.length, 0)

  const toggle = (skill: string) => {
    const next = new Set(equipped)
    if (next.has(skill)) next.delete(skill)
    else next.add(skill)
    setEquipped(next)
    if (next.size === total) notify('Completionist!', 'Every skill equipped. Hire her already ♡')
  }

  return (
    <Section id="skills" className="bg-paper-2">
      <LevelHeader short={L.short} title={L.title} accent={L.accent} note="press a key to equip it ↓" />

      <div className="mb-10 flex items-center gap-4">
        <span className="rounded-full bg-white px-4 py-2 font-pixel text-[11px] tabular-nums shadow-soft">
          LOADOUT {equipped.size}/{total}
        </span>
        {equipped.size > 0 && (
          <button onClick={() => setEquipped(new Set())} className="text-sm text-ink-soft underline underline-offset-4">
            reset
          </button>
        )}
      </div>

      <div className="space-y-12">
        {SKILL_TREE.map((group) => (
          <div key={group.name} className="grid gap-4 md:grid-cols-[12rem_1fr] md:gap-8">
            <h3 className="font-serif text-3xl italic md:pt-2">{group.name}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-4">
              {group.items.map((skill, i) => (
                <Keycap key={skill} label={skill} tint={group.tint} index={i} on={equipped.has(skill)} onPress={() => toggle(skill)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
