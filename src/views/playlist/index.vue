<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPlaylistPageData } from '@/api/playlist'
import { attachSongDetailsToItems } from '@/api/songDetail'
import { attachSongUrlsV1ToItems } from '@/api/songUrl'
import ArtistTrackList from '@/components/detail/ArtistTrackList.vue'
import PlaylistDetailHero from '@/components/detail/PlaylistDetailHero.vue'
import { useLibraryPlaylists } from '@/composables/useLibraryPlaylists'
import { usePlayer } from '@/hooks/usePlayer'
import { useAuthStore } from '@/stores/auth'
import { getPlaylistCatalogItem, mediaItemsToSongs } from '@/data/catalog'
import { isRemotePlaylistId, resolveRemotePlaylistId } from '@/utils/libraryPlaylist'
import type { PlaylistPageData } from '@/types/playlist'
import type { MediaCardItem } from '@/types/media'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const {
  getPlaylistById,
  buildLibraryPlaylistPage,
  collectPlaylist,
  isPlaylistInLibrary,
} = useLibraryPlaylists()
const { setPlayList, playAtIndex, store } = usePlayer()

const playlist = ref<PlaylistPageData | null>(null)
const loading = ref(true)
const actionBusy = ref(false)

const playlistId = computed(() => route.params.id as string)

const libraryItem = computed(() => getPlaylistById(playlistId.value))

const showCollect = computed(
  () =>
    !libraryItem.value &&
    isRemotePlaylistId(playlistId.value) &&
    Boolean(playlist.value),
)

const isCollected = computed(() => isPlaylistInLibrary(playlistId.value))

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

async function fetchRemotePlaylistPage(remoteId: string, libraryData?: PlaylistPageData | null) {
  const apiData = await fetchPlaylistPageData(remoteId)
  if (!apiData) {
    return null
  }

  if (libraryData) {
    return {
      ...apiData,
      id: libraryData.id,
      name: libraryData.name,
      description: libraryData.description,
      subtitle: libraryData.subtitle,
    }
  }

  return apiData
}

async function finalizePlaylistTracks(tracks: MediaCardItem[]) {
  if (tracks.length === 0) {
    return tracks
  }

  const withUrls = await attachSongUrlsV1ToItems(tracks)
  return attachSongDetailsToItems(withUrls)
}

async function applyPlaylistPage(page: PlaylistPageData) {
  const tracks = await finalizePlaylistTracks(page.tracks)

  playlist.value = {
    ...page,
    tracks,
    trackCount: tracks.length > 0 ? tracks.length : page.trackCount,
  }
  document.title = `${page.name} · myMusicPlayer`
}

async function loadPlaylist(id: string) {
  loading.value = true

  try {
    const libraryData = buildLibraryPlaylistPage(id)
    if (libraryData) {
      const item = libraryItem.value
      const remoteId = item ? resolveRemotePlaylistId(item) : undefined

      if (
        remoteId &&
        libraryData.tracks.length === 0 &&
        (item?.kind === 'collected' || item?.kind === 'created')
      ) {
        const apiData = await fetchRemotePlaylistPage(remoteId, libraryData)
        if (apiData) {
          await applyPlaylistPage(apiData)
          return
        }
      }

      await applyPlaylistPage(libraryData)
      return
    }

    const apiData = await fetchPlaylistPageData(id)
    if (apiData) {
      await applyPlaylistPage(apiData)
      return
    }

    const catalogData = buildCatalogPlaylistPage(id)
    if (catalogData) {
      await applyPlaylistPage(catalogData)
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

async function handleCollect() {
  if (!playlist.value || actionBusy.value || isCollected.value) {
    return
  }

  actionBusy.value = true

  try {
    const collected = await collectPlaylist(
      {
        id: playlist.value.id,
        title: playlist.value.name,
        subtitle: playlist.value.subtitle,
        image: playlist.value.cover,
        type: 'playlist',
      },
      {
        cookie: authStore.isLoggedIn ? authStore.cookie : undefined,
        sourcePlaylistId: playlist.value.id,
      },
    )

    if (!collected) {
      return
    }

    await router.push({ name: 'Playlist', params: { id: collected.id } })
  } finally {
    actionBusy.value = false
  }
}

watch(
  () => libraryItem.value?.tracks,
  () => {
    if (libraryItem.value) {
      const page = buildLibraryPlaylistPage(playlistId.value)
      if (page && playlist.value?.id === page.id) {
        const current = playlist.value
        void (async () => {
          const tracks = await finalizePlaylistTracks(page.tracks)
          playlist.value = {
            ...current,
            tracks,
            subtitle: page.subtitle,
            cover: page.cover,
            trackCount: tracks.length,
          }
        })()
      }
    }
  },
  { deep: true },
)

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
      :show-collect="showCollect"
      :is-collected="isCollected"
      :action-busy="actionBusy"
      @play="playTracks(false)"
      @shuffle="playTracks(true)"
      @collect="handleCollect"
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
