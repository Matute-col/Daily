import { useMemo, useState } from 'react'
import { addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { weeklySummary, weeklySummaryText } from '@shared/summary'
import { formatDuration, parseDayKey, todayKey } from '@shared/time'
import { CopyButton } from '@/components/CopyButton'
import { useDaily } from '@/store/useDaily'
import { Block, Empty, Stat, TaskLines } from '../summary/SummaryView'

/** Resumen semanal: realizado, cumplimiento y pendiente, con navegación entre semanas. */
export function WeekView() {
  const tasks = useDaily((s) => s.tasks)
  const [offset, setOffset] = useState(0)
  const now = Date.now()
  const w = useMemo(() => weeklySummary(tasks, addWeeks(new Date(), offset), now), [tasks, offset, now])
  const max = Math.max(1, ...w.days.map((d) => d.total))
  const today = todayKey()
  const fmt = (k: string) => format(parseDayKey(k), "d MMM", { locale: es })

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <button className="icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Semana anterior">
          ‹
        </button>
        <p className="text-sm">
          {fmt(w.start)} – {fmt(w.end)}
          {offset === 0 && <span className="ml-1 text-xs text-cyan">(esta semana)</span>}
        </p>
        <button className="icon-btn" onClick={() => setOffset((o) => o + 1)} aria-label="Semana siguiente" disabled={offset >= 1}>
          ›
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={`${w.completion} %`} label="Cumplido" />
        <Stat value={`${w.done.length}/${w.total}`} label="Tareas" />
        <Stat value={formatDuration(w.totalMs)} label="Trabajado" />
      </div>

      {/* Gráfico de barras por día: total (violeta) vs hechas (cian) */}
      <div className="flex h-24 items-end gap-1.5 rounded-xl border border-violet/30 bg-night/40 p-2" role="img" aria-label="Tareas por día de la semana">
        {w.days.map((d) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center gap-1" title={`${d.done}/${d.total} hechas`}>
            <div className="relative w-full flex-1">
              <div className="absolute bottom-0 w-full rounded-t bg-violet/40" style={{ height: `${(d.total / max) * 100}%` }} />
              <div className="absolute bottom-0 w-full rounded-t bg-cyan shadow-[0_0_8px_var(--color-cyan)] transition-all" style={{ height: `${(d.done / max) * 100}%` }} />
            </div>
            <span className={`text-[10px] uppercase ${d.day === today ? 'font-bold text-pink' : 'text-ice/60'}`}>{d.label.slice(0, 2)}</span>
          </div>
        ))}
      </div>
      {w.bestDay && (
        <p className="text-center text-xs text-ice/70">
          ⭐ Mejor día: <span className="capitalize text-cyan">{format(parseDayKey(w.bestDay.day), 'EEEE', { locale: es })}</span> con {w.bestDay.done} tareas hechas
        </p>
      )}

      <Block title="✅ Lo realizado" color="text-cyan">
        {w.done.length ? <TaskLines tasks={w.done} now={now} /> : <Empty>Sin tareas completadas.</Empty>}
      </Block>
      <Block title="📌 Lo que quedó pendiente" color="text-pink">
        {w.pending.length ? <TaskLines tasks={w.pending} now={now} /> : <Empty>Nada pendiente.</Empty>}
      </Block>

      <div className="flex justify-end">
        <CopyButton text={weeklySummaryText(w, now)} label="Copiar resumen semanal" />
      </div>
    </section>
  )
}
