# Daily · Contexto del proyecto (leer primero)

> Memoria del proyecto para el agente. Evita re-explorar el repo y ahorra créditos.
> Mantener corto y actualizado al cerrar cada fase. Idioma de trabajo: **español**.

## Qué es
App de escritorio local (Windows) para organizar tareas diarias, explicarlas en la daily y recompensar el avance con animaciones.
Nombre del producto: **Daily** (ortografía correcta, confirmado por el usuario). Repo: https://github.com/Matute-col/Daily.git · rama `main` directo.

## Stack (100 % gratuito, versiones exactas en package.json)
Electron 45 · electron-vite 6 · Vite 8 · React 19 · TypeScript 7 · Tailwind 4 (`@tailwindcss/vite`, tokens en `@theme`) · Framer Motion · canvas-confetti · Zustand · date-fns (`es`) · Vitest 5 · electron-builder 26 (NSIS).
Persistencia: JSON local en `app.getPath('userData')` detrás de un repositorio (sin módulos nativos).

## Paleta (únicos colores base)
`night` #0D0221 fondo · `pink` #FF2A6D acento/peligro · `cyan` #05D9E8 primario · `ice` #D1F7FF texto · `violet` #7700FF secundario.
Clases Tailwind: `bg-night`, `text-cyan`, `border-violet/40`, etc.

## Arquitectura
```
src/
  main/        # ventana, tray, IPC handlers, storage, reminders
  preload/     # contextBridge -> window.daily (API tipada)
  renderer/src # React: features/, components/, store/
  shared/      # tipos, canales IPC, lógica pura (resúmenes) testeable
```
Reglas: contextIsolation on, nodeIntegration off. El renderer nunca toca `fs`; todo por `window.daily.*`.
Alias: `@/` -> renderer/src, `@shared/` -> src/shared. Preload compila a `out/preload/index.js` (CJS).

## Modelo de datos
```ts
type TaskStatus = 'pending' | 'in_progress' | 'done'
interface Reminder { enabled: boolean; intervalMin: number; lastNotifiedAt?: string }
interface Task {
  id; title; emoji; date /*YYYY-MM-DD*/; status;
  startedAt?; finishedAt?; durationMs?; notes?;
  reminder?: Reminder;      // por tarea, intervalo configurable
  createdAt; updatedAt
}
```

## Convenciones
- Conventional Commits (`feat(tasks):`, `fix:`, `chore:`, `build:`, `docs:`, `test:`), push a `main` al cerrar cada fase.
- Comandos: `npm run dev` (lo corre el usuario), `npm run build` (typecheck + build), `npx vitest --run`, `npm run dist`.
- Electron binario: si falta `node_modules/electron/dist`, ejecutar `node node_modules/electron/install.js` (npm 11 bloquea install scripts).

## Estado de fases
- [x] 0 Scaffold + tooling + docs
- [ ] 1 Storage + IPC
- [ ] 2-3 CRUD tareas + emoji + iniciar/finalizar + completado
- [ ] 4-5 Recompensas + fondo animado + UI compacta
- [ ] 6-8 Planificar mañana + resumen diario + semanal
- [ ] 9 Recordatorios por tarea + tray
- [ ] 10 Instalador + icono
