import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { formatDuration } from '@shared/time'
import { useDaily } from '@/store/useDaily'
import { DAY_MESSAGES, TASK_MESSAGES, pick } from './messages'

const COLORS = ['#FF2A6D', '#05D9E8', '#D1F7FF', '#7700FF']
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function burstTask() {
  const star = confetti.shapeFromPath({ path: 'M5 0l1.5 3.5L10 4l-2.7 2.4L8 10 5 8l-3 2 .7-3.6L0 4l3.5-.5z' })
  confetti({ particleCount: 60, spread: 80, startVelocity: 38, origin: { y: 0.55 }, colors: COLORS, shapes: [star, 'circle'], scalar: 1.1 })
}

function burstDay() {
  const end = Date.now() + 2200
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS })
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  confetti({ particleCount: 150, spread: 120, startVelocity: 45, origin: { y: 0.45 }, colors: COLORS, scalar: 1.2 })
}

/** Estrella SVG con brillo neón. */
function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="drop-shadow-[0_0_18px_#FF2A6D]">
      <defs>
        <linearGradient id="star-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D1F7FF" />
          <stop offset="0.45" stopColor="#05D9E8" />
          <stop offset="1" stopColor="#FF2A6D" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.8l3 6.2 6.8.9-5 4.7 1.3 6.8L12 17.1l-6.1 3.3 1.3-6.8-5-4.7L9 8z"
        fill="url(#star-grad)"
        stroke="#D1F7FF"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Capa de recompensas: estrella animada, rayos, confeti y felicitación. */
export function RewardLayer() {
  const reward = useDaily((s) => s.reward)
  const clearReward = useDaily((s) => s.clearReward)
  const isDay = reward?.kind === 'day'
  const message = useMemo(() => (reward ? pick(isDay ? DAY_MESSAGES : TASK_MESSAGES) : ''), [reward, isDay])

  useEffect(() => {
    if (!reward) return
    if (!reducedMotion()) (isDay ? burstDay : burstTask)()
    const t = setTimeout(clearReward, isDay ? 3800 : 2400)
    return () => clearTimeout(t)
  }, [reward, isDay, clearReward])

  return (
    <AnimatePresence>
      {reward && (
        <motion.div
          key={reward.id}
          className="pointer-events-auto fixed inset-0 z-50 grid place-items-center bg-night/40 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearReward}
          role="status"
          aria-live="polite"
        >
          <div className="relative flex flex-col items-center gap-3 text-center">
            {/* Rayos giratorios detrás de la estrella */}
            <motion.div
              className="absolute top-[-40px] h-64 w-64 rounded-full opacity-70"
              style={{
                background:
                  'repeating-conic-gradient(from 0deg, rgba(5,217,232,.35) 0deg 8deg, transparent 8deg 22deg, rgba(255,42,109,.35) 22deg 30deg, transparent 30deg 45deg)',
                maskImage: 'radial-gradient(circle, black 20%, transparent 70%)'
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 180 }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -180, y: 60 }}
              animate={{ scale: [0, 1.35, 1], rotate: [-180, 15, 0], y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Star size={isDay ? 170 : 130} />
              </motion.div>
            </motion.div>

            {isDay && (
              <div className="absolute top-0 flex w-80 justify-between" aria-hidden>
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.15, type: 'spring' }}
                  >
                    <Star size={60} />
                  </motion.div>
                ))}
              </div>
            )}

            <motion.p
              className="relative px-4 text-2xl font-extrabold text-ice [text-shadow:0_0_12px_#FF2A6D,0_0_24px_#7700FF]"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring' }}
            >
              {message}
            </motion.p>
            {reward.task && (
              <motion.p
                className="relative text-sm text-cyan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {reward.task.emoji} {reward.task.title}
                {reward.task.durationMs > 0 && ` · ${formatDuration(reward.task.durationMs)}`}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
