import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { elapsedMs, formatDuration } from '@shared/time'
import type { Task } from '@shared/types'
import { BellIcon, EditIcon, PauseIcon, PlayIcon, StopIcon, TrashIcon, UndoIcon } from '@/components/icons'
import { Modal } from '@/components/Modal'
import { useNow } from '@/hooks/useNow'
import { useDaily } from '@/store/useDaily'
import { TaskForm } from './TaskForm'

export function TaskItem({ task, compact }: { task: Task; compact: boolean }) {
  const { start, pause, finish, reopen, deleteTask, updateTask, focusedTaskId, focusTask } = useDaily()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const running = task.status === 'in_progress'
  const done = task.status === 'done'
  const now = useNow(running)
  const elapsed = elapsedMs(task, now)

  // Al pulsar una notificación se resalta y desplaza hasta la tarea.
  useEffect(() => {
    if (focusedTaskId !== task.id) return
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const t = setTimeout(() => focusTask(undefined), 2500)
    return () => clearTimeout(t)
  }, [focusedTaskId, task.id, focusTask])

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className={`group relative flex items-center gap-2 rounded-xl border px-2 transition ${compact ? 'py-1' : 'py-2'} ${
        done
          ? 'border-cyan/30 bg-cyan/5'
          : running
            ? 'border-pink/70 bg-pink/10 shadow-[0_0_18px_-4px_var(--color-pink)]'
            : 'border-violet/40 bg-night/50'
      } ${focusedTaskId === task.id ? 'ring-2 ring-cyan' : ''}`}
    >
      <span className={`${compact ? 'text-lg' : 'text-2xl'} select-none`} aria-hidden>
        {task.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate ${done ? 'text-ice/60 line-through decoration-cyan/60' : ''}`} title={task.title}>
          {task.title}
        </p>
        {!compact && (elapsed > 0 || task.reminder?.enabled || task.notes) && (
          <p className="flex items-center gap-2 text-xs text-ice/60">
            {elapsed > 0 && <span className={running ? 'font-mono text-pink' : ''}>{formatDuration(elapsed, running)}</span>}
            {task.reminder?.enabled && !done && (
              <span className="flex items-center gap-0.5" title={`Recordatorio cada ${task.reminder.intervalMin} min`}>
                <BellIcon width={12} height={12} /> {task.reminder.intervalMin} min
              </span>
            )}
            {task.notes && <span className="truncate">· {task.notes}</span>}
          </p>
        )}
        {compact && running && <p className="font-mono text-xs text-pink">{formatDuration(elapsed, true)}</p>}
      </div>

      {/* Icono de completado animado */}
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="grid h-7 w-7 place-items-center rounded-full bg-cyan text-night shadow-[0_0_14px_var(--color-cyan)]"
            role="img"
            aria-label="Completada"
          >
            <StopIcon width={16} height={16} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-0.5">
        {!done && !running && (
          <button className="icon-btn text-cyan" onClick={() => start(task.id)} aria-label={`Iniciar ${task.title}`} title="Iniciar">
            <PlayIcon />
          </button>
        )}
        {running && (
          <button className="icon-btn text-ice" onClick={() => pause(task.id)} aria-label={`Pausar ${task.title}`} title="Pausar">
            <PauseIcon />
          </button>
        )}
        {!done && (
          <button className="icon-btn text-pink" onClick={() => finish(task.id)} aria-label={`Finalizar ${task.title}`} title="Finalizar">
            <StopIcon />
          </button>
        )}
        {done && (
          <button className="icon-btn opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => reopen(task.id)} aria-label={`Reabrir ${task.title}`} title="Reabrir">
            <UndoIcon />
          </button>
        )}
        <button className="icon-btn opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => setEditing(true)} aria-label={`Editar ${task.title}`} title="Editar">
          <EditIcon />
        </button>
        <button className="icon-btn opacity-0 hover:text-pink group-hover:opacity-100 focus:opacity-100" onClick={() => setConfirmDelete(true)} aria-label={`Eliminar ${task.title}`} title="Eliminar">
          <TrashIcon />
        </button>
      </div>

      <Modal open={editing} title="Editar tarea" onClose={() => setEditing(false)}>
        <TaskForm
          date={task.date}
          showDate
          submitLabel="Guardar"
          initial={{ title: task.title, emoji: task.emoji, date: task.date, notes: task.notes, reminder: task.reminder }}
          onSubmit={async (input) => {
            await updateTask(task.id, input)
            setEditing(false)
          }}
        />
      </Modal>

      <Modal open={confirmDelete} title="¿Eliminar tarea?" onClose={() => setConfirmDelete(false)}>
        <p className="mb-4 text-sm">
          {task.emoji} <strong>{task.title}</strong> se eliminará de forma permanente.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </button>
          <button
            className="btn-danger"
            onClick={async () => {
              setConfirmDelete(false)
              await deleteTask(task.id)
            }}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </motion.li>
  )
}
