import { useDaily } from '@/store/useDaily'
import type { Settings } from '@shared/types'

type BoolKey = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings]

const TOGGLES: { key: BoolKey; label: string; hint: string }[] = [
  { key: 'compact', label: 'Modo compacto', hint: 'Filas más pequeñas para ocupar menos espacio' },
  { key: 'alwaysOnTop', label: 'Siempre visible', hint: 'La ventana queda encima de las demás' },
  { key: 'animatedBackground', label: 'Fondo animado', hint: 'Desactívalo para ahorrar batería' },
  { key: 'closeToTray', label: 'Seguir en la bandeja al cerrar', hint: 'Necesario para recibir recordatorios con la ventana cerrada' },
  { key: 'openAtLogin', label: 'Abrir al iniciar Windows', hint: 'Daily arranca minimizado en la bandeja' }
]

export function SettingsPanel() {
  const settings = useDaily((s) => s.settings)
  const setSettings = useDaily((s) => s.setSettings)

  return (
    <div className="flex flex-col gap-3 text-sm">
      {TOGGLES.map((t) => (
        <label key={t.key} className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 accent-cyan"
            checked={settings[t.key]}
            onChange={(e) => setSettings({ [t.key]: e.target.checked })}
          />
          <span>
            {t.label}
            <span className="block text-xs text-ice/60">{t.hint}</span>
          </span>
        </label>
      ))}
      <label className="flex items-center gap-2">
        Intervalo por defecto de recordatorios:
        <input
          type="number"
          min={1}
          max={1440}
          className="input h-7 w-16 text-center"
          value={settings.defaultReminderMin}
          onChange={(e) => setSettings({ defaultReminderMin: Number(e.target.value) || 1 })}
        />
        min
      </label>
    </div>
  )
}
