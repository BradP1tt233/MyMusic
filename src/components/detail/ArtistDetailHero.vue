<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  cover: string
  typeLabel?: string
  identifyLabel?: string
  playAllDisabled?: boolean
}>()

defineEmits<{
  'play-all': []
  shuffle: []
}>()
</script>

<template>
  <header class="artist-detail-hero relative overflow-hidden px-10 pb-6 pt-6">
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#5038a0]/60 to-[#121212]"
      aria-hidden="true"
    />

    <div class="relative flex items-end gap-6">
      <div class="h-52 w-52 shrink-0 overflow-hidden rounded-full shadow-2xl">
        <img :src="cover" :alt="title" class="h-full w-full object-cover" />
      </div>

      <div class="min-w-0 flex-1 pb-2">
        <p class="mb-2 text-xs font-bold uppercase tracking-wide text-white">
          {{ typeLabel ?? '艺人' }}
        </p>
        <h1 class="truncate text-5xl font-black text-white">{{ title }}</h1>
        <p v-if="identifyLabel" class="mt-2 text-sm text-[#b3b3b3]">{{ identifyLabel }}</p>
        <p class="mt-3 text-sm text-[#b3b3b3]">{{ subtitle }}</p>

        <div class="mt-6 flex items-center gap-6">
          <button
            type="button"
            data-testid="artist-play-all-button"
            aria-label="播放全部"
            :disabled="playAllDisabled"
            class="flex h-14 cursor-pointer items-center gap-2 rounded-full border-0 bg-[#1ed760] pl-5 pr-6 text-base font-bold text-black transition-transform duration-[220ms] ease-in hover:scale-[1.04] active:scale-[0.96] focus-visible:outline-none disabled:cursor-default disabled:opacity-50 disabled:hover:scale-100"
            @click="$emit('play-all')"
          >
            <svg viewBox="0 0 16 16" class="h-5 w-5 shrink-0 fill-current" aria-hidden="true">
              <path
                d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z"
              />
            </svg>
            播放全部
          </button>

          <button
            type="button"
            data-testid="artist-shuffle-button"
            aria-label="随机播放艺人歌曲"
            :disabled="playAllDisabled"
            class="cursor-pointer border-0 bg-transparent text-sm font-bold text-[#b3b3b3] transition-colors duration-[220ms] ease-in hover:text-white focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
            @click="$emit('shuffle')"
          >
            随机播放
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
