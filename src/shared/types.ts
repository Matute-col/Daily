export type TaskStatus = 'pending' | 'in_progress' | 'done'

/** Recordatorio propio de cada tarea: avisa cada `intervalMin` minutos mientras no esté terminada. */
export interface Reminder {
  enabled: boolean
  intervalMin: number
  lastNotifiedAt?: string
}

export interface Task {
  id: string
  title: string
  emoji: string
  /** Día al que pertenece la tarea, formato YYYY-MM-DD. */
  date: string
  status: TaskStatus
  /** Primera vez que se inició. */
  startedAt?: string
  /** Inicio del tramo actual en curso (solo si status === 'in_progress'). */
  runningSince?: string
  finishedAt?: string
  /** Tiempo acumulado trabajado en ms (soporta pausar/reanudar). */
  durationMs: number
  notes?: string
  reminder?: Reminder
  createdAt: string
  updatedAt: string
}

export interface NewTaskInput {
  title: string
  emoji: string
  date: string
  notes?: string
  reminder?: Reminder
}

export type TaskPatch = Partial<
  Pick<Task, 'title' | 'emoji' | 'date' | 'status' | 'notes' | 'reminder' | 'startedAt' | 'runningSince' | 'finishedAt' | 'durationMs'>
>

export interface Settings {
  alwaysOnTop: boolean
  compact: boolean
  /** Intervalo por defecto (min) al activar un recordatorio nuevo. */
  defaultReminderMin: number
  animatedBackground: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  alwaysOnTop: false,
  compact: false,
  defaultReminderMin: 30,
  animatedBackground: true
}

export interface DbShape {
  version: 1
  tasks: Task[]
  settings: Settings
}

/** API expuesta por el preload en `window.daily`. */
export interface DailyApi {
  listTasks(): Promise<Task[]>
  createTask(input: NewTaskInput): Promise<Task>
  updateTask(id: string, patch: TaskPatch): Promise<Task>
  deleteTask(id: string): Promise<void>
  copyText(text: string): Promise<void>
  getSettings(): Promise<Settings>
  setSettings(patch: Partial<Settings>): Promise<Settings>
  /** Se dispara cuando el proceso principal modifica datos (p. ej. desde un recordatorio). */
  onTasksChanged(cb: () => void): () => void
  /** Se dispara al pulsar una notificación de recordatorio. */
  onFocusTask(cb: (id: string) => void): () => void
}
