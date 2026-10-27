import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('daily', {})
