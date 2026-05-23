<script setup lang="ts">
import { computed, onMounted } from 'vue'
import MediaSection from '@/components/discover/MediaSection.vue'
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

const { displayedTracks, load, refreshDailyRecommendations } = useDailyRecommendations()
const { displayedArtists, load: loadArtists } = useTopArtists()
const { displayedPlaylists, load: loadPlaylists } = useRecommendedPlaylists()
const { displayedCharts, load: loadCharts } = useFeaturedCharts()

const dailySection = computed(() => ({
  slug: DAILY_RECOMMENDATIONS_SLUG,
  title: DAILY_RECOMMENDATIONS_TITLE,
  itemType: 'track' as const,
}))

const artistsSection = computed(() => ({
  slug: POPULAR_ARTISTS_SLUG,
  title: POPULAR_ARTISTS_TITLE,
  items: displayedArtists.value,
  variant: 'circle' as const,
  itemType: 'artist' as const,
}))

const playlistsSection = computed(() => ({
  slug: RECOMMENDED_PLAYLISTS_SLUG,
  title: RECOMMENDED_PLAYLISTS_TITLE,
  items: displayedPlaylists.value,
  itemType: 'playlist' as const,
}))

const chartsSection = computed(() => ({
  slug: FEATURED_CHARTS_SLUG,
  title: FEATURED_CHARTS_TITLE,
  items: displayedCharts.value,
  itemType: 'playlist' as const,
}))

onMounted(() => {
  void load()
  void loadArtists()
  void loadPlaylists()
  void loadCharts()
})

async function handleRefresh() {
  await refreshDailyRecommendations()
}
</script>

<template>
  <div class="discover-page flex flex-col gap-8 px-10 py-6">
    <MediaSection
      :title="dailySection.title"
      :slug="dailySection.slug"
      :items="displayedTracks"
      :item-type="dailySection.itemType"
      show-refresh
      @refresh="handleRefresh"
    />

    <MediaSection
      :title="artistsSection.title"
      :slug="artistsSection.slug"
      :items="artistsSection.items"
      :variant="artistsSection.variant"
      :item-type="artistsSection.itemType"
    />

    <MediaSection
      :title="playlistsSection.title"
      :slug="playlistsSection.slug"
      :items="playlistsSection.items"
      :item-type="playlistsSection.itemType"
    />

    <MediaSection
      :title="chartsSection.title"
      :slug="chartsSection.slug"
      :items="chartsSection.items"
      :item-type="chartsSection.itemType"
    />
  </div>
</template>
