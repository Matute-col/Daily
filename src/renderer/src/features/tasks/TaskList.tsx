import { AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus } from '@shared/types'
import { useDaily } from '@/store/useDaily'
import { TaskItem } from './TaskItem'

const ORDER: Record<TaskStatus, number> = { in_progress: 0, pending: 1, done: 2 }

export function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  const compact = useDaily((s) => s.settings.compact)
  const sorted = [...tasks].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.createdAt.localeCompare(b.createdAt))

  if (sorted.length === 0) return <p className="py-8 text-center text-sm text-ice/50">{empty}</p>

  return (
    <ul className="flex flex-col gap-1.5" aria-label="Tareas">
      <AnimatePresence initial={false}>
        {sorted.map((t) => (
          <TaskItem key={t.id} task={t} compact={compact} />
        ))}
      </AnimatePresence>
    </ul>
  )
}
