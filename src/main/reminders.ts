import { Notification } from 'electron'
import { dueReminders } from '@shared/reminders'
import type { Task } from '@shared/types'
import type { TaskRepository } from './storage'

const TICK_MS = 30_000

/** Revisa periódicamente los recordatorios por tarea y lanza notificaciones nativas. */
export function startReminders(repo: TaskRepository, icon: string, onClick: (task: Task) => void): () => void {
  const tick = () => {
    const now = Date.now()
    const { due, arm } = dueReminders(repo.list(), now)
    const stamp = new Date(now).toISOString()

    for (const t of arm) repo.update(t.id, { reminder: { ...t.reminder!, lastNotifiedAt: stamp } })

    for (const t of due) {
      repo.update(t.id, { reminder: { ...t.reminder!, lastNotifiedAt: stamp } })
      if (!Notification.isSupported()) continue
      const n = new Notification({
        title: t.status === 'in_progress' ? `⏳ Sigues con: ${t.title}` : `📌 Pendiente: ${t.title}`,
        body:
          t.status === 'in_progress'
            ? `${t.emoji} ¡Vas bien! Cuando termines, márcala como finalizada.`
            : `${t.emoji} Aún no la empiezas. Te aviso de nuevo en ${t.reminder!.intervalMin} min.`,
        icon,
        silent: false
      })
      n.on('click', () => onClick(t))
      n.show()
    }
  }

  tick()
  const id = setInterval(tick, TICK_MS)
  return () => clearInterval(id)
}
