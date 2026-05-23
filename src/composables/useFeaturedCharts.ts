import { ref } from 'vue'
import { fetchFeaturedChartCards } from '@/api/chartDetail'
import { FEATURED_CHARTS_PREVIEW_COUNT } from '@/constants/discover'
import { isChartCardId } from '@/utils/chart'
import type { MediaCardItem } from '@/types/media'

const allCharts = ref<MediaCardItem[]>([])
const displayedCharts = ref<MediaCardItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

let loadPromise: Promise<void> | null = null
let syncedWithApi = false

function pickPreviewCharts(source: MediaCardItem[], count = FEATURED_CHARTS_PREVIEW_COUNT) {
  displayedCharts.value = source.slice(0, Math.min(count, source.length))
}

export function useFeaturedCharts() {
  async function load(force = false) {
    if (loading.value && loadPromise) {
      return loadPromise
    }

    if (!force && syncedWithApi) {
      return
    }

    loading.value = true
    error.value = null

    loadPromise = fetchFeaturedChartCards()
      .then((charts) => {
        allCharts.value = charts
        pickPreviewCharts(charts)
        syncedWithApi = charts.some((item) => isChartCardId(item.id))
      })
      .catch((err: unknown) => {
        error.value = err instanceof Error ? err.message : '加载精选排行榜失败'
      })
      .finally(() => {
        loading.value = false
        loadPromise = null
      })

    return loadPromise
  }

  return {
    allCharts,
    displayedCharts,
    loading,
    error,
    load,
  }
}
