import { describe, expect, it } from 'vitest'
import { dailySummary, dailySummaryText, weeklySummary, weeklySummaryText } from './summary'
import type { Task } from './types'

let n = 0
const task = (p: Partial<Task>): Task => ({
  id: String(++n),
  title: `Tarea ${n}`,
  emoji: '📝',
  date: '2026-10-27',
  status: 'pending',
  durationMs: 0,
  createdAt: `2026-10-27T08:00:${String(n).padStart(2, '0')}.000Z`,
  updatedAt: '2026-10-27T08:00:00.000Z',
  ...p
})

const NOW = Date.parse('2026-10-27T15:00:00.000Z')

describe('dailySummary', () => {
  const tasks = [
    task({ title: 'Hecha', status: 'done', durationMs: 30 * 60_000 }),
    task({ title: 'En curso', status: 'in_progress', durationMs: 0, runningSince: '2026-10-27T14:00:00.000Z' }),
    task({ title: 'Pendiente' }),
    task({ title: 'Atrasada', date: '2026-10-25' }),
    task({ title: 'Vieja hecha', date: '2026-10-25', status: 'done' }),
    task({ title: 'Mañana', date: '2026-10-28' })
  ]
  const s = dailySummary(tasks, '2026-10-27', NOW)

  it('agrupa por estado y separa mañana y atrasadas', () => {
    expect(s.done.map((t) => t.title)).toEqual(['Hecha'])
    expect(s.inProgress.map((t) => t.title)).toEqual(['En curso'])
    expect(s.pending.map((t) => t.title)).toEqual(['Pendiente'])
    expect(s.overdue.map((t) => t.title)).toEqual(['Atrasada'])
    expect(s.next.map((t) => t.title)).toEqual(['Mañana'])
  })

  it('suma el tiempo incluyendo el tramo en curso y calcula el %', () => {
    expect(s.totalMs).toBe(90 * 60_000)
    expect(s.completion).toBe(33)
  })

  it('el texto incluye lo de mañana', () => {
    const txt = dailySummaryText(s, NOW)
    expect(txt).toContain('Para mañana')
    expect(txt).toContain('Mañana')
    expect(txt).toContain('Atrasada')
  })
})

describe('weeklySummary', () => {
  const tasks = [
    task({ date: '2026-10-26', status: 'done', title: 'Lunes' }),
    task({ date: '2026-10-27', status: 'done', title: 'Martes 1' }),
    task({ date: '2026-10-27', status: 'done', title: 'Martes 2' }),
    task({ date: '2026-10-30', title: 'Viernes pendiente' }),
    task({ date: '2026-11-02', status: 'done', title: 'Otra semana' })
  ]
  const w = weeklySummary(tasks, new Date(2026, 9, 28, 12), NOW)

  it('usa la semana de lunes a domingo', () => {
    expect(w.start).toBe('2026-10-26')
    expect(w.end).toBe('2026-11-01')
    expect(w.days).toHaveLength(7)
  })

  it('separa lo realizado de lo pendiente y calcula cumplimiento', () => {
    expect(w.done.map((t) => t.title)).toEqual(['Lunes', 'Martes 1', 'Martes 2'])
    expect(w.pending.map((t) => t.title)).toEqual(['Viernes pendiente'])
    expect(w.completion).toBe(75)
    expect(w.bestDay?.day).toBe('2026-10-27')
  })

  it('genera texto con realizado y pendiente', () => {
    const txt = weeklySummaryText(w, NOW)
    expect(txt).toContain('Lo realizado')
    expect(txt).toContain('Viernes pendiente')
    expect(txt).not.toContain('Otra semana')
  })
})
