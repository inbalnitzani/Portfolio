import { motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from 'motion/react'
import { useRef, type ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

/** Fade + rise on scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 48,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Each word rises out of a mask. */
function MaskedWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <span className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '110%', rotate: 4 }}
            whileInView={{ y: '0%', rotate: 0 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
          >
            {w}
            {' '}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-ink px-3.5 py-1.5 font-pixel text-[11px] tracking-wide text-white ${className}`}>
      {children}
    </span>
  )
}

/** "LEVEL 02" chip + big display title with an italic serif accent word. */
export function LevelHeader({
  short,
  title,
  accent,
  note,
  dark,
}: {
  short: string
  title: string
  accent: string
  note?: string
  dark?: boolean
}) {
  return (
    <header className="relative mb-14 sm:mb-20">
      <Reveal y={16}>
        <Chip className={dark ? 'bg-hot' : ''}>{short.replace('LVL ', 'LEVEL 0')}</Chip>
      </Reveal>
      <h2 className={`display mt-5 text-[clamp(3.4rem,11vw,9.5rem)] ${dark ? 'text-white' : ''}`}>
        <MaskedWords text={title} />
        <MaskedWords text={accent} className={`accent text-[1.08em] ${dark ? '!text-fur' : ''}`} delay={0.12} />
      </h2>
      {note && (
        <Scribble className={`mt-4 sm:absolute sm:end-0 sm:bottom-6 sm:mt-0 ${dark ? 'text-white' : ''}`} delay={0.5}>
          {note}
        </Scribble>
      )}
    </header>
  )
}

/** Handwritten note that writes itself in. */
export function Scribble({
  children,
  className = '',
  rotate = -3,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  rotate?: number
  delay?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.p
      className={`font-hand text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-semibold ${className}`}
      style={{ rotate }}
      initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.p>
  )
}

/** Hand-drawn arrow that draws itself. `d` is an SVG path in a 120×80 box. */
export function ScribbleArrow({
  className = '',
  d = 'M6 10 C 40 0, 90 20, 108 62',
  head = 'M96 58 L108 62 L110 48',
}: {
  className?: string
  d?: string
  head?: string
}) {
  return (
    <svg viewBox="0 0 120 80" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path d={d} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeInOut' }} />
      <motion.path d={head} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.75 }} />
    </svg>
  )
}

/** iMessage-style bubble. */
export function Bubble({ children, className = '', delay = 0, tone = 'blue' }: { children: ReactNode; className?: string; delay?: number; tone?: 'blue' | 'white' }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={`inline-block w-max rounded-[22px] px-4 py-2 text-[15px] font-medium shadow-soft sm:text-base ${
        tone === 'blue' ? 'bg-imsg text-white' : 'bg-white text-ink'
      } ${className}`}
      initial={reduce ? false : { opacity: 0, scale: 0.4, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 420, damping: 22, delay }}
    >
      {children}
    </motion.span>
  )
}

/** A 3D prop image that floats and drifts on scroll at its own depth. */
export function Prop({
  src,
  className = '',
  depth = 1,
  rotate = 0,
  float = true,
  alt = '',
}: {
  src: string
  className?: string
  depth?: number
  rotate?: number
  float?: boolean
  alt?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [120 * depth, -120 * depth])
  const r = useTransform(scrollYProgress, [0, 1], [rotate - 10 * depth, rotate + 10 * depth])
  return (
    <motion.div ref={ref} aria-hidden={!alt} className={`pointer-events-none absolute select-none ${className}`} style={reduce ? { rotate } : { y, rotate: r }}>
      <img src={src} alt={alt} draggable={false} className={`h-auto w-full ${float ? 'motion-safe:animate-float' : ''}`} style={{ animationDelay: `${depth * -1.7}s` }} />
    </motion.div>
  )
}

/** Soft desktop window (no ink borders): title bar with traffic lights. */
export function Window({
  title,
  children,
  className = '',
  bar = 'bg-white',
}: {
  title: string
  children: ReactNode
  className?: string
  bar?: string
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink/5 ${className}`}>
      <div className={`flex items-center gap-2 border-b border-ink/5 px-4 py-2.5 ${bar}`}>
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-3 rounded-full bg-[#ff6159]" />
          <i className="size-3 rounded-full bg-[#ffbd2e]" />
          <i className="size-3 rounded-full bg-[#28c941]" />
        </span>
        <span className="ms-2 truncate font-mono text-xs text-ink-soft">{title}</span>
      </div>
      {children}
    </div>
  )
}

export function Section({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-level={id} className={`relative scroll-mt-16 px-4 py-28 sm:px-8 sm:py-40 ${className}`}>
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </section>
  )
}
