import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

const TINTS = {
  hot: 'bg-hot text-white',
  bubble: 'bg-bubble text-ink',
  lilac: 'bg-lilac text-ink',
  lime: 'bg-lime text-ink',
  sky: 'bg-sky text-ink',
  paper: 'bg-paper text-ink',
} as const
export type Tint = keyof typeof TINTS
export const tintClass = (t: Tint) => TINTS[t]

/** Y2K OS window: title bar with traffic buttons, sticker shadow. */
export function Window({
  title,
  children,
  className = '',
  bodyClassName = '',
  tint = 'bubble',
  icon,
}: {
  title: string
  children: ReactNode
  className?: string
  bodyClassName?: string
  tint?: Tint
  icon?: ReactNode
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border-[3px] border-ink bg-paper shadow-sticker-lg ${className}`}>
      <div className={`flex items-center gap-2 border-b-[3px] border-ink px-3 py-2 ${tintClass(tint)}`}>
        {icon}
        <span className="truncate font-pixel text-xs tracking-wide sm:text-sm">{title}</span>
        <span className="ms-auto flex gap-1.5" aria-hidden>
          {['_', '□', '×'].map((g) => (
            <span
              key={g}
              className="grid size-5 place-items-center rounded-md border-2 border-ink bg-paper font-pixel text-[10px] leading-none text-ink"
            >
              {g}
            </span>
          ))}
        </span>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}

export function Chip({ children, tint = 'paper', className = '' }: { children: ReactNode; tint?: Tint; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-semibold ${tintClass(tint)} ${className}`}
    >
      {children}
    </span>
  )
}

export function Sparkle({ className = '', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill={fill}
        stroke="#2a0a1f"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M12 1.5l2.4 7.1L21.5 12l-7.1 2.4L12 22.5l-2.4-8.1L2.5 12l7.1-3.4z"
      />
    </svg>
  )
}

export function Heart({ className = '', fill = '#ff3ea5' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 10 9" className={className} shapeRendering="crispEdges" aria-hidden>
      <path fill="#2a0a1f" d="M1 0h3v1h2V0h3v1h1v4H9v1H8v1H7v1H6v1H4V8H3V7H2V6H1V5H0V1h1z" />
      <path fill={fill} d="M1 1h3v1h2V1h3v4H8v1H7v1H6v1H4V7H3V6H2V5H1z" />
      <path fill="#fff" d="M2 2h1v1H2z" />
    </svg>
  )
}

export function Trophy({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} shapeRendering="crispEdges" aria-hidden>
      <path fill="#2a0a1f" d="M2 0h8v1h2v4h-1v1h-1v1H8v1H7v2h2v2H3v-2h2V8H4V7H2V6H1V5H0V1h2z" />
      <path fill="#fff36b" d="M3 1h6v4H8v1H7v1H5V6H4V5H3z" />
      <path fill="#fff36b" d="M1 2h1v2H1zM10 2h1v2h-1z" />
      <path fill="#fff" d="M4 2h1v2H4z" />
      <path fill="#ff3ea5" d="M4 10h4v1H4z" />
    </svg>
  )
}

/** Fade + rise on scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ type: 'spring', stiffness: 160, damping: 20, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** "LEVEL 02 — SKILL TREE" banner that slams in. */
export function LevelHeader({ short, title, blurb, dark }: { short: string; title: string; blurb?: string; dark?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <header className="relative mb-12 sm:mb-16">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 1.6, rotate: -6 }}
        whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="mb-4 inline-block rounded-xl border-[3px] border-ink bg-lime px-3 py-1 font-pixel text-sm shadow-sticker"
      >
        {short}
      </motion.div>
      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.08 }}
        className="chrome-text font-display text-[clamp(2.6rem,9vw,7rem)] leading-[0.95] font-black tracking-tight uppercase"
      >
        {title}
      </motion.h2>
      {blurb && (
        <Reveal delay={0.18} y={20}>
          <p className={`mt-4 max-w-xl text-lg ${dark ? 'text-blush/75' : 'text-ink-soft'}`}>{blurb}</p>
        </Reveal>
      )}
    </header>
  )
}

export function Section({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-level={id} className={`relative scroll-mt-20 px-4 py-24 sm:px-8 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  )
}
