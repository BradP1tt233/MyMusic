<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchArtistPageData } from '@/api/artist'
import ArtistDetailHero from '@/components/detail/ArtistDetailHero.vue'
import ArtistTrackList from '@/components/detail/ArtistTrackList.vue'
import MediaCard from '@/components/discover/MediaCard.vue'
import { usePlayer } from '@/hooks/usePlayer'
import { mediaItemsToSongs } from '@/data/catalog'
import type { ArtistPageData } from '@/types/artist'

const route = useRoute()
const router = useRouter()
const { setPlayList, playAtIndex, store } = usePlayer()

const artist = ref<ArtistPageData | null>(null)
const loading = ref(true)

const artistId = computed(() => route.params.id as string)

async function loadArtist(id: string) {
  loading.value = true

  try {
    const data = await fetchArtistPageData(id)
    if (!data) {
      router.replace({ name: 'Discover' })
      return
    }

    artist.value = data
    document.title = `${data.name} · myMusicPlayer`
  } finally {
    loading.value = false
  }
}

async function playTracks(shuffle = false) {
  if (!artist.value?.hotTracks.length) {
    return
  }

  const songs = mediaItemsToSongs(artist.value.hotTracks)
  if (songs.length === 0) {
    return
  }

  if (shuffle && store.playMode !== 'shuffle') {
    store.toggleShuffle()
  } else if (!shuffle && store.playMode === 'shuffle') {
    store.toggleShuffle()
  }

  setPlayList(songs, 0)
  await playAtIndex(0)
}

onMounted(() => {
  void loadArtist(artistId.value)
})

watch(artistId, (id) => {
  void loadArtist(id)
})
</script>

<template>
  <div v-if="artist && !loading" class="artist-page pb-8">
    <ArtistDetailHero
      :title="artist.name"
      :subtitle="artist.subtitle"
      :cover="artist.cover"
      :identify-label="artist.identifyLabel"
      @play="playTracks(false)"
      @shuffle="playTracks(true)"
    />

    <ArtistTrackList
      v-if="artist.hotTracks.length > 0"
      :tracks="artist.hotTracks"
      class="mt-8"
    />

    <section v-if="artist.albums.length > 0" class="mt-10 px-10">
      <h2 class="mb-4 text-2xl font-bold text-white">专辑</h2>
      <div class="flex gap-4 overflow-x-auto pb-1">
        <MediaCard
          v-for="item in artist.albums"
          :key="item.id"
          :item="item"
          item-type="album"
          lazy-image
        />
      </div>
    </section>

    <section v-if="artist.description" class="mt-10 px-10">
      <h2 class="mb-4 text-2xl font-bold text-white">关于</h2>
      <div class="max-w-3xl rounded-[8px] bg-[#242424] p-6">
        <p class="whitespace-pre-line text-sm leading-7 text-[#b3b3b3]">
          {{ artist.description }}
        </p>
      </div>
    </section>

    <section v-if="artist.similarArtists.length > 0" class="mt-10 px-10">
      <h2 class="mb-4 text-2xl font-bold text-white">相似艺人</h2>
      <div class="flex gap-4 overflow-x-auto pb-1">
        <MediaCard
          v-for="item in artist.similarArtists"
          :key="item.id"
          :item="item"
          variant="circle"
          item-type="artist"
          lazy-image
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.artist-page :deep(.media-carousel),
.artist-page .flex.overflow-x-auto {
  scrollbar-width: none;
}

.artist-page :deep(.media-carousel)::-webkit-scrollbar,
.artist-page .flex.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
