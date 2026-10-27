import type { DailyApi } from '../shared/types'

declare global {
  interface Window {
    daily: DailyApi
  }
}

export {}
