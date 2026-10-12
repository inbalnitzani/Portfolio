import { useEffect } from 'react'
import { HUD, Toasts } from './components/HUD'
import { SparkleTrail } from './components/SparkleTrail'
import { GameProvider } from './game/GameProvider'
import { startSmoothScroll } from './game/scroll'
import { Boss } from './sections/Boss'
import { Games } from './sections/Games'
import { Profile } from './sections/Profile'
import { QuestLog } from './sections/QuestLog'
import { SideQuests } from './sections/SideQuests'
import { SkillTree } from './sections/SkillTree'
import { StartScreen } from './sections/StartScreen'

export default function App() {
  useEffect(() => startSmoothScroll(), [])

  return (
    <GameProvider>
      {/* Shared chrome gradient for SVG decorations */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.3" stopColor="#ffb8e3" />
            <stop offset="0.55" stopColor="#ff3ea5" />
            <stop offset="0.8" stopColor="#c9b6ff" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      <HUD />
      <main>
        <StartScreen />
        <Profile />
        <SkillTree />
        <QuestLog />
        <Games />
        <SideQuests />
        <Boss />
      </main>
      <Toasts />
      <SparkleTrail />
    </GameProvider>
  )
}
