<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchChartDetail } from '@/api/chartDetail'
import { fetchChartListTracks } from '@/api/chartList'
import { FEATURED_CHARTS_LIST_LIMIT } from '@/constants/discover'
import DetailHero from '@/components/detail/DetailHero.vue'
import MediaCard from '@/components/discover/MediaCard.vue'
import { parseChartCardId } from '@/utils/chart'
import type { MediaCardItem } from '@/types/media'

const route = useRoute()
const router = useRouter()

const chart = ref<MediaCardItem | null>(null)
const tracks = ref<MediaCardItem[]>([])
const loading = ref(true)

const preset = computed(() => parseChartCardId(route.params.id as string))

onMounted(async () => {
  const chartPreset = preset.value
  if (!chartPreset) {
    router.replace({ name: 'Discover' })
    return
  }

  loading.value = true

  try {
    const [detail, list] = await Promise.all([
      fetchChartDetail(chartPreset),
      fetchChartListTracks({
        ...chartPreset,
        limit: FEATURED_CHARTS_LIST_LIMIT,
        offset: 0,
      }),
    ])

    chart.value = detail
    tracks.value = list
  } finally {
    loading.value = false
  }
})

watchEffect(() => {
  if (!preset.value) {
    return
  }

  document.title = `${chart.value?.title ?? preset.value.fallbackTitle} · myMusicPlayer`
})
</script>

<template>
  <div v-if="chart && !loading" class="chart-page pb-8">
    <DetailHero
      :title="chart.title"
      :subtitle="`${tracks.length} 首歌曲`"
      :description="chart.subtitle ?? '浏览该排行榜的全部歌曲。'"
      :cover="chart.image"
      :type-label="chart.title"
    />

    <section class="px-10 pt-2">
      <div class="flex flex-wrap gap-4">
        <MediaCard
          v-for="item in tracks"
          :key="item.id"
          :item="item"
          item-type="track"
          lazy-image
          :playlist-items="tracks"
        />
      </div>
    </section>
  </div>
</template>
