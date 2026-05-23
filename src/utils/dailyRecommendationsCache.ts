import { dailyRecommendationFallback } from '@/data/catalog'
import type { MediaCardItem } from '@/types/media'

const DAILY_RECOMMENDATIONS_CACHE_KEY = 'mymusic_daily_recommendations_cache'
const AUTH_COOKIE_KEY = 'mymusic_auth_cookie'

export function isLoggedInFromStorage() {
  try {
    return Boolean(localStorage.getItem(AUTH_COOKIE_KEY))
  } catch {
    return false
  }
}

export function readDailyRecommendationsCache(): MediaCardItem[] {
  try {
    const raw = localStorage.getItem(DAILY_RECOMMENDATIONS_CACHE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is MediaCardItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.image === 'string',
    )
  } catch {
    return []
  }
}

export function writeDailyRecommendationsCache(items: MediaCardItem[]) {
  try {
    localStorage.setItem(DAILY_RECOMMENDATIONS_CACHE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage failures
  }
}

/** 未登录时优先展示上次缓存，无缓存则用本地兜底数据 */
export function resolveOfflineDailyRecommendations(): MediaCardItem[] {
  const cached = readDailyRecommendationsCache()
  if (cached.length > 0) {
    return cached
  }

  return [...dailyRecommendationFallback]
}
