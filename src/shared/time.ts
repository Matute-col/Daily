import { addDays, format } from 'date-fns'
import type { Task } from './types'

/** Clave de día local YYYY-MM-DD. */
export const dayKey = (d: Date = new Date()): string => format(d, 'yyyy-MM-dd')
export const todayKey = (now: Date = new Date()): string => dayKey(now)
export const tomorrowKey = (now: Date = new Date()): string => dayKey(addDays(now, 1))

/** Convierte YYYY-MM-DD en Date local (mediodía para evitar saltos de horario). */
export const parseDayKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

/** Tiempo trabajado incluyendo el tramo en curso. */
export function elapsedMs(task: Task, now: number = Date.now()): number {
  const running = task.status === 'in_progress' && task.runningSince ? now - Date.parse(task.runningSince) : 0
  return task.durationMs + Math.max(0, running)
}

export function formatDuration(ms: number, withSeconds = false): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (withSeconds) {
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
  }
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`
  return `${m} min`
}
