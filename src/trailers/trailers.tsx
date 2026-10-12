import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { CountUp, TrailerPlayer, Typewriter, type Scene } from './TrailerPlayer'

// Shared pop-in for scene elements
const pop = (delay = 0) => ({
  initial: { opacity: 0, y: 18, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring' as const, stiffness: 320, damping: 22, delay },
})

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border-[3px] border-ink bg-paper shadow-sticker ${className}`}>{children}</div>
}

/* ───────────────────────── Yair Nitzani Music ───────────────────────── */

const MUSIC_SCENES: Scene[] = [
  { caption: 'A client is looking for the perfect song', ms: 2600 },
  { caption: 'Search ~1,000 songs by title, writer or keyword', ms: 2600 },
  { caption: 'Get an instant licensing quote', ms: 3000 },
  { caption: 'Or let a Claude Skill shortlist songs from the brief', ms: 3200 },
]

const SONGS = [
  { t: 'Golden Hour Drive', w: 'Y. Nitzani', tags: ['upbeat', 'summer'] },
  { t: 'Salt & Sunlight', w: 'Y. Nitzani', tags: ['acoustic', 'warm'] },
  { t: 'Weekend Neon', w: 'Y. Nitzani', tags: ['pop', 'ad-ready'] },
]

function MusicScene({ scene }: { scene: number }) {
  if (scene === 0)
    return (
      <Card className="w-full max-w-md p-4">
        <p className="mb-2 font-pixel text-[10px] text-ink-soft">SEARCH CATALOG</p>
        <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-blush px-3 py-2.5">
          <span aria-hidden>⌕</span>
          <Typewriter text="upbeat summer ad" className="font-semibold" />
        </div>
      </Card>
    )
  if (scene === 1)
    return (
      <Card className="w-full max-w-md divide-y-2 divide-ink/10 overflow-hidden">
        {SONGS.map((s, i) => (
          <motion.div key={s.t} {...pop(i * 0.15)} className="flex items-center gap-3 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-hot text-white">♪</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{s.t}</p>
              <p className="text-xs text-ink-soft">{s.w}</p>
            </div>
            <div className="hidden gap-1 sm:flex">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full border-2 border-ink bg-lilac px-2 text-[10px] font-bold">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </Card>
    )
  if (scene === 2)
    return (
      <Card className="w-full max-w-md p-4">
        <p className="mb-3 font-pixel text-[10px] text-ink-soft">LICENSING CALCULATOR</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['Production', 'TV commercial'],
            ['Media', 'TV + online'],
            ['Territory', 'Worldwide'],
            ['Term', '1 year'],
          ].map(([k, v], i) => (
            <motion.div key={k} {...pop(i * 0.12)} className="rounded-lg border-2 border-ink bg-blush px-2 py-1.5">
              <span className="block text-[10px] text-ink-soft">{k}</span>
              <span className="font-bold">{v}</span>
            </motion.div>
          ))}
        </div>
        <motion.div {...pop(0.6)} className="mt-3 flex items-center justify-between rounded-xl border-2 border-ink bg-lime px-3 py-2">
          <span className="font-pixel text-[10px]">QUOTE (DEMO)</span>
          <CountUp to={4800} ms={1100} className="font-display text-xl font-black" />
        </motion.div>
        <motion.p {...pop(1.6)} className="mt-2 text-end text-[11px] font-semibold text-ink-soft">
          ✓ logged for follow-up
        </motion.p>
      </Card>
    )
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <motion.div {...pop()} className="max-w-[80%] self-start rounded-2xl rounded-es-none border-[3px] border-ink bg-paper px-3 py-2 text-sm shadow-sticker">
        “Hopeful, sunny track for a travel brand. Lyrics about the open road.”
      </motion.div>
      <motion.div {...pop(0.5)} className="self-end rounded-2xl rounded-ee-none border-[3px] border-ink bg-ink px-3 py-2 text-sm text-white shadow-sticker">
        <p className="mb-1 font-pixel text-[10px] text-lime">CLAUDE SKILL · SHORTLIST</p>
        {SONGS.slice(0, 2).map((s, i) => (
          <motion.p key={s.t} {...pop(0.9 + i * 0.25)}>
            ♪ {s.t} <span className="text-lime">· lyrical fit ✓</span>
          </motion.p>
        ))}
      </motion.div>
    </div>
  )
}

export function MusicTrailer() {
  return <TrailerPlayer title="nitzani_music" scenes={MUSIC_SCENES} render={(s) => <MusicScene scene={s} />} />
}

/* ───────────────────────── Trakaboo ───────────────────────── */

const TRAK_SCENES: Scene[] = [
  { caption: 'Tap Apple Pay at the café…', ms: 2400 },
  { caption: '…and it lands in Trakaboo automatically', ms: 2600 },
  { caption: 'Import card statements, merge duplicates', ms: 2800 },
  { caption: 'Peek at where your money went 👀', ms: 3000 },
]

const ROWS = [
  { m: 'Coffee Lab', c: 'Food', a: 18, tint: 'bg-bubble' },
  { m: 'Super Yuda', c: 'Groceries', a: 236, tint: 'bg-lime' },
  { m: 'Rav-Kav', c: 'Transport', a: 50, tint: 'bg-sky' },
]

const CATS = [
  { c: 'Groceries', pct: 34, tint: 'bg-lime' },
  { c: 'Food', pct: 22, tint: 'bg-bubble' },
  { c: 'Bills', pct: 20, tint: 'bg-lilac' },
  { c: 'Fun', pct: 14, tint: 'bg-hot' },
  { c: 'Transport', pct: 10, tint: 'bg-sky' },
]

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full max-h-[320px] w-[210px] rounded-[30px] border-[3px] border-ink bg-paper p-3 pt-6 shadow-sticker">
      <span className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-ink" />
      <p className="mb-2 font-display text-sm font-black text-hot">Trakaboo 👀</p>
      {children}
    </div>
  )
}

function TrakabooScene({ scene }: { scene: number }) {
  if (scene === 0)
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 }}
          className="flex w-64 items-center gap-3 rounded-2xl border-[3px] border-ink bg-paper/95 p-3 shadow-sticker"
        >
          <span className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-ink text-xs font-bold text-white">Pay</span>
          <div className="text-sm">
            <p className="font-bold">Coffee Lab</p>
            <p className="text-ink-soft">₪18.00 · Visa ••12</p>
          </div>
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid size-16 place-items-center rounded-full border-[3px] border-ink bg-lime font-pixel text-lg shadow-sticker"
        >
          ))
        </motion.div>
      </div>
    )
  if (scene === 1)
    return (
      <Phone>
        <div className="space-y-1.5">
          {ROWS.map((r, i) => (
            <motion.div
              key={r.m}
              {...pop(i === 0 ? 0.35 : 0)}
              className={`flex items-center gap-2 rounded-xl border-2 border-ink p-1.5 text-[11px] ${i === 0 ? 'bg-blush' : 'bg-paper'}`}
            >
              <span className={`size-5 rounded-md border-2 border-ink ${r.tint}`} />
              <span className="flex-1">
                <span className="block font-bold">{r.m}</span>
                <span className="text-ink-soft">{r.c}</span>
              </span>
              <span className="font-bold">₪{r.a}</span>
            </motion.div>
          ))}
        </div>
        <motion.p {...pop(0.8)} className="mt-2 text-center font-pixel text-[9px] text-hot">
          + NEW FROM APPLE PAY
        </motion.p>
      </Phone>
    )
  if (scene === 2)
    return (
      <Card className="w-72 p-4">
        <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-ink bg-blush p-3 text-sm font-semibold">
          📄 cal-statement.xlsx
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-blush">
          <motion.div className="h-full bg-hot" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.3 }} />
        </div>
        <motion.div {...pop(1.4)} className="mt-3 flex items-center justify-between text-sm">
          <span>
            <b>42</b> imported
          </span>
          <span className="rounded-full border-2 border-ink bg-lime px-2 text-xs font-bold">3 duplicates merged</span>
        </motion.div>
      </Card>
    )
  return (
    <Phone>
      <p className="text-[10px] text-ink-soft">This month</p>
      <p className="font-display text-2xl font-black">
        ₪<CountUp to={4210} />
      </p>
      <div className="mt-2 flex h-4 overflow-hidden rounded-full border-2 border-ink">
        {CATS.map((c, i) => (
          <motion.div
            key={c.c}
            className={`h-full ${c.tint} ${i ? 'border-s-2 border-ink' : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${c.pct}%` }}
            transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 120, damping: 18 }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {CATS.slice(0, 4).map((c, i) => (
          <motion.div key={c.c} {...pop(0.8 + i * 0.08)} className="flex items-center gap-1 rounded-lg border-2 border-ink p-1 text-[10px]">
            <span className={`size-2.5 rounded-full border border-ink ${c.tint}`} />
            {c.c} <b className="ms-auto">{c.pct}%</b>
          </motion.div>
        ))}
      </div>
    </Phone>
  )
}

export function TrakabooTrailer() {
  return <TrailerPlayer title="trakaboo" scenes={TRAK_SCENES} render={(s) => <TrakabooScene scene={s} />} />
}

/* ───────────────────────── Claude Skills Router ───────────────────────── */

const ROUTER_SCENES: Scene[] = [
  { caption: 'Events stream in from the tools the team uses', ms: 2600 },
  { caption: 'The router matches each event to a Claude Skill', ms: 2600 },
  { caption: 'Claude does the triage and review work', ms: 3000 },
]

const SOURCES = ['GitHub', 'Slack', 'Jira']
const SKILLS = ['triage', 'review', 'summarize']

function RouterScene({ scene }: { scene: number }) {
  return (
    <div className="grid w-full max-w-lg grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
      <div className="space-y-2">
        {SOURCES.map((s, i) => (
          <motion.div key={s} {...pop(i * 0.1)} className="rounded-xl border-[3px] border-ink bg-paper px-2 py-1.5 text-center text-xs font-bold shadow-sticker">
            {s}
          </motion.div>
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {scene === 0 &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute top-1/2 size-3 rounded-full border-2 border-ink bg-lime"
              initial={{ x: -90, y: (i - 1) * 40, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1, delay: 0.3 + i * 0.35, repeat: Infinity, repeatDelay: 0.4 }}
            />
          ))}
        <motion.div
          animate={scene === 1 ? { rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.6, repeat: scene === 1 ? Infinity : 0, repeatDelay: 0.5 }}
          className="grid size-20 place-items-center rounded-2xl border-[3px] border-ink bg-hot text-center font-pixel text-[10px] leading-tight text-white shadow-sticker"
        >
          WEBHOOK
          <br />
          ROUTER
        </motion.div>
      </div>

      <div className="space-y-2">
        {SKILLS.map((s, i) => (
          <motion.div
            key={s}
            {...pop(scene >= 1 ? 0.3 + i * 0.15 : 0)}
            className={`rounded-xl border-[3px] border-ink px-2 py-1.5 text-center text-xs font-bold shadow-sticker ${
              scene >= 1 && i < 2 ? 'bg-lime' : 'bg-lilac'
            }`}
          >
            /{s}
          </motion.div>
        ))}
      </div>

      {scene === 2 && (
        <motion.div {...pop(0.2)} className="col-span-3 rounded-2xl border-[3px] border-ink bg-ink p-3 text-xs text-white shadow-sticker">
          <p className="font-pixel text-[10px] text-lime">CLAUDE · OUTPUT</p>
          <motion.p {...pop(0.5)}>✓ Ticket triaged: priority + owner suggested</motion.p>
          <motion.p {...pop(0.9)}>✓ PR reviewed: 2 comments posted</motion.p>
        </motion.div>
      )}
    </div>
  )
}

export function RouterTrailer() {
  return <TrailerPlayer title="skills_router" scenes={ROUTER_SCENES} render={(s) => <RouterScene scene={s} />} />
}
