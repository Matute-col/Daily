import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { dayKey, elapsedMs, formatDuration, parseDayKey } from './time'
import type { Task } from './types'

const byCreated = (a: Task, b: Task) => a.createdAt.localeCompare(b.createdAt)

export interface DailySummary {
  day: string
  done: Task[]
  inProgress: Task[]
  pending: Task[]
  /** Pendientes de días anteriores al `day`. */
  overdue: Task[]
  /** Planificado para el día siguiente. */
  next: Task[]
  totalMs: number
  completion: number
}

export function dailySummary(tasks: Task[], day: string, now: number = Date.now()): DailySummary {
  const nextDay = dayKey(addDays(parseDayKey(day), 1))
  const ofDay = tasks.filter((t) => t.date === day).sort(byCreated)
  const done = ofDay.filter((t) => t.status === 'done')
  return {
    day,
    done,
    inProgress: ofDay.filter((t) => t.status === 'in_progress'),
    pending: ofDay.filter((t) => t.status === 'pending'),
    overdue: tasks.filter((t) => t.date < day && t.status !== 'done').sort((a, b) => a.date.localeCompare(b.date)),
    next: tasks.filter((t) => t.date === nextDay).sort(byCreated),
    totalMs: ofDay.reduce((acc, t) => acc + elapsedMs(t, now), 0),
    completion: ofDay.length ? Math.round((done.length / ofDay.length) * 100) : 0
  }
}

const line = (t: Task, now: number) => {
  const ms = elapsedMs(t, now)
  return `- ${t.emoji} ${t.title}${ms >= 60_000 ? ` (${formatDuration(ms)})` : ''}`
}

/** Texto listo para pegar o leer en la daily. */
export function dailySummaryText(s: DailySummary, now: number = Date.now()): string {
  const title = format(parseDayKey(s.day), "EEEE d 'de' MMMM", { locale: es })
  const out: string[] = [`Resumen de ${title} · ${s.completion} % completado · ${formatDuration(s.totalMs)} trabajados`, '']
  out.push('✅ Lo que hice:', ...(s.done.length ? s.done.map((t) => line(t, now)) : ['- (nada completado aún)']), '')
  if (s.inProgress.length) out.push('⏳ En curso:', ...s.inProgress.map((t) => line(t, now)), '')
  const pend = [...s.pending, ...s.overdue]
  if (pend.length) out.push('📌 Pendiente:', ...pend.map((t) => line(t, now)), '')
  out.push('🗓️ Para mañana:', ...(s.next.length ? s.next.map((t) => `- ${t.emoji} ${t.title}`) : ['- (sin planificar)']))
  return out.join('\n')
}

export interface WeekDay {
  day: string
  label: string
  total: number
  done: number
}

export interface WeeklySummary {
  start: string
  end: string
  days: WeekDay[]
  done: Task[]
  pending: Task[]
  total: number
  completion: number
  totalMs: number
  bestDay?: WeekDay
}

/** Semana de lunes a domingo que contiene `ref`. */
export function weeklySummary(tasks: Task[], ref: Date, now: number = Date.now()): WeeklySummary {
  const monday = startOfWeek(ref, { weekStartsOn: 1 })
  const keys = Array.from({ length: 7 }, (_, i) => dayKey(addDays(monday, i)))
  const inWeek = tasks.filter((t) => t.date >= keys[0] && t.date <= keys[6])
  const days = keys.map((k) => {
    const list = inWeek.filter((t) => t.date === k)
    return {
      day: k,
      label: format(parseDayKey(k), 'EEE', { locale: es }),
      total: list.length,
      done: list.filter((t) => t.status === 'done').length
    }
  })
  const done = inWeek.filter((t) => t.status === 'done').sort((a, b) => a.date.localeCompare(b.date) || byCreated(a, b))
  const pending = inWeek.filter((t) => t.status !== 'done').sort((a, b) => a.date.localeCompare(b.date) || byCreated(a, b))
  const best = [...days].sort((a, b) => b.done - a.done)[0]
  return {
    start: keys[0],
    end: keys[6],
    days,
    done,
    pending,
    total: inWeek.length,
    completion: inWeek.length ? Math.round((done.length / inWeek.length) * 100) : 0,
    totalMs: inWeek.reduce((acc, t) => acc + elapsedMs(t, now), 0),
    bestDay: best && best.done > 0 ? best : undefined
  }
}

export function weeklySummaryText(w: WeeklySummary, now: number = Date.now()): string {
  const fmt = (k: string) => format(parseDayKey(k), "d 'de' MMM", { locale: es })
  const out = [
    `Semana del ${fmt(w.start)} al ${fmt(w.end)}`,
    `Cumplimiento: ${w.completion} % (${w.done.length}/${w.total}) · ${formatDuration(w.totalMs)} trabajados`,
    ''
  ]
  out.push('✅ Lo realizado:', ...(w.done.length ? w.done.map((t) => line(t, now)) : ['- (nada)']), '')
  out.push('📌 Lo que quedó pendiente:', ...(w.pending.length ? w.pending.map((t) => `${line(t, now)} · ${fmt(t.date)}`) : ['- (nada, ¡semana perfecta!)']))
  return out.join('\n')
}
