import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  title: string
  onClose(): void
  children: ReactNode
}

/** Diálogo accesible: Escape cierra, foco inicial dentro, clic fuera cierra. */
export function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  // Ref para que el efecto no se re-ejecute (y robe el foco) en cada render del padre.
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('input,button,textarea,select')?.focus())
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open])

  // Portal al body: evita que transforms de ancestros (animaciones) rompan el position: fixed.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-night/80 p-3 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass w-full max-w-md rounded-2xl p-4"
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cyan">{title}</h2>
              <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
