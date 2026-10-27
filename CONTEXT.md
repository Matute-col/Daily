# Daily · Contexto del proyecto (leer primero)

> Memoria del proyecto para el agente. Evita re-explorar el repo y ahorra créditos.
> Mantener corto y actualizado. Idioma de trabajo: **español**.

## Qué es
App de escritorio local (Windows) para organizar tareas diarias, explicarlas en la daily y recompensar el avance con animaciones.
Producto: **Daily**. Repo: https://github.com/Matute-col/Daily.git · push directo a `main` · Conventional Commits.

## Stack (versiones exactas en package.json)
Electron 45 · electron-vite 6 · Vite 8 · React 19 · TypeScript 7 · Tailwind 4 (`@theme` en styles.css) · Framer Motion · canvas-confetti · Zustand · date-fns (`es`) · Vitest 5 · electron-builder 26 (NSIS).
Solo `date-fns` es dependencia de runtime (lo usa main); el resto va bundleado en devDependencies.

## Paleta (únicos colores base)
`night` #0D0221 · `pink` #FF2A6D · `cyan` #05D9E8 · `ice` #D1F7FF · `violet` #7700FF → clases `bg-night`, `text-cyan`, `border-violet/40`…
Clases propias en styles.css: `glass`, `input`, `icon-btn`, `hover-btn`, `btn-primary`, `btn-ghost`, `btn-danger`, `chip`, `chip-on`, fondo `bg-scene`.

## Mapa de archivos
```
src/shared/   types.ts (Task, Settings, DailyApi) · ipc.ts (canales) · time.ts · summary.ts · reminders.ts (+ *.test.ts)
src/main/     index.ts (ventana, tray, close-to-tray, login item) · ipc.ts · storage.ts (TaskRepository JSON atómico + validación) · reminders.ts (tick 30 s)
src/preload/  index.ts -> window.daily · index.d.ts
src/renderer/src/
  App.tsx (header, pestañas Hoy/Mañana/Resumen/Semana; en md+ Hoy y Mañana lado a lado)
  store/useDaily.ts (estado, start/pause/finish, reward events)
  features/ tasks/(DayView, TaskForm, TaskItem, TaskList, ReminderFields, OverdueBanner) · planner/TomorrowView · summary/SummaryView · weekly/WeekView · rewards/(RewardLayer, messages) · settings/SettingsPanel
  components/ Modal (portal) · EmojiPicker · AnimatedBackground · CopyButton · icons
resources/icon.png (512) · scripts/make-icon.cjs · electron-builder.yml
```

## Reglas
- contextIsolation on, nodeIntegration off; el renderer solo usa `window.daily.*`. Toda entrada se valida en `storage.ts`.
- Lógica pura en `src/shared` con tests. Una sola tarea `in_progress` a la vez; tiempo = `durationMs` + tramo `runningSince`.
- Recordatorio por tarea: `{enabled, intervalMin, lastNotifiedAt}`; primer tick "arma" el contador, luego avisa cada intervalo si no está `done` y su fecha ≤ hoy.

## Comandos (Windows)
- `npm run dev` lo corre el usuario. `npm run build`, `npm test`, `npm run dist` (instalador en `release/<v>/`).
- En el agente, `npx`/comandos largos a veces se interrumpen: usar `node node_modules/<pkg>/...` o `control_pwsh_process`.
- Si falta el binario de Electron: `node node_modules/electron/install.js`.
- Verificación visual: script temporal fuera del repo que hace `require(out/main/index.js)` y `webContents.capturePage()`.

## Estado
v1.0.0 completa (fases 0-10). Ideas futuras: exportar/importar datos, SQLite, atajos de teclado, firma de código.
