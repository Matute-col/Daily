import { todayKey } from './time'
import type { Task } from './types'

export interface ReminderDecision {
  /** Tareas a notificar ahora. */
  due: Task[]
  /** Tareas cuyo contador arranca ahora (recordatorio recién activado). */
  arm: Task[]
}

/**
 * Decide qué recordatorios disparar. Solo aplica a tareas no terminadas de hoy o atrasadas;
 * las de días futuros esperan a su día.
 */
export function dueReminders(tasks: Task[], now: number = Date.now()): ReminderDecision {
  const today = todayKey(new Date(now))
  const due: Task[] = []
  const arm: Task[] = []
  for (const t of tasks) {
    const r = t.reminder
    if (!r?.enabled || t.status === 'done' || t.date > today) continue
    if (!r.lastNotifiedAt) {
      arm.push(t)
      continue
    }
    if (now - Date.parse(r.lastNotifiedAt) >= r.intervalMin * 60_000) due.push(t)
  }
  return { due, arm }
}
