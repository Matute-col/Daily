import { BrowserWindow, ipcMain } from 'electron'
import { IPC } from '@shared/ipc'
import type { NewTaskInput, Settings, TaskPatch } from '@shared/types'
import type { TaskRepository } from './storage'

export function registerIpc(repo: TaskRepository, getWindow: () => BrowserWindow | null): void {
  ipcMain.handle(IPC.listTasks, () => repo.list())
  ipcMain.handle(IPC.createTask, (_e, input: NewTaskInput) => repo.create(input))
  ipcMain.handle(IPC.updateTask, (_e, id: string, patch: TaskPatch) => repo.update(String(id), patch))
  ipcMain.handle(IPC.deleteTask, (_e, id: string) => repo.delete(String(id)))
  ipcMain.handle(IPC.getSettings, () => repo.getSettings())
  ipcMain.handle(IPC.setSettings, (_e, patch: Partial<Settings>) => {
    const s = repo.setSettings(patch)
    getWindow()?.setAlwaysOnTop(s.alwaysOnTop)
    return s
  })
}
