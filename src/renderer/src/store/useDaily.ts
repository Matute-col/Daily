import { create } from 'zustand'
import { DEFAULT_SETTINGS, type NewTaskInput, type Settings, type Task, type TaskPatch } from '@shared/types'

export type View = 'today' | 'tomorrow' | 'summary' | 'week'

/** Evento de recompensa que consume la capa de animaciones. */
export interface RewardEvent {
  id: number
  kind: 'task' | 'day'
  task?: Task
}

interface DailyState {
  tasks: Task[]
  settings: Settings
  view: View
  loaded: boolean
  error?: string
  reward?: RewardEvent
  focusedTaskId?: string

  load(): Promise<void>
  setView(v: View): void
  createTask(input: NewTaskInput): Promise<void>
  updateTask(id: string, patch: TaskPatch): Promise<Task | undefined>
  deleteTask(id: string): Promise<void>
  start(id: string): Promise<void>
  pause(id: string): Promise<void>
  finish(id: string): Promise<void>
  reopen(id: string): Promise<void>
  setSettings(patch: Partial<Settings>): Promise<void>
  clearReward(): void
  focusTask(id?: string): void
}

let rewardSeq = 0

export const useDaily = create<DailyState>((set, get) => {
  /** Ejecuta una llamada al proceso principal y muestra el error si falla. */
  async function safe<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      set({ error: undefined })
      return await fn()
    } catch (e) {
      set({ error: e instanceof Error ? e.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '') : String(e) })
      return undefined
    }
  }

  const replace = (task: Task) => set({ tasks: get().tasks.map((t) => (t.id === task.id ? task : t)) })

  /** Cierra el tramo en curso sumando su duración. */
  const closeSegment = (t: Task, now: number): TaskPatch => ({
    durationMs: t.durationMs + (t.runningSince ? Math.max(0, now - Date.parse(t.runningSince)) : 0),
    runningSince: undefined
  })

  return {
    tasks: [],
    settings: DEFAULT_SETTINGS,
    view: 'today',
    loaded: false,

    async load() {
      const [tasks, settings] = await Promise.all([window.daily.listTasks(), window.daily.getSettings()])
      set({ tasks, settings, loaded: true })
    },

    setView: (view) => set({ view }),

    async createTask(input) {
      const task = await safe(() => window.daily.createTask(input))
      if (task) set({ tasks: [...get().tasks, task] })
    },

    async updateTask(id, patch) {
      const task = await safe(() => window.daily.updateTask(id, patch))
      if (task) replace(task)
      return task
    },

    async deleteTask(id) {
      const ok = await safe(() => window.daily.deleteTask(id).then(() => true))
      if (ok) set({ tasks: get().tasks.filter((t) => t.id !== id) })
    },

    async start(id) {
      const now = Date.now()
      // Solo una tarea en curso a la vez: se pausan las demás.
      for (const t of get().tasks.filter((t) => t.status === 'in_progress' && t.id !== id)) {
        await get().updateTask(t.id, { status: 'pending', ...closeSegment(t, now) })
      }
      const task = get().tasks.find((t) => t.id === id)
      if (!task) return
      const iso = new Date(now).toISOString()
      await get().updateTask(id, { status: 'in_progress', runningSince: iso, startedAt: task.startedAt ?? iso })
    },

    async pause(id) {
      const task = get().tasks.find((t) => t.id === id)
      if (!task || task.status !== 'in_progress') return
      await get().updateTask(id, { status: 'pending', ...closeSegment(task, Date.now()) })
    },

    async finish(id) {
      const task = get().tasks.find((t) => t.id === id)
      if (!task || task.status === 'done') return
      const now = Date.now()
      const updated = await get().updateTask(id, {
        status: 'done',
        ...closeSegment(task, now),
        startedAt: task.startedAt ?? new Date(now).toISOString(),
        finishedAt: new Date(now).toISOString()
      })
      if (!updated) return
      // ¿Era la última tarea del día? -> celebración grande.
      const sameDay = get().tasks.filter((t) => t.date === updated.date)
      const allDone = sameDay.length > 0 && sameDay.every((t) => t.status === 'done')
      set({ reward: { id: ++rewardSeq, kind: allDone ? 'day' : 'task', task: updated } })
    },

    async reopen(id) {
      await get().updateTask(id, { status: 'pending', finishedAt: undefined })
    },

    async setSettings(patch) {
      const settings = await safe(() => window.daily.setSettings(patch))
      if (settings) set({ settings })
    },

    clearReward: () => set({ reward: undefined }),
    focusTask: (focusedTaskId) => set({ focusedTaskId })
  }
})
