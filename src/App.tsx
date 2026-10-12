import { useEffect, useState } from 'react'
import { Companion } from './components/Character'
import { FurCursor } from './components/FurCursor'
import { HUD, Toasts } from './components/HUD'
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
  const [modal, setModal] = useState(false)
  useEffect(() => startSmoothScroll(), [])

  return (
    <GameProvider>
      <HUD />
      <main>
        <StartScreen />
        <Profile />
        <SkillTree />
        <QuestLog />
        <Games onModal={setModal} />
        <SideQuests />
        <Boss />
      </main>
      <Companion hidden={modal} />
      <Toasts />
      <FurCursor />
    </GameProvider>
  )
}
