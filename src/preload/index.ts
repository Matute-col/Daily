import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/ipc'
import type { DailyApi } from '@shared/types'

function subscribe<T extends unknown[]>(channel: string, cb: (...args: T) => void): () => void {
  const listener = (_e: Electron.IpcRendererEvent, ...args: unknown[]) => cb(...(args as T))
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api: DailyApi = {
  listTasks: () => ipcRenderer.invoke(IPC.listTasks),
  createTask: (input) => ipcRenderer.invoke(IPC.createTask, input),
  updateTask: (id, patch) => ipcRenderer.invoke(IPC.updateTask, id, patch),
  deleteTask: (id) => ipcRenderer.invoke(IPC.deleteTask, id),
  getSettings: () => ipcRenderer.invoke(IPC.getSettings),
  setSettings: (patch) => ipcRenderer.invoke(IPC.setSettings, patch),
  onTasksChanged: (cb) => subscribe(IPC.tasksChanged, cb),
  onFocusTask: (cb) => subscribe<[string]>(IPC.focusTask, cb)
}

contextBridge.exposeInMainWorld('daily', api)
