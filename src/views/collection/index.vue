<script setup lang="ts">
import { computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DetailHero from '@/components/detail/DetailHero.vue'
import MediaCard from '@/components/discover/MediaCard.vue'
import { useDailyRecommendations } from '@/composables/useDailyRecommendations'
import { useFeaturedCharts } from '@/composables/useFeaturedCharts'
import { useRecommendedPlaylists } from '@/composables/useRecommendedPlaylists'
import { useTopArtists } from '@/composables/useTopArtists'
import {
  DAILY_RECOMMENDATIONS_SLUG,
  DAILY_RECOMMENDATIONS_TITLE,
  FEATURED_CHARTS_SLUG,
  FEATURED_CHARTS_TITLE,
  POPULAR_ARTISTS_SLUG,
  POPULAR_ARTISTS_TITLE,
  RECOMMENDED_PLAYLISTS_SLUG,
  RECOMMENDED_PLAYLISTS_TITLE,
} from '@/constants/discover'
import { getDiscoverSection } from '@/data/catalog'

const route = useRoute()
const router = useRouter()
const { allTracks, load } = useDailyRecommendations()
const { allArtists, load: loadArtists } = useTopArtists()
const { allPlaylists, load: loadPlaylists } = useRecommendedPlaylists()
const { allCharts, load: loadCharts } = useFeaturedCharts()

const isDailyRecommendations = computed(
  () =>
    route.params.slug === DAILY_RECOMMENDATIONS_SLUG || route.params.slug === 'hot-tracks',
)

const isPopularArtists = computed(() => route.params.slug === POPULAR_ARTISTS_SLUG)

const isRecommendedPlaylists = computed(
  () =>
    route.params.slug === RECOMMENDED_PLAYLISTS_SLUG || route.params.slug === 'popular-albums',
)

const isFeaturedCharts = computed(() => route.params.slug === FEATURED_CHARTS_SLUG)

const useLazyImages = computed(
  () =>
    isDailyRecommendations.value ||
    isPopularArtists.value ||
    isRecommendedPlaylists.value ||
    isFeaturedCharts.value,
)

const staticSection = computed(() => {
  if (
    isDailyRecommendations.value ||
    isPopularArtists.value ||
    isRecommendedPlaylists.value ||
    isFeaturedCharts.value
  ) {
    return null
  }

  return getDiscoverSection(route.params.slug as string)
})

const section = computed(() => {
  if (isDailyRecommendations.value) {
    return {
      slug: DAILY_RECOMMENDATIONS_SLUG,
      title: DAILY_RECOMMENDATIONS_TITLE,
      items: allTracks.value,
      itemType: 'track' as const,
      countLabel: '首歌曲',
    }
  }

  if (isPopularArtists.value) {
    return {
      slug: POPULAR_ARTISTS_SLUG,
      title: POPULAR_ARTISTS_TITLE,
      items: allArtists.value,
      variant: 'circle' as const,
      itemType: 'artist' as const,
      countLabel: '位艺人',
    }
  }

  if (isRecommendedPlaylists.value) {
    return {
      slug: RECOMMENDED_PLAYLISTS_SLUG,
      title: RECOMMENDED_PLAYLISTS_TITLE,
      items: allPlaylists.value,
      itemType: 'playlist' as const,
      countLabel: '个歌单',
    }
  }

  if (isFeaturedCharts.value) {
    return {
      slug: FEATURED_CHARTS_SLUG,
      title: FEATURED_CHARTS_TITLE,
      items: allCharts.value,
      itemType: 'playlist' as const,
      countLabel: '个榜单',
      heroCover: allCharts.value[0]?.image ?? '',
    }
  }

  const staticData = staticSection.value
  if (!staticData) return null

  return {
    ...staticData,
    countLabel: staticData.itemType === 'track' ? '首歌曲' : '项内容',
  }
})

onMounted(() => {
  if (isDailyRecommendations.value) {
    void load()
    return
  }

  if (isPopularArtists.value) {
    void loadArtists()
    return
  }

  if (isRecommendedPlaylists.value) {
    void loadPlaylists()
    return
  }

  if (isFeaturedCharts.value) {
    void loadCharts(true)
  }
})

watchEffect(() => {
  if (route.params.slug === 'hot-tracks') {
    router.replace({ name: 'Collection', params: { slug: DAILY_RECOMMENDATIONS_SLUG } })
    return
  }

  if (route.params.slug === 'popular-albums') {
    router.replace({ name: 'Collection', params: { slug: RECOMMENDED_PLAYLISTS_SLUG } })
    return
  }

  if (route.params.slug === 'popular-radios') {
    router.replace({ name: 'Discover' })
    return
  }

  if (!section.value) {
    router.replace({ name: 'Discover' })
    return
  }

  document.title = `${section.value.title} · myMusicPlayer`
})
</script>

<template>
  <div v-if="section" class="collection-page pb-8">
    <DetailHero
      :title="section.title"
      :subtitle="`${section.items.length} ${section.countLabel}`"
      :description="`浏览 ${section.title} 的全部内容。`"
      :cover="('heroCover' in section ? section.heroCover : undefined) ?? section.items[0]?.image ?? ''"
      :type-label="isDailyRecommendations ? DAILY_RECOMMENDATIONS_TITLE : section.title"
      :cover-variant="'variant' in section && section.variant === 'circle' ? 'circle' : 'square'"
    />

    <section class="px-10 pt-2">
      <div class="flex flex-wrap gap-4">
        <MediaCard
          v-for="item in section.items"
          :key="item.id"
          :item="item"
          :variant="'variant' in section ? section.variant : undefined"
          :item-type="section.itemType"
          :lazy-image="useLazyImages"
          :playlist-items="section.itemType === 'track' ? section.items : undefined"
        />
      </div>
    </section>
  </div>
</template>
