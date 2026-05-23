import { ref, watch } from 'vue'
import { fetchDailyRecommendations } from '@/api/dailyRecommendations'
import { DAILY_RECOMMENDATIONS_PREVIEW_COUNT } from '@/constants/discover'
import { useAuthStore } from '@/stores/auth'
import type { MediaCardItem } from '@/types/media'
import {
  isLoggedInFromStorage,
  readDailyRecommendationsCache,
  resolveOfflineDailyRecommendations,
  writeDailyRecommendationsCache,
} from '@/utils/dailyRecommendationsCache'

const allTracks = ref<MediaCardItem[]>([])
const displayedTracks = ref<MediaCardItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

let loadPromise: Promise<void> | null = null
let authWatchInitialized = false
let syncedWithApi = false

function shuffleItems<T>(items: T[]) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

function pickPreviewTracks(source: MediaCardItem[], count = DAILY_RECOMMENDATIONS_PREVIEW_COUNT) {
  displayedTracks.value = shuffleItems(source).slice(0, Math.min(count, source.length))
}

function applyTracks(tracks: MediaCardItem[]) {
  allTracks.value = tracks
  pickPreviewTracks(tracks)
  error.value = null
}

function restoreOfflineRecommendations() {
  syncedWithApi = false
  applyTracks(resolveOfflineDailyRecommendations())
}

if (!isLoggedInFromStorage()) {
  restoreOfflineRecommendations()
}

export function useDailyRecommendations() {
  const authStore = useAuthStore()

  if (!authWatchInitialized) {
    authWatchInitialized = true

    watch(
      () => authStore.cookie,
      (cookie) => {
        if (cookie) {
          void load(true)
          return
        }

        restoreOfflineRecommendations()
      },
    )
  }

  async function load(force = false, afresh = false) {
    if (!authStore.isLoggedIn) {
      restoreOfflineRecommendations()
      return
    }

    if (loading.value && loadPromise) {
      return loadPromise
    }

    if (!force && syncedWithApi && allTracks.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    loadPromise = fetchDailyRecommendations({
      cookie: authStore.cookie,
      afresh,
    })
      .then((tracks) => {
        writeDailyRecommendationsCache(tracks)
        syncedWithApi = true
        applyTracks(tracks)
      })
      .catch((err: unknown) => {
        const cached = readDailyRecommendationsCache()
        if (cached.length > 0) {
          applyTracks(cached)
          error.value = err instanceof Error ? err.message : '加载每日推荐失败，已展示缓存'
          return
        }

        allTracks.value = []
        displayedTracks.value = []
        error.value = err instanceof Error ? err.message : '加载每日推荐失败'
      })
      .finally(() => {
        loading.value = false
        loadPromise = null
      })

    return loadPromise
  }

  async function refreshDailyRecommendations() {
    if (!authStore.isLoggedIn) {
      refreshPreview()
      return
    }

    await load(true, true)
  }

  function refreshPreview() {
    if (allTracks.value.length === 0) {
      restoreOfflineRecommendations()
      return
    }

    pickPreviewTracks(allTracks.value)
  }

  return {
    allTracks,
    displayedTracks,
    loading,
    error,
    load,
    refreshDailyRecommendations,
    refreshPreview,
  }
}
