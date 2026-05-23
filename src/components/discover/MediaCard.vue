<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchArtistHotTracks } from '@/api/artist'
import { fetchPlaylistTracksForPlay } from '@/api/playlist'
import LazyImage from '@/components/common/LazyImage.vue'
import { usePlayer } from '@/hooks/usePlayer'
import { mediaItemsToSongs } from '@/data/catalog'
import type { MediaCardItem, MediaItemType } from '@/types/media'
import { getMediaItemRoute } from '@/utils/mediaRoutes'

const props = withDefaults(
  defineProps<{
    item: MediaCardItem
    variant?: 'square' | 'circle'
    itemType: MediaItemType
    playlistItems?: MediaCardItem[]
    lazyImage?: boolean
  }>(),
  {
    variant: 'square',
    lazyImage: false,
  },
)

const router = useRouter()
const { setPlayList, playAtIndex } = usePlayer()
const playingArtist = ref(false)
const playingPlaylist = ref(false)

const coverRadius = props.variant === 'circle' ? 'rounded-full' : 'rounded-[6px]'

const playButtonLabel = computed(() => {
  if (props.itemType === 'artist') {
    return `播放 ${props.item.title} 的热门歌曲`
  }

  if (props.itemType === 'playlist') {
    return `播放 ${props.item.title} 歌单`
  }

  return `播放 ${props.item.title}`
})

const canPlayFromCard = computed(() => {
  if (props.itemType === 'track' || props.itemType === 'artist') {
    return true
  }

  if (props.itemType === 'playlist') {
    return /^\d+$/.test(props.item.id)
  }

  return false
})

async function playTrackItems() {
  const songs = mediaItemsToSongs(props.playlistItems ?? [props.item])
  const index = songs.findIndex((song) => song.id === props.item.id)
  if (index === -1) {
    return
  }

  setPlayList(songs, index)
  await playAtIndex(index)
}

async function handleCardClick() {
  if (props.itemType === 'track') {
    await playTrackItems()
    return
  }

  const route = getMediaItemRoute(props.item, props.itemType)
  if (route) {
    await router.push(route)
  }
}

async function handlePlayClick() {
  if (props.itemType === 'track') {
    await playTrackItems()
    return
  }

  if (props.itemType === 'playlist') {
    if (!/^\d+$/.test(props.item.id)) {
      return
    }

    if (playingPlaylist.value) {
      return
    }

    playingPlaylist.value = true

    try {
      const tracks = await fetchPlaylistTracksForPlay(props.item.id)
      if (tracks.length === 0) {
        return
      }

      const songs = mediaItemsToSongs(tracks)
      setPlayList(songs, 0)
      await playAtIndex(0)
    } finally {
      playingPlaylist.value = false
    }

    return
  }

  if (props.itemType !== 'artist') {
    return
  }

  if (playingArtist.value) {
    return
  }

  playingArtist.value = true

  try {
    const tracks = await fetchArtistHotTracks(props.item.id)
    if (tracks.length === 0) {
      return
    }

    const songs = mediaItemsToSongs(tracks)
    setPlayList(songs, 0)
    await playAtIndex(0)
  } finally {
    playingArtist.value = false
  }
}
</script>

<template>
  <div
    data-encore-id="card"
    class="media-card group/card w-[178px] shrink-0 rounded-[6px] p-3 transition-[background-color] duration-[220ms] ease-[cubic-bezier(0.3,0,0.7,1)] hover:bg-[rgba(255,255,255,0.1)]"
    :class="{ 'media-card--lazy': lazyImage }"
  >
    <div class="flex w-full flex-col gap-2">
      <div class="relative aspect-square w-full">
        <button
          type="button"
          class="media-card-cover-button absolute inset-0 z-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
          :aria-label="`${item.title}${item.subtitle ? ` • ${item.subtitle}` : ''}`"
          @click="handleCardClick"
        >
          <div
            class="media-card-cover relative h-full w-full overflow-hidden shadow-none transition-[box-shadow] duration-[220ms] ease-[cubic-bezier(0.3,0,0.7,1)] group-hover/card:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            :class="coverRadius"
            :style="item.color ? { backgroundColor: item.color } : undefined"
          >
            <LazyImage
              v-if="lazyImage"
              :src="item.image"
              :alt="item.title"
              :img-class="coverRadius"
            />
            <img
              v-else
              :src="item.image"
              :alt="item.title"
              class="h-full w-full object-cover"
              :class="coverRadius"
              loading="lazy"
              decoding="async"
            />
          </div>
        </button>

        <button
          v-if="canPlayFromCard"
          type="button"
          data-testid="play-button"
          :aria-label="playButtonLabel"
          :disabled="playingArtist || playingPlaylist"
          class="media-card-play absolute bottom-2 right-2 z-[1] translate-y-2 cursor-pointer border-0 bg-transparent p-0 opacity-0 transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.3,0,0.7,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100"
          @click.stop="handlePlayClick"
        >
          <span
            class="flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-none transition-[transform,background-color] duration-[220ms] ease-[cubic-bezier(0.3,0,0.7,1)] hover:scale-[1.04] active:scale-[0.96]"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
            </svg>
          </span>
        </button>
      </div>

      <button
        type="button"
        class="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left"
        :aria-label="`${item.title}${item.subtitle ? ` • ${item.subtitle}` : ''}`"
        @click="handleCardClick"
      >
        <p
          :id="`card-title-${item.id}`"
          class="truncate text-base font-normal text-white"
        >
          {{ item.title }}
        </p>
        <p
          v-if="item.subtitle"
          :id="`card-subtitle-${item.id}`"
          class="truncate text-sm text-[#b3b3b3]"
        >
          {{ item.subtitle }}
        </p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.media-card--lazy {
  content-visibility: auto;
  contain-intrinsic-size: 178px 260px;
}
</style>
