# Daily

App de escritorio para Windows que organiza tus tareas del día, te prepara para la reunión diaria y celebra cada avance con animaciones.

## Funciones
- Tareas diarias con emoji, notas, iniciar / pausar / finalizar y tiempo trabajado.
- Icono de completado, estrella animada y confeti al terminar; celebración especial al completar el día.
- Planificación del día siguiente (también aparece en el resumen).
- Resumen diario y semanal (realizado, % cumplido, pendiente) con botón para copiarlo.
- Recordatorios por tarea con intervalo configurable (notificaciones de Windows) y app en la bandeja.
- Editar y eliminar tareas, modo compacto, siempre visible, fondo animado, ventana redimensionable.
- Todo local: los datos se guardan en `%APPDATA%\Daily\daily-data.json`.

## Instalar
```powershell
npm install
npm run dist
```
Ejecuta `release\<versión>\Daily-Setup-<versión>.exe`. El instalador crea el icono **Daily** en el escritorio y en el menú Inicio.

## Desarrollo
```powershell
npm run dev        # app con recarga en caliente
npm test           # tests (Vitest)
npm run build      # typecheck + build
npm run icon       # regenera resources/icon.png
```

Stack: Electron, electron-vite, React, TypeScript, Tailwind CSS, Framer Motion, canvas-confetti, Zustand, date-fns.
