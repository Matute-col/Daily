import { useEffect, useState } from 'react'

/** Devuelve Date.now() actualizado cada `ms` mientras `active` sea true. */
export function useNow(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [active, ms])
  return now
}
