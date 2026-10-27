import { useState, type FormEvent } from 'react'
import { todayKey, tomorrowKey } from '@shared/time'
import type { NewTaskInput, Reminder } from '@shared/types'
import { EmojiPicker } from '@/components/EmojiPicker'
import { BellIcon, PlusIcon } from '@/components/icons'
import { useDaily } from '@/store/useDaily'
import { ReminderFields } from './ReminderFields'

interface Props {
  /** Día por defecto de la tarea nueva. */
  date: string
  initial?: NewTaskInput
  submitLabel?: string
  /** Muestra el selector de día (hoy/mañana/otro). */
  showDate?: boolean
  onSubmit(input: NewTaskInput): Promise<void> | void
}

export function TaskForm({ date, initial, submitLabel, showDate, onSubmit }: Props) {
  const defaultMin = useDaily((s) => s.settings.defaultReminderMin)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '📝')
  const [day, setDay] = useState(initial?.date ?? date)
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [reminder, setReminder] = useState<Reminder>(initial?.reminder ?? { enabled: false, intervalMin: defaultMin })
  const [expanded, setExpanded] = useState(Boolean(initial))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await onSubmit({ title: title.trim(), emoji, date: day, notes: notes.trim() || undefined, reminder })
    if (!initial) {
      setTitle('')
      setNotes('')
      setReminder({ enabled: false, intervalMin: defaultMin })
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <input
          className="input h-10 flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué vas a hacer?"
          aria-label="Título de la tarea"
          maxLength={200}
        />
        {!initial && (
          <button
            type="button"
            className={`icon-btn ${reminder.enabled ? 'text-pink' : ''}`}
            onClick={() => setExpanded((x) => !x)}
            aria-label="Más opciones: notas y recordatorio"
            aria-expanded={expanded}
          >
            <BellIcon />
          </button>
        )}
        <button type="submit" className="btn-primary h-10 px-3" aria-label={submitLabel ?? 'Añadir tarea'} disabled={!title.trim()}>
          {submitLabel ?? <PlusIcon />}
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-2 rounded-xl border border-violet/30 bg-night/40 p-2">
          {showDate && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ice/70">Día:</span>
              <button type="button" className={`chip ${day === todayKey() ? 'chip-on' : ''}`} onClick={() => setDay(todayKey())}>
                Hoy
              </button>
              <button type="button" className={`chip ${day === tomorrowKey() ? 'chip-on' : ''}`} onClick={() => setDay(tomorrowKey())}>
                Mañana
              </button>
              <input type="date" className="input h-7 text-xs" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} aria-label="Fecha" />
            </div>
          )}
          <textarea
            className="input min-h-14 resize-y py-1 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional): detalles para contar en la daily"
            aria-label="Notas"
            maxLength={2000}
          />
          <ReminderFields value={reminder} onChange={setReminder} />
        </div>
      )}
    </form>
  )
}
