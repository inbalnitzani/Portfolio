import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { LEVELS, type LevelId } from '../data/cv'

export type Toast = { id: number; title: string; body: string }

type GameState = {
  current: LevelId
  visited: Set<LevelId>
  toasts: Toast[]
  notify: (title: string, body: string) => void
  dismiss: (id: number) => void
}

const GameContext = createContext<GameState | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<LevelId>('start')
  const [visited, setVisited] = useState<Set<LevelId>>(() => new Set(['start']))
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const notify = useCallback(
    (title: string, body: string) => {
      const id = ++nextId.current
      setToasts((t) => [...t.slice(-2), { id, title, body }])
      window.setTimeout(() => dismiss(id), 3400)
    },
    [dismiss],
  )

  // Track which level is in the middle of the viewport
  useEffect(() => {
    const els = LEVELS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(e.target.id as LevelId)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // First visit to a level → achievement toast
  useEffect(() => {
    if (visited.has(current)) return
    setVisited((v) => new Set(v).add(current))
    const level = LEVELS.find((l) => l.id === current)!
    notify('Achievement unlocked', `Reached ${level.short}: ${level.title}  +100 XP`)
  }, [current, visited, notify])

  return (
    <GameContext.Provider value={{ current, visited, toasts, notify, dismiss }}>{children}</GameContext.Provider>
  )
}
