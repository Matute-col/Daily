import type { Reminder } from '@shared/types'

const PRESETS = [5, 15, 30, 60, 120]

interface Props {
  value: Reminder
  onChange(r: Reminder): void
}

/** Activa el recordatorio de una tarea y ajusta cada cuántos minutos avisa. */
export function ReminderFields({ value, onChange }: Props) {
  const set = (patch: Partial<Reminder>) => onChange({ ...value, ...patch })
  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-pink"
          checked={value.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
        />
        <span>Recordarme esta tarea mientras esté pendiente</span>
      </label>
      {value.enabled && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-ice/70">Cada</span>
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${value.intervalMin === m ? 'chip-on' : ''}`}
              onClick={() => set({ intervalMin: m })}
            >
              {m < 60 ? `${m} min` : `${m / 60} h`}
            </button>
          ))}
          <label className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={1440}
              className="input h-7 w-16 text-center text-xs"
              value={value.intervalMin}
              onChange={(e) => set({ intervalMin: Math.min(1440, Math.max(1, Number(e.target.value) || 1)) })}
              aria-label="Intervalo del recordatorio en minutos"
            />
            <span className="text-ice/70">min</span>
          </label>
        </div>
      )}
    </fieldset>
  )
}
