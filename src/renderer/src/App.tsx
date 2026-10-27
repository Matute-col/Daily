import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { todayKey } from '@shared/time'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { GearIcon } from '@/components/icons'
import { Modal } from '@/components/Modal'
import { RewardLayer } from '@/features/rewards/RewardLayer'
import { SettingsPanel } from '@/features/settings/SettingsPanel'
import { DayView } from '@/features/tasks/DayView'
import { useDaily } from '@/store/useDaily'

export default function App() {
  const { load, loaded, error, settings } = useDaily()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <AnimatedBackground animated={settings.animatedBackground} />
      <main className={`relative z-10 mx-auto flex h-screen max-w-3xl flex-col text-ice ${settings.compact ? 'gap-2 p-2' : 'gap-3 p-3'}`}>
        <header className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-wide text-cyan [text-shadow:0_0_10px_#05D9E8]">Daily</h1>
          <span className="text-xs text-ice/60 first-letter:uppercase">{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</span>
          <button className="icon-btn ml-auto" onClick={() => setShowSettings(true)} aria-label="Ajustes">
            <GearIcon />
          </button>
        </header>

        {error && (
          <p role="alert" className="rounded-lg border border-pink/60 bg-pink/10 px-2 py-1 text-sm text-pink">
            {error}
          </p>
        )}

        {loaded && (
          <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl p-3">
            <DayView date={todayKey()} empty="Sin tareas para hoy. Añade la primera arriba." />
          </div>
        )}
      </main>

      <Modal open={showSettings} title="Ajustes" onClose={() => setShowSettings(false)}>
        <SettingsPanel />
      </Modal>
      <RewardLayer />
    </>
  )
}
