import { ref } from 'vue'
import { fetchTopArtists } from '@/api/topArtists'
import {
  POPULAR_ARTISTS_DEFAULT_LIMIT,
  POPULAR_ARTISTS_PREVIEW_COUNT,
} from '@/constants/discover'
import type { MediaCardItem } from '@/types/media'

const allArtists = ref<MediaCardItem[]>([])
const displayedArtists = ref<MediaCardItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

let loadPromise: Promise<void> | null = null

function pickPreviewArtists(source: MediaCardItem[], count = POPULAR_ARTISTS_PREVIEW_COUNT) {
  displayedArtists.value = source.slice(0, Math.min(count, source.length))
}

export function useTopArtists() {
  async function load(force = false, limit = POPULAR_ARTISTS_DEFAULT_LIMIT) {
    if (loading.value && loadPromise) {
      return loadPromise
    }

    if (!force && allArtists.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null

    loadPromise = fetchTopArtists({ limit, offset: 0 })
      .then((artists) => {
        allArtists.value = artists
        pickPreviewArtists(artists)
      })
      .catch((err: unknown) => {
        error.value = err instanceof Error ? err.message : '加载热门歌手失败'
      })
      .finally(() => {
        loading.value = false
        loadPromise = null
      })

    return loadPromise
  }

  return {
    allArtists,
    displayedArtists,
    loading,
    error,
    load,
  }
}
