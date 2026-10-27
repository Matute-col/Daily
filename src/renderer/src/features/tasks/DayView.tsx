import type { ReactNode } from 'react'
import { useDaily } from '@/store/useDaily'
import { TaskForm } from './TaskForm'
import { TaskList } from './TaskList'

interface Props {
  date: string
  empty: string
  header?: ReactNode
}

/** Lista de tareas de un día con formulario de alta. */
export function DayView({ date, empty, header }: Props) {
  const tasks = useDaily((s) => s.tasks).filter((t) => t.date === date)
  const createTask = useDaily((s) => s.createTask)
  const done = tasks.filter((t) => t.status === 'done').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      {header}
      <TaskForm date={date} onSubmit={createTask} />
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-ice/70" aria-label={`Progreso: ${done} de ${tasks.length}`}>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-violet/30">
            <div className="h-full rounded-full bg-gradient-to-r from-violet via-pink to-cyan transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span>
            {done}/{tasks.length}
          </span>
        </div>
      )}
      <div className="-mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
        <TaskList tasks={tasks} empty={empty} />
      </div>
    </section>
  )
}
