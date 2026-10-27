import { useState } from 'react'
import { CopyIcon } from './icons'

/** Copia texto al portapapeles (vía proceso principal) y muestra confirmación. */
export function CopyButton({ text, label = 'Copiar para la daily' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="btn-ghost flex items-center gap-1.5"
      onClick={async () => {
        await window.daily.copyText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
    >
      <CopyIcon width={14} height={14} />
      <span aria-live="polite">{copied ? '¡Copiado!' : label}</span>
    </button>
  )
}
