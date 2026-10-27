import { useEffect } from 'react'
import { todayKey } from '@shared/time'
import { DayView } from '@/features/tasks/DayView'
import { useDaily } from '@/store/useDaily'

export default function App() {
  const { load, loaded, error } = useDaily()

  useEffect(() => {
    load()
  }, [load])

  return (
    <main className="relative flex h-screen flex-col gap-3 p-3 text-ice">
      <h1 className="text-xl font-bold text-cyan">Daily</h1>
      {error && (
        <p role="alert" className="rounded-lg border border-pink/60 bg-pink/10 px-2 py-1 text-sm text-pink">
          {error}
        </p>
      )}
      {loaded && <DayView date={todayKey()} empty="Sin tareas para hoy. Añade la primera arriba." />}
    </main>
  )
}
