import { describe, expect, it } from 'vitest'
import { dueReminders } from './reminders'
import type { Task } from './types'

const NOW = new Date(2026, 9, 27, 15, 0).getTime()
const base: Task = {
  id: 'x',
  title: 'T',
  emoji: '📝',
  date: '2026-10-27',
  status: 'pending',
  durationMs: 0,
  createdAt: '',
  updatedAt: ''
}
const ago = (min: number) => new Date(NOW - min * 60_000).toISOString()

describe('dueReminders', () => {
  it('arma el contador si nunca se notificó', () => {
    const r = dueReminders([{ ...base, reminder: { enabled: true, intervalMin: 10 } }], NOW)
    expect(r.arm).toHaveLength(1)
    expect(r.due).toHaveLength(0)
  })

  it('notifica al cumplirse el intervalo y no antes', () => {
    const t = (min: number): Task => ({ ...base, reminder: { enabled: true, intervalMin: 10, lastNotifiedAt: ago(min) } })
    expect(dueReminders([t(9)], NOW).due).toHaveLength(0)
    expect(dueReminders([t(10)], NOW).due).toHaveLength(1)
  })

  it('ignora tareas terminadas, desactivadas o de días futuros', () => {
    const rem = { enabled: true, intervalMin: 1, lastNotifiedAt: ago(60) }
    const r = dueReminders(
      [
        { ...base, status: 'done', reminder: rem },
        { ...base, reminder: { ...rem, enabled: false } },
        { ...base, date: '2026-10-28', reminder: rem },
        { ...base, date: '2026-10-20', reminder: rem }
      ],
      NOW
    )
    expect(r.due.map((t) => t.date)).toEqual(['2026-10-20'])
  })
})
