/** Fondo móvil synthwave: cielo degradado, sol con franjas, rejilla en perspectiva y partículas. */
export function AnimatedBackground({ animated }: { animated: boolean }) {
  return (
    <div className={`bg-scene ${animated ? '' : 'bg-paused'}`} aria-hidden>
      <div className="bg-sun" />
      <div className="bg-grid" />
      <div className="bg-stars" />
    </div>
  )
}
