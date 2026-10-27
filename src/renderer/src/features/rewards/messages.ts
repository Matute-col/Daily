export const TASK_MESSAGES = [
  '¡Excelente trabajo!',
  '¡Una menos, sigue así!',
  '¡Imparable!',
  '¡Lo lograste!',
  '¡Eso es progreso real!',
  '¡Brillas como una estrella!',
  '¡Tarea aplastada!',
  '¡Vas con todo!',
  '¡Qué nivel!',
  '¡Misión cumplida!'
]

export const DAY_MESSAGES = [
  '¡Día completado! Te ganaste un descanso.',
  '¡Todo listo! Hoy fuiste una leyenda.',
  '¡100 %! Mañana la daily va a ser épica.',
  '¡Lista vacía, mente tranquila!'
]

export const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]
