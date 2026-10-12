import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { SideQuest } from '../data/cv'

const TOOLS = ['↖', '⬚', '✎', '🖌', 'A', '◯', '▭', '⌇', '🪣', '⌕']
const SWATCHES = ['#ff4fa3', '#9dcb5a', '#d9ccff', '#bfe3ff', '#f3e7a8', '#f6a9cb', '#2b3ff5', '#121212']

/**
 * A screen recording of the real app, playing inside an MS Paint window.
 * Plays while on screen, pauses when scrolled away. The colour swatches are
 * chapter buttons and the caption follows the chapter under the playhead.
 */
export function PaintPlayer({ video }: { video: SideQuest['video'] }) {
  const wrap = useRef<HTMLDivElement>(null)
  const el = useRef<HTMLVideoElement>(null)
  const inView = useInView(wrap, { amount: 0.4 })
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(1)
  const { chapters } = video
  const chapter = Math.max(0, chapters.findLastIndex((c) => c.t <= time + 0.05))

  useEffect(() => {
    const v = el.current
    if (!v) return
    v.playbackRate = video.rate ?? 1
    if (inView && !paused && !reduce) v.play().catch(() => {})
    else v.pause()
  }, [inView, paused, reduce, video.rate])

  const seek = (i: number) => {
    const v = el.current
    if (!v) return
    v.currentTime = chapters[i].t + 0.05
    setTime(v.currentTime)
  }

  const chapterEnd = (i: number) => (i + 1 < chapters.length ? chapters[i + 1].t : duration)

  return (
    <div ref={wrap} className="overflow-hidden rounded-xl bg-[#f6f3ee] shadow-lift ring-1 ring-ink/10">
      {/* title bar */}
      <div className="flex items-center gap-2 bg-butter px-3 py-2">
        <span className="size-3.5 rounded-sm bg-hot" aria-hidden />
        <span className="truncate font-mono text-xs">{video.file}.mp4 - Paint</span>
        <span className="ms-auto flex gap-1" aria-hidden>
          {['–', '□', '×'].map((g) => (
            <span key={g} className="grid size-5 place-items-center rounded bg-white/70 font-mono text-[10px]">
              {g}
            </span>
          ))}
        </span>
      </div>
      {/* menu */}
      <div className="flex gap-4 border-b border-ink/10 px-3 py-1.5 font-mono text-xs" aria-hidden>
        {['File', 'Edit', 'View', 'Image', 'Help'].map((m) => (
          <span key={m}>
            <u>{m[0]}</u>
            {m.slice(1)}
          </span>
        ))}
      </div>

      <div className="flex gap-2 p-2">
        <div className="hidden grid-cols-2 content-start gap-1 sm:grid" aria-hidden>
          {TOOLS.map((t, i) => (
            <span key={i} className={`grid size-7 place-items-center rounded text-xs ring-1 ring-ink/10 ${i === 2 ? 'bg-fur' : 'bg-white'}`}>
              {t}
            </span>
          ))}
        </div>

        {/* canvas */}
        <div className={`relative flex aspect-[16/10] flex-1 items-center justify-center overflow-hidden ring-1 ring-ink/10 ${video.phone ? 'bg-blush' : 'bg-white'}`}>
          <motion.video
            ref={el}
            src={video.src}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`Screen recording: ${chapters.map((c) => c.caption).join('. ')}`}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 1)}
            initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            className={video.phone ? 'h-[94%] w-auto rounded-[22px] shadow-soft ring-4 ring-ink' : 'h-full w-full object-contain'}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={chapter}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="absolute inset-x-0 bottom-3 mx-auto w-max max-w-[92%] rounded-full bg-ink/85 px-3 py-1 text-center text-xs font-medium text-white backdrop-blur sm:text-sm"
            >
              {chapters[chapter].caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* palette = chapter controls */}
      <div className="flex items-center gap-2 border-t border-ink/10 px-3 py-2">
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play video' : 'Pause video'}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs text-white"
        >
          {paused ? '▶' : 'II'}
        </button>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {chapters.map((c, i) => {
            const start = c.t
            const end = chapterEnd(i)
            const fill = time >= end ? 1 : time <= start ? 0 : (time - start) / (end - start)
            return (
              <button
                key={i}
                onClick={() => seek(i)}
                aria-label={`Chapter ${i + 1}: ${c.caption}`}
                title={c.caption}
                className={`relative h-6 w-9 overflow-hidden rounded ring-1 ring-ink/15 transition-transform ${i === chapter ? '-translate-y-0.5 scale-110' : ''}`}
                style={{ background: SWATCHES[i % SWATCHES.length] + '55' }}
              >
                <span className="absolute inset-y-0 start-0" style={{ width: `${fill * 100}%`, background: SWATCHES[i % SWATCHES.length] }} />
              </button>
            )
          })}
        </div>
        <span className="font-mono text-[11px] text-ink-soft tabular-nums">
          {chapter + 1}/{chapters.length}
        </span>
      </div>
    </div>
  )
}
