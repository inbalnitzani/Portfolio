import { motion, useReducedMotion } from 'motion/react'
import { Bubble, LevelHeader, Prop, Reveal, Scribble, ScribbleArrow, Section } from '../components/ui'
import { LEVELS, PROFILE, RECEIPT } from '../data/cv'
import { asset } from '../lib/asset'

const L = LEVELS.find((l) => l.id === 'profile')!

export function Profile() {
  const reduce = useReducedMotion()
  return (
    <Section id="profile" className="grain">
      <LevelHeader short={L.short} title={L.title} accent={L.accent} />
      <Prop src={asset('/props/disco-folder.png')} depth={1.2} rotate={-8} className="end-[-2%] -top-8 hidden w-36 lg:block" />

      <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_0.85fr_1fr] lg:gap-10">
        {/* Polaroid */}
        <motion.figure
          initial={reduce ? false : { opacity: 0, y: 80, rotate: -16 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          whileHover={{ rotate: -1, scale: 1.02 }}
          className="relative mx-auto w-[min(320px,80vw)] bg-white p-4 pb-16 shadow-lift"
        >
          <div className="tape absolute -top-4 start-1/2 h-8 w-28 -translate-x-1/2 rotate-[5deg]" />
          <div className="aspect-[4/5] overflow-hidden bg-blush">
            <img src={asset('/me/portrait.png')} alt={`Portrait of ${PROFILE.name}`} className="h-[118%] w-full object-cover object-top" loading="lazy" />
          </div>
          <figcaption className="absolute inset-x-0 bottom-4 text-center font-hand text-2xl font-semibold">me, probably debugging</figcaption>
        </motion.figure>

        {/* Receipt that prints as it scrolls in */}
        <motion.div
          initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)', y: -30 }}
          whileInView={{ clipPath: 'inset(0 0 0% 0)', y: 0 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="receipt-edge relative mx-auto w-[min(360px,88vw)] bg-white px-6 pt-8 pb-12 font-mono text-[13px] shadow-soft"
        >
          <p className="text-center text-base font-semibold">INBAL.EXE STORE</p>
          <p className="text-center text-ink-soft">receipt #2026 · {PROFILE.location.split(',')[0].toLowerCase()}</p>
          <div className="my-5 border-t border-dashed border-ink/40" />
          <ul className="space-y-2.5">
            {RECEIPT.map(([item, tag], i) => (
              <motion.li
                key={item}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.14, duration: 0.01 }}
                className="flex justify-between gap-4"
              >
                <span>{item}</span>
                <span className="shrink-0">{tag}</span>
              </motion.li>
            ))}
          </ul>
          <div className="my-5 border-t border-dashed border-ink/40" />
          <p className="flex justify-between text-sm font-semibold">
            <span>TOTAL</span>
            <span>1 full-stack engineer</span>
          </p>
          <p className="mt-6 text-center text-ink-soft">thank you for playing ♡</p>
          {/* barcode */}
          <div className="mx-auto mt-4 h-10 w-48 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_2px,transparent_2px_4px,var(--color-ink)_4px_5px,transparent_5px_8px)] opacity-80" />
        </motion.div>

        {/* Bio + notes */}
        <div className="relative">
          <Reveal>
            <p className="text-[clamp(1.25rem,1.8vw,1.5rem)] leading-relaxed">{PROFILE.bio}</p>
          </Reveal>
          <div className="relative mt-10 ps-2">
            <Scribble className="text-hot" delay={0.3}>
              sole-owner energy!!
            </Scribble>
            <ScribbleArrow className="mt-1 ms-24 w-24 text-hot" />
          </div>
          <div className="mt-6 flex flex-col items-start gap-2">
            <Bubble delay={0.2} tone="white">
              based in {PROFILE.location.split(',')[0]} 📍
            </Bubble>
            <Bubble delay={0.4}>ex-Maglan · sailing volunteer</Bubble>
          </div>
          <ul className="mt-10 grid gap-3">
            {PROFILE.traits.map((t, i) => (
              <Reveal key={t} delay={i * 0.06} y={20}>
                <li className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-[15px] shadow-soft ring-1 ring-ink/5">
                  <img src={asset('/props/chrome-star.png')} alt="" className="size-6 shrink-0" />
                  {t}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
