import { Chip, LevelHeader, Reveal, Section } from '../components/ui'
import { SIDE_QUESTS, type SideQuest } from '../data/cv'
import { MusicTrailer, RouterTrailer, TrakabooTrailer } from '../trailers/trailers'

const TRAILERS: Record<SideQuest['slug'], () => React.JSX.Element> = {
  music: MusicTrailer,
  trakaboo: TrakabooTrailer,
  router: RouterTrailer,
}

export function SideQuests() {
  return (
    <Section id="side" className="dot-bg">
      <LevelHeader
        short="LVL 5"
        title="Side Quests"
        blurb="Software I build when I spot a gap. Each one has a short trailer: hit play, or just watch it as you scroll past."
      />
      <div className="space-y-20 sm:space-y-28">
        {SIDE_QUESTS.map((q, i) => {
          const Trailer = TRAILERS[q.slug]
          const flip = i % 2 === 1
          return (
            <article key={q.slug} className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
              <Reveal className={flip ? 'lg:order-2' : ''} y={60}>
                <Trailer />
              </Reveal>
              <Reveal delay={0.1} className={flip ? 'lg:order-1' : ''}>
                <span className="font-pixel text-xs text-hot">SIDE QUEST {String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display text-4xl leading-none font-black">{q.title}</h3>
                <p className="mt-2 font-semibold text-ink-soft">{q.kicker}</p>
                <p className="mt-4 text-lg leading-relaxed">{q.body}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {q.stack.map((s) => (
                    <Chip key={s} tint="paper">
                      {s}
                    </Chip>
                  ))}
                </div>
                {q.link && (
                  <a
                    href={q.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block rounded-xl border-[3px] border-ink bg-lime px-4 py-2 font-pixel text-xs shadow-key active:translate-y-1 active:shadow-none"
                  >
                    {q.link.label} ↗
                  </a>
                )}
              </Reveal>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
