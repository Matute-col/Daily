import { join } from 'node:path'
import { app, BrowserWindow, Menu, nativeImage, shell, Tray } from 'electron'
import icon from '../../resources/icon.png?asset'
import { IPC } from '@shared/ipc'
import type { Settings } from '@shared/types'
import { registerIpc } from './ipc'
import { startReminders } from './reminders'
import { TaskRepository } from './storage'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let quitting = false
let repo: TaskRepository

const startHidden = process.argv.includes('--hidden')

function createWindow(): BrowserWindow {
  const s = repo.getSettings()
  const win = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 340,
    minHeight: 420,
    title: 'Daily',
    icon,
    backgroundColor: '#0D0221',
    autoHideMenuBar: true,
    alwaysOnTop: s.alwaysOnTop,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.once('ready-to-show', () => !startHidden && win.show())

  // Con "seguir en la bandeja" la X oculta la ventana en vez de cerrar la app.
  win.on('close', (e) => {
    if (!quitting && repo.getSettings().closeToTray) {
      e.preventDefault()
      win.hide()
    }
  })
  win.on('closed', () => (mainWindow = null))

  // Los enlaces externos se abren en el navegador, nunca dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return win
}

function showWindow(): BrowserWindow {
  if (!mainWindow) mainWindow = createWindow()
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
  return mainWindow
}

function buildTrayMenu(): Menu {
  const s = repo.getSettings()
  return Menu.buildFromTemplate([
    { label: 'Abrir Daily', click: showWindow },
    { type: 'separator' },
    { label: 'Siempre visible', type: 'checkbox', checked: s.alwaysOnTop, click: (i) => applySettings(repo.setSettings({ alwaysOnTop: i.checked }), true) },
    { label: 'Modo compacto', type: 'checkbox', checked: s.compact, click: (i) => applySettings(repo.setSettings({ compact: i.checked }), true) },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        quitting = true
        app.quit()
      }
    }
  ])
}

/** Aplica efectos de los ajustes en el proceso principal. `notify` avisa al renderer si el cambio vino de la bandeja. */
function applySettings(s: Settings, notify = false): void {
  mainWindow?.setAlwaysOnTop(s.alwaysOnTop)
  if (app.isPackaged) app.setLoginItemSettings({ openAtLogin: s.openAtLogin, args: ['--hidden'] })
  tray?.setContextMenu(buildTrayMenu())
  if (notify) mainWindow?.webContents.send(IPC.tasksChanged)
}

// Una sola instancia: si se abre otra vez el icono, se enfoca la ventana existente.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => showWindow())

  app.whenReady().then(() => {
    app.setAppUserModelId('com.matutecol.daily')
    repo = new TaskRepository(join(app.getPath('userData'), 'daily-data.json'))
    registerIpc(repo, (s) => applySettings(s))
    mainWindow = createWindow()

    tray = new Tray(nativeImage.createFromPath(icon).resize({ width: 16, height: 16 }))
    tray.setToolTip('Daily')
    tray.on('click', showWindow)
    applySettings(repo.getSettings())

    startReminders(repo, icon, (task) => {
      const win = showWindow()
      win.webContents.send(IPC.tasksChanged)
      win.webContents.send(IPC.focusTask, task.id)
    })

    app.on('activate', showWindow)
  })

  app.on('before-quit', () => (quitting = true))
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
