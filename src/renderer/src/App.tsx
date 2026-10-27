import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { todayKey } from '@shared/time'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { GearIcon } from '@/components/icons'
import { Modal } from '@/components/Modal'
import { TomorrowView } from '@/features/planner/TomorrowView'
import { RewardLayer } from '@/features/rewards/RewardLayer'
import { SettingsPanel } from '@/features/settings/SettingsPanel'
import { SummaryView } from '@/features/summary/SummaryView'
import { DayView } from '@/features/tasks/DayView'
import { OverdueBanner } from '@/features/tasks/OverdueBanner'
import { WeekView } from '@/features/weekly/WeekView'
import { useDaily, type View } from '@/store/useDaily'

const TABS: { id: View; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'summary', label: 'Resumen' },
  { id: 'week', label: 'Semana' }
]

export default function App() {
  const { load, loaded, error, settings, view, setView } = useDaily()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    load()
    // Cambios hechos desde el proceso principal (bandeja, recordatorios).
    const offChanged = window.daily.onTasksChanged(() => load())
    const offFocus = window.daily.onFocusTask((id) => {
      setView('today')
      useDaily.getState().focusTask(id)
    })
    return () => {
      offChanged()
      offFocus()
    }
  }, [load, setView])

  return (
    <>
      <AnimatedBackground animated={settings.animatedBackground} />
      <main className={`relative z-10 mx-auto flex h-screen max-w-5xl flex-col text-ice ${settings.compact ? 'gap-2 p-2' : 'gap-3 p-3'}`}>
        <header className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-wide text-cyan [text-shadow:0_0_10px_#05D9E8]">Daily</h1>
          <span className="truncate text-xs text-ice/60 first-letter:uppercase">{format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</span>
          <button className="icon-btn ml-auto" onClick={() => setShowSettings(true)} aria-label="Ajustes">
            <GearIcon />
          </button>
        </header>

        <nav className="flex gap-1 rounded-xl bg-night/50 p-1" role="tablist" aria-label="Secciones">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={view === t.id}
              onClick={() => setView(t.id)}
              className={`flex-1 rounded-lg py-1 text-sm transition ${
                view === t.id ? 'bg-violet text-ice shadow-[0_0_12px_var(--color-violet)]' : 'text-ice/70 hover:bg-violet/20'
              } ${t.id === 'tomorrow' ? 'md:hidden' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {error && (
          <p role="alert" className="rounded-lg border border-pink/60 bg-pink/10 px-2 py-1 text-sm text-pink">
            {error}
          </p>
        )}

        {loaded && (
          <div className="glass flex min-h-0 flex-1 flex-col rounded-2xl p-3" role="tabpanel">
            {view === 'today' && (
              // En ventanas anchas se ven Hoy y Mañana lado a lado.
              <div className="flex min-h-0 flex-1 gap-4">
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  <OverdueBanner />
                  <DayView date={todayKey()} empty="Sin tareas para hoy. Añade la primera arriba." />
                </div>
                <div className="hidden min-h-0 flex-1 flex-col border-l border-violet/30 pl-4 md:flex">
                  <TomorrowView />
                </div>
              </div>
            )}
            {view === 'tomorrow' && <TomorrowView />}
            {view === 'summary' && <SummaryView />}
            {view === 'week' && <WeekView />}
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
