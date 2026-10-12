import { motion, useReducedMotion } from 'motion/react'
import { PixelSprite } from '../components/PixelSprite'
import { Chip, LevelHeader, Reveal, Section, Sparkle, Window } from '../components/ui'
import { PROFILE, SAVE_POINTS } from '../data/cv'

export function Profile() {
  const reduce = useReducedMotion()
  return (
    <Section id="profile" className="dot-bg">
      <LevelHeader short="LVL 1" title="Player Profile" blurb="Choose your engineer. (There's only one, and she's great.)" />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <Window title="player_01.sav" tint="hot" bodyClassName="p-0">
            <div className="holo relative flex flex-col items-center gap-4 px-6 pt-10 pb-6">
              <Sparkle className="absolute top-6 start-6 size-8 motion-safe:animate-spin-slow" fill="#c6ff3d" />
              <Sparkle className="absolute end-8 top-16 size-5" fill="#fff" />
              <div className="relative">
                <div className="absolute inset-x-[-30%] bottom-0 h-6 rounded-[50%] bg-ink/15 blur-sm" />
                <PixelSprite size={9} className="relative" />
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-black uppercase">{PROFILE.name}</p>
                <p className="mt-1 font-pixel text-xs text-ink-soft">📍 {PROFILE.location}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 border-t-[3px] border-ink text-sm">
              <div className="border-e-[3px] border-ink p-4">
                <dt className="font-pixel text-[10px] text-ink-soft">CLASS</dt>
                <dd className="font-semibold">{PROFILE.classes[0]}</dd>
              </div>
              <div className="p-4">
                <dt className="font-pixel text-[10px] text-ink-soft">SUBCLASS</dt>
                <dd className="font-semibold">{PROFILE.classes[1]}</dd>
              </div>
            </dl>
          </Window>
        </Reveal>

        <div className="flex flex-col gap-8">
          <Reveal delay={0.1}>
            <div className="relative rounded-3xl rounded-ss-none border-[3px] border-ink bg-paper p-6 text-lg leading-relaxed shadow-sticker-lg">
              <span className="absolute -top-4 start-6 rounded-full border-2 border-ink bg-lime px-2 font-pixel text-[10px]">
                BIO.TXT
              </span>
              {PROFILE.bio}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <Window title="stats.exe" tint="lilac" bodyClassName="space-y-3 p-5">
              {PROFILE.stats.map((s, i) => (
                <div key={s.label} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
                  <span className="font-pixel text-[11px]">{s.label}</span>
                  <div className="h-5 overflow-hidden rounded-md border-2 border-ink bg-blush">
                    <motion.div
                      className="h-full bg-[repeating-linear-gradient(90deg,var(--color-hot)_0_8px,var(--color-bubble)_8px_10px)]"
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${s.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-end font-pixel text-xs tabular-nums">{s.value === 100 ? 'MAX' : s.value}</span>
                </div>
              ))}
            </Window>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            {PROFILE.traits.map((t, i) => (
              <Reveal key={t} delay={0.2 + i * 0.07} y={20}>
                <motion.div
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  style={{ rotate: (i % 2 ? 2 : -2) }}
                  className="rounded-xl border-[3px] border-ink bg-paper px-3 py-2 text-sm font-semibold shadow-sticker"
                >
                  <span className="me-1.5 font-pixel text-[10px] text-hot">PERK</span>
                  {t}
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Education as save points */}
      <div className="mt-16">
        <Reveal>
          <h3 className="mb-6 font-pixel text-sm">✦ SAVE POINTS</h3>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {SAVE_POINTS.map((s, i) => (
            <Reveal key={s.school} delay={i * 0.1}>
              <div className="flex items-center gap-4 rounded-2xl border-[3px] border-ink bg-paper p-5 shadow-sticker">
                <div
                  className={`grid size-14 shrink-0 place-items-center rounded-xl border-[3px] border-ink font-pixel text-lg ${
                    s.status === 'complete' ? 'bg-lime' : 'bg-hot text-white'
                  }`}
                >
                  {s.status === 'complete' ? '✓' : <span className="motion-safe:animate-blink">…</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight font-bold">{s.degree}</p>
                  <p className="text-sm text-ink-soft">{s.school}</p>
                </div>
                <Chip tint={s.status === 'complete' ? 'paper' : 'bubble'} className="ms-auto shrink-0 font-pixel !text-[10px]">
                  {s.when}
                </Chip>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
