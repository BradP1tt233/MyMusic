<script setup lang="ts">
import { computed } from 'vue'
import { isImageCover } from '@/utils/libraryPlaylist'

const props = defineProps<{
  title: string
  subtitle: string
  cover: string
  description?: string
  typeLabel?: string
  showCollect?: boolean
  isCollected?: boolean
  actionBusy?: boolean
}>()

defineEmits<{
  play: []
  shuffle: []
  collect: []
}>()

const useImage = computed(() => isImageCover(props.cover))
</script>

<template>
  <header class="playlist-detail-hero relative overflow-hidden px-10 pb-6 pt-6">
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1e3264]/70 to-[#121212]"
      aria-hidden="true"
    />

    <div class="relative flex items-end gap-6">
      <div class="h-52 w-52 shrink-0 overflow-hidden rounded-[6px] shadow-2xl">
        <img
          v-if="useImage"
          :src="cover"
          :alt="title"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="h-full w-full"
          :style="{ background: cover }"
          aria-hidden="true"
        />
      </div>

      <div class="min-w-0 flex-1 pb-2">
        <p class="mb-2 text-xs font-bold uppercase tracking-wide text-white">
          {{ typeLabel ?? '歌单' }}
        </p>
        <h1 class="line-clamp-2 text-5xl font-black text-white">{{ title }}</h1>
        <p v-if="description" class="mt-3 line-clamp-2 text-sm text-[#b3b3b3]">
          {{ description }}
        </p>
        <p class="mt-3 text-sm text-[#b3b3b3]">{{ subtitle }}</p>

        <div class="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            data-testid="playlist-play-button"
            aria-label="播放歌单"
            class="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-[#1ed760] text-black transition-transform duration-[220ms] ease-in hover:scale-[1.04] active:scale-[0.96] focus-visible:outline-none"
            @click="$emit('play')"
          >
            <svg viewBox="0 0 16 16" class="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
            </svg>
          </button>

          <button
            type="button"
            data-testid="playlist-shuffle-button"
            aria-label="随机播放歌单"
            class="cursor-pointer border-0 bg-transparent text-sm font-bold text-[#b3b3b3] transition-colors duration-[220ms] ease-in hover:text-white focus-visible:outline-none"
            @click="$emit('shuffle')"
          >
            随机播放
          </button>

          <button
            v-if="showCollect"
            type="button"
            data-testid="playlist-collect-button"
            :aria-label="isCollected ? '已在音乐库' : '收藏歌单'"
            :disabled="actionBusy || isCollected"
            class="cursor-pointer rounded-full border border-[#878787] px-4 py-2 text-sm font-bold transition-colors duration-[220ms] ease-in focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
            :class="isCollected ? 'text-[#1ed760] border-[#1ed760]' : 'text-white hover:border-white'"
            @click="$emit('collect')"
          >
            {{ isCollected ? '已收藏' : '收藏歌单' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
