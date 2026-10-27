import { useEffect, useRef, useState } from 'react'

const GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Trabajo', emojis: ['💻', '📝', '📊', '📈', '📅', '📞', '📧', '🗂️', '🧾', '🖨️', '🔍', '🧪'] },
  { label: 'Código', emojis: ['🐛', '🚀', '🛠️', '⚙️', '🔧', '🧩', '🔒', '☁️', '🗄️', '🤖', '🔀', '✅'] },
  { label: 'Reuniones', emojis: ['🤝', '👥', '🗣️', '🎤', '🎯', '💡', '🧠', '📣', '🏁', '⭐', '🔥', '⚡'] },
  { label: 'Personal', emojis: ['☕', '🍎', '🏃', '🧘', '📚', '🎧', '🛒', '🏠', '💪', '🎨', '🎮', '😴'] }
]

interface Props {
  value: string
  onChange(emoji: string): void
}

/** Botón con el emoji actual que despliega una rejilla de emojis por categoría. */
export function EmojiPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false))
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc, true)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc, true)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-xl border border-violet/50 bg-night/60 text-xl transition hover:border-cyan"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Emoji de la tarea: ${value}. Cambiar`}
        aria-expanded={open}
      >
        {value}
      </button>
      {open && (
        <div className="glass absolute left-0 top-12 z-30 w-64 rounded-xl p-2" role="listbox" aria-label="Elegir emoji">
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-1">
              <p className="px-1 text-[10px] uppercase tracking-wider text-ice/60">{g.label}</p>
              <div className="grid grid-cols-6 gap-1">
                {g.emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    role="option"
                    aria-selected={e === value}
                    className={`rounded-lg p-1 text-lg transition hover:bg-violet/40 ${e === value ? 'bg-violet/50' : ''}`}
                    onClick={() => {
                      onChange(e)
                      setOpen(false)
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <label className="mt-1 flex items-center gap-2 px-1 text-xs text-ice/70">
            Otro:
            <input
              className="input h-7 w-16 text-center"
              maxLength={4}
              placeholder="🙂"
              onChange={(ev) => ev.target.value.trim() && onChange(ev.target.value.trim())}
            />
          </label>
        </div>
      )}
    </div>
  )
}
