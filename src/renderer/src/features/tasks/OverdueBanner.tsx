import { todayKey } from '@shared/time'
import { useDaily } from '@/store/useDaily'

/** Aviso de pendientes de días anteriores con opción de traerlos a hoy. */
export function OverdueBanner() {
  const tasks = useDaily((s) => s.tasks)
  const updateTask = useDaily((s) => s.updateTask)
  const today = todayKey()
  const overdue = tasks.filter((t) => t.date < today && t.status !== 'done')
  if (!overdue.length) return null

  return (
    <div className="flex items-center gap-2 rounded-xl border border-pink/50 bg-pink/10 px-2 py-1.5 text-sm" role="status">
      <span className="flex-1">
        📌 Tienes {overdue.length} {overdue.length === 1 ? 'tarea pendiente' : 'tareas pendientes'} de días anteriores
      </span>
      <button
        className="chip border-pink text-pink"
        onClick={async () => {
          for (const t of overdue) await updateTask(t.id, { date: today })
        }}
      >
        Pasar a hoy
      </button>
    </div>
  )
}
