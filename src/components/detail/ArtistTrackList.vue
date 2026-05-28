<script setup lang="ts">
import { usePlayer } from '@/hooks/usePlayer'
import { mediaItemsToSongs } from '@/data/catalog'
import { formatDuration } from '@/utils/time'
import type { MediaCardItem } from '@/types/media'

const props = withDefaults(
  defineProps<{
    tracks: MediaCardItem[]
    title?: string
    showTitle?: boolean
  }>(),
  {
    showTitle: true,
  },
)

const { setPlayList, playAtIndex } = usePlayer()

async function playTrack(index: number) {
  const songs = mediaItemsToSongs(props.tracks)
  if (songs.length === 0) {
    return
  }

  setPlayList(songs, index)
  await playAtIndex(index)
}
</script>

<template>
  <section class="artist-track-list px-10 pt-2">
    <h2 v-if="showTitle" class="mb-4 text-2xl font-bold text-white">{{ title ?? '热门歌曲' }}</h2>

    <div
      class="track-list-header mb-2 hidden grid-cols-[16px_4fr_3fr_minmax(56px,1fr)] gap-4 border-b border-[rgba(255,255,255,0.1)] px-2 pb-2 text-xs font-normal uppercase tracking-wide text-[#b3b3b3] md:grid"
    >
      <span>#</span>
      <span>标题</span>
      <span>专辑</span>
      <span class="text-right">时长</span>
    </div>

    <div class="flex flex-col">
      <button
        v-for="(track, index) in tracks"
        :key="track.id"
        type="button"
        class="track-row group grid cursor-pointer grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-4 rounded-[4px] border-0 bg-transparent px-2 py-2 text-left transition-colors duration-[220ms] ease-in hover:bg-[rgba(255,255,255,0.1)] md:grid-cols-[16px_4fr_3fr_minmax(56px,1fr)]"
        :aria-label="`播放 ${track.title}`"
        @click="playTrack(index)"
      >
        <span class="text-sm text-[#b3b3b3] group-hover:hidden">{{ index + 1 }}</span>
        <span class="hidden text-[#1ed760] group-hover:block">
          <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
          </svg>
        </span>

        <div class="flex min-w-0 items-center gap-3">
          <img
            :src="track.image"
            :alt="track.title"
            class="h-10 w-10 shrink-0 rounded-[2px] object-cover"
            loading="lazy"
          />
          <div class="min-w-0">
            <p class="truncate text-base text-white">{{ track.title }}</p>
            <p class="truncate text-sm text-[#b3b3b3] md:hidden">{{ track.albumName ?? track.subtitle }}</p>
          </div>
        </div>

        <p class="hidden truncate text-sm text-[#b3b3b3] md:block">
          {{ track.albumName ?? '—' }}
        </p>

        <p class="text-sm text-[#b3b3b3] md:text-right">
          {{ formatDuration(track.duration ?? 0) }}
        </p>
      </button>
    </div>
  </section>
</template>
