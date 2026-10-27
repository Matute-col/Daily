import { useMemo } from 'react'
import { dailySummary, dailySummaryText } from '@shared/summary'
import { elapsedMs, formatDuration, todayKey } from '@shared/time'
import type { Task } from '@shared/types'
import { CopyButton } from '@/components/CopyButton'
import { useNow } from '@/hooks/useNow'
import { useDaily } from '@/store/useDaily'

export function TaskLines({ tasks, now, showTime = true }: { tasks: Task[]; now: number; showTime?: boolean }) {
  return (
    <ul className="flex flex-col gap-0.5 text-sm">
      {tasks.map((t) => (
        <li key={t.id} className="flex gap-2">
          <span aria-hidden>{t.emoji}</span>
          <span className="flex-1 truncate" title={t.title}>
            {t.title}
          </span>
          {showTime && elapsedMs(t, now) >= 60_000 && <span className="text-xs text-ice/60">{formatDuration(elapsedMs(t, now))}</span>}
        </li>
      ))}
    </ul>
  )
}

export function Block({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-violet/30 bg-night/40 p-2">
      <h3 className={`mb-1 text-xs font-semibold uppercase tracking-wider ${color}`}>{title}</h3>
      {children}
    </div>
  )
}

/** Resumen del día para la daily: hecho, en curso, pendiente y lo planificado para mañana. */
export function SummaryView() {
  const tasks = useDaily((s) => s.tasks)
  const now = useNow(true, 30_000)
  const s = useMemo(() => dailySummary(tasks, todayKey(new Date(now)), now), [tasks, now])
  const pending = [...s.inProgress, ...s.pending, ...s.overdue]

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={`${s.completion} %`} label="Completado" />
        <Stat value={`${s.done.length}`} label="Hechas" />
        <Stat value={formatDuration(s.totalMs)} label="Trabajado" />
      </div>

      <Block title="✅ Lo que hice" color="text-cyan">
        {s.done.length ? <TaskLines tasks={s.done} now={now} /> : <Empty>Aún no completas tareas hoy.</Empty>}
      </Block>
      {pending.length > 0 && (
        <Block title="📌 Pendiente" color="text-pink">
          <TaskLines tasks={pending} now={now} />
        </Block>
      )}
      <Block title="🗓️ Para mañana" color="text-violet brightness-150">
        {s.next.length ? <TaskLines tasks={s.next} now={now} showTime={false} /> : <Empty>Nada planificado. Usa la pestaña Mañana.</Empty>}
      </Block>

      <div className="flex justify-end">
        <CopyButton text={dailySummaryText(s, now)} />
      </div>
    </section>
  )
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-violet/30 bg-night/40 px-1 py-2">
      <p className="truncate text-lg font-bold text-cyan">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-ice/60">{label}</p>
    </div>
  )
}

export const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-ice/50">{children}</p>
