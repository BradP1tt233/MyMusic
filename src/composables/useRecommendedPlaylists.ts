import { ref } from 'vue'
import { fetchPersonalizedPlaylists } from '@/api/personalizedPlaylists'
import {
  RECOMMENDED_PLAYLISTS_DEFAULT_LIMIT,
  RECOMMENDED_PLAYLISTS_PREVIEW_COUNT,
} from '@/constants/discover'
import type { MediaCardItem } from '@/types/media'

const allPlaylists = ref<MediaCardItem[]>([])
const displayedPlaylists = ref<MediaCardItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

let loadPromise: Promise<void> | null = null

function pickPreviewPlaylists(
  source: MediaCardItem[],
  count = RECOMMENDED_PLAYLISTS_PREVIEW_COUNT,
) {
  displayedPlaylists.value = source.slice(0, Math.min(count, source.length))
}

export function useRecommendedPlaylists() {
  async function load(force = false, limit = RECOMMENDED_PLAYLISTS_DEFAULT_LIMIT) {
    if (loading.value && loadPromise) {
      return loadPromise
    }

    if (!force && allPlaylists.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    loadPromise = fetchPersonalizedPlaylists({ limit })
      .then((playlists) => {
        allPlaylists.value = playlists
        pickPreviewPlaylists(playlists)
      })
      .catch((err: unknown) => {
        error.value = err instanceof Error ? err.message : '加载推荐歌单失败'
      })
      .finally(() => {
        loading.value = false
        loadPromise = null
      })

    return loadPromise
  }

  return {
    allPlaylists,
    displayedPlaylists,
    loading,
    error,
    load,
  }
}
