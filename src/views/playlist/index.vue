<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPlaylistPageData } from '@/api/playlist'
import ArtistTrackList from '@/components/detail/ArtistTrackList.vue'
import PlaylistDetailHero from '@/components/detail/PlaylistDetailHero.vue'
import { useLibraryPlaylists } from '@/composables/useLibraryPlaylists'
import { usePlayer } from '@/hooks/usePlayer'
import { getPlaylistCatalogItem, mediaItemsToSongs } from '@/data/catalog'
import type { PlaylistPageData } from '@/types/playlist'

const route = useRoute()
const router = useRouter()
const { playlists } = useLibraryPlaylists()
const { setPlayList, playAtIndex, store } = usePlayer()

const playlist = ref<PlaylistPageData | null>(null)
const loading = ref(true)

const playlistId = computed(() => route.params.id as string)

function buildLibraryPlaylistPage(id: string): PlaylistPageData | null {
  const libraryItem = playlists.value.find((entry) => entry.id === id)
  if (!libraryItem) {
    return null
  }

  return {
    id: libraryItem.id,
    name: libraryItem.title,
    cover: libraryItem.cover,
    description: libraryItem.description ?? libraryItem.subtitle,
    creatorName: '你',
    trackCount: 0,
    subtitle: libraryItem.subtitle,
    tracks: [],
  }
}

function buildCatalogPlaylistPage(id: string): PlaylistPageData | null {
  const catalogItem = getPlaylistCatalogItem(id)
  if (!catalogItem) {
    return null
  }

  return {
    id: catalogItem.id,
    name: catalogItem.title,
    cover: catalogItem.cover,
    description: catalogItem.description ?? catalogItem.subtitle ?? '',
    creatorName: 'myMusicPlayer',
    trackCount: 0,
    subtitle: catalogItem.subtitle ?? '歌单',
    tracks: [],
  }
}

async function loadPlaylist(id: string) {
  loading.value = true

  try {
    const apiData = await fetchPlaylistPageData(id)
    if (apiData) {
      playlist.value = apiData
      document.title = `${apiData.name} · myMusicPlayer`
      return
    }

    const libraryData = buildLibraryPlaylistPage(id)
    if (libraryData) {
      playlist.value = libraryData
      document.title = `${libraryData.name} · myMusicPlayer`
      return
    }

    const catalogData = buildCatalogPlaylistPage(id)
    if (catalogData) {
      playlist.value = catalogData
      document.title = `${catalogData.name} · myMusicPlayer`
      return
    }

    router.replace({ name: 'Discover' })
  } finally {
    loading.value = false
  }
}

async function playTracks(shuffle = false) {
  if (!playlist.value?.tracks.length) {
    return
  }

  const songs = mediaItemsToSongs(playlist.value.tracks)
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
  void loadPlaylist(playlistId.value)
})

watch(playlistId, (id) => {
  void loadPlaylist(id)
})
</script>

<template>
  <div v-if="playlist && !loading" class="playlist-page pb-8">
    <PlaylistDetailHero
      :title="playlist.name"
      :subtitle="playlist.subtitle"
      :description="playlist.description"
      :cover="playlist.cover"
      @play="playTracks(false)"
      @shuffle="playTracks(true)"
    />

    <ArtistTrackList
      v-if="playlist.tracks.length > 0"
      :tracks="playlist.tracks"
      :show-title="false"
      class="mt-8"
    />

    <section v-else class="px-10 pt-8">
      <p class="text-sm text-[#b3b3b3]">该歌单暂无可播放的歌曲。</p>
    </section>
  </div>
</template>
