import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseDayKey, todayKey, tomorrowKey } from '@shared/time'
import { DayView } from '@/features/tasks/DayView'
import { useDaily } from '@/store/useDaily'

/** Planificación del día siguiente; aparece también en el resumen diario. */
export function TomorrowView() {
  const tasks = useDaily((s) => s.tasks)
  const updateTask = useDaily((s) => s.updateTask)
  const tomorrow = tomorrowKey()
  const leftovers = tasks.filter((t) => t.date === todayKey() && t.status === 'pending')

  return (
    <DayView
      date={tomorrow}
      empty="Planifica aquí lo que harás mañana."
      header={
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-pink first-letter:uppercase">
            {format(parseDayKey(tomorrow), "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          {leftovers.length > 0 && (
            <button
              className="chip ml-auto"
              onClick={async () => {
                for (const t of leftovers) await updateTask(t.id, { date: tomorrow })
              }}
              title="Mueve a mañana las tareas de hoy que no has empezado"
            >
              Mover {leftovers.length} pendiente{leftovers.length > 1 ? 's' : ''} de hoy
            </button>
          )}
        </div>
      }
    />
  )
}
