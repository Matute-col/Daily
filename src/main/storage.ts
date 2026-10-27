import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  DEFAULT_SETTINGS,
  type DbShape,
  type NewTaskInput,
  type Reminder,
  type Settings,
  type Task,
  type TaskPatch,
  type TaskStatus
} from '@shared/types'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATUSES: TaskStatus[] = ['pending', 'in_progress', 'done']

// --- Validación: el renderer no es de confianza, todo se sanea aquí. ---
function cleanText(v: unknown, max: number, field: string): string {
  if (typeof v !== 'string') throw new Error(`${field} inválido`)
  const s = v.trim().slice(0, max)
  if (!s) throw new Error(`${field} vacío`)
  return s
}
function cleanDate(v: unknown): string {
  if (typeof v !== 'string' || !DATE_RE.test(v)) throw new Error('Fecha inválida')
  return v
}
function cleanIso(v: unknown): string | undefined {
  if (v === undefined || v === null || v === '') return undefined
  if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) throw new Error('Fecha/hora inválida')
  return v
}
function cleanReminder(v: unknown): Reminder | undefined {
  if (!v || typeof v !== 'object') return undefined
  const r = v as Partial<Reminder>
  const interval = Math.round(Number(r.intervalMin))
  if (!Number.isFinite(interval)) throw new Error('Intervalo inválido')
  return {
    enabled: Boolean(r.enabled),
    intervalMin: Math.min(Math.max(interval, 1), 24 * 60),
    lastNotifiedAt: cleanIso(r.lastNotifiedAt)
  }
}

export class TaskRepository {
  private db: DbShape

  constructor(private readonly file: string) {
    this.db = this.load()
  }

  private load(): DbShape {
    if (!existsSync(this.file)) return { version: 1, tasks: [], settings: { ...DEFAULT_SETTINGS } }
    try {
      const raw = JSON.parse(readFileSync(this.file, 'utf8')) as Partial<DbShape>
      return {
        version: 1,
        tasks: Array.isArray(raw.tasks) ? raw.tasks.map((t) => ({ ...t, durationMs: t.durationMs ?? 0 })) : [],
        settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) }
      }
    } catch {
      // Archivo corrupto: se respalda y se arranca limpio para no perder la evidencia.
      renameSync(this.file, `${this.file}.corrupt-${Date.now()}`)
      return { version: 1, tasks: [], settings: { ...DEFAULT_SETTINGS } }
    }
  }

  /** Escritura atómica: tmp + rename, evita archivos a medio escribir. */
  private save(): void {
    mkdirSync(dirname(this.file), { recursive: true })
    const tmp = `${this.file}.tmp`
    writeFileSync(tmp, JSON.stringify(this.db, null, 2), 'utf8')
    renameSync(tmp, this.file)
  }

  list(): Task[] {
    return structuredClone(this.db.tasks)
  }

  get(id: string): Task | undefined {
    return this.db.tasks.find((t) => t.id === id)
  }

  create(input: NewTaskInput): Task {
    const now = new Date().toISOString()
    const task: Task = {
      id: randomUUID(),
      title: cleanText(input?.title, 200, 'Título'),
      emoji: cleanText(input?.emoji || '📝', 16, 'Emoji'),
      date: cleanDate(input?.date),
      status: 'pending',
      durationMs: 0,
      notes: typeof input?.notes === 'string' ? input.notes.slice(0, 2000) : undefined,
      reminder: cleanReminder(input?.reminder),
      createdAt: now,
      updatedAt: now
    }
    this.db.tasks.push(task)
    this.save()
    return structuredClone(task)
  }

  update(id: string, patch: TaskPatch): Task {
    const task = this.get(id)
    if (!task) throw new Error('Tarea no encontrada')
    const p = patch ?? {}
    if ('title' in p) task.title = cleanText(p.title, 200, 'Título')
    if ('emoji' in p) task.emoji = cleanText(p.emoji, 16, 'Emoji')
    if ('date' in p) task.date = cleanDate(p.date)
    if ('status' in p) {
      if (!STATUSES.includes(p.status as TaskStatus)) throw new Error('Estado inválido')
      task.status = p.status as TaskStatus
    }
    if ('notes' in p) task.notes = typeof p.notes === 'string' ? p.notes.slice(0, 2000) : undefined
    if ('reminder' in p) task.reminder = cleanReminder(p.reminder)
    if ('startedAt' in p) task.startedAt = cleanIso(p.startedAt)
    if ('runningSince' in p) task.runningSince = cleanIso(p.runningSince)
    if ('finishedAt' in p) task.finishedAt = cleanIso(p.finishedAt)
    if ('durationMs' in p) task.durationMs = Math.max(0, Math.round(Number(p.durationMs) || 0))
    task.updatedAt = new Date().toISOString()
    this.save()
    return structuredClone(task)
  }

  delete(id: string): void {
    this.db.tasks = this.db.tasks.filter((t) => t.id !== id)
    this.save()
  }

  getSettings(): Settings {
    return { ...this.db.settings }
  }

  setSettings(patch: Partial<Settings>): Settings {
    const s = this.db.settings
    if (typeof patch?.alwaysOnTop === 'boolean') s.alwaysOnTop = patch.alwaysOnTop
    if (typeof patch?.compact === 'boolean') s.compact = patch.compact
    if (typeof patch?.animatedBackground === 'boolean') s.animatedBackground = patch.animatedBackground
    if (typeof patch?.closeToTray === 'boolean') s.closeToTray = patch.closeToTray
    if (typeof patch?.openAtLogin === 'boolean') s.openAtLogin = patch.openAtLogin
    if (patch?.defaultReminderMin !== undefined) {
      const n = Math.round(Number(patch.defaultReminderMin))
      if (Number.isFinite(n)) s.defaultReminderMin = Math.min(Math.max(n, 1), 24 * 60)
    }
    this.save()
    return { ...s }
  }
}
