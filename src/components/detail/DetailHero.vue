<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  description?: string
  cover: string
  typeLabel: string
  coverVariant?: 'square' | 'circle'
  coverIsGradient?: boolean
  showPlayAll?: boolean
  playAllDisabled?: boolean
}>()

defineEmits<{
  'play-all': []
}>()
</script>

<template>
  <header class="detail-hero relative overflow-hidden px-10 pb-6 pt-6">
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-[#121212]"
      aria-hidden="true"
    />

    <div class="relative flex items-end gap-6">
      <div
        class="detail-hero-cover shrink-0 overflow-hidden shadow-2xl"
        :class="[
          coverVariant === 'circle' ? 'h-52 w-52 rounded-full' : 'h-52 w-52 rounded-[6px]',
        ]"
        :style="coverIsGradient ? { background: cover } : undefined"
      >
        <img
          v-if="!coverIsGradient"
          :src="cover"
          :alt="title"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="min-w-0 flex-1 pb-2">
        <p class="mb-2 text-xs font-bold uppercase tracking-wide text-white">{{ typeLabel }}</p>
        <h1 class="truncate text-5xl font-black text-white">{{ title }}</h1>
        <p v-if="subtitle" class="mt-3 text-sm text-[#b3b3b3]">{{ subtitle }}</p>
        <p v-if="description && description !== subtitle" class="mt-2 text-sm text-[#b3b3b3]">
          {{ description }}
        </p>

        <div v-if="showPlayAll" class="mt-6 flex items-center gap-6">
          <button
            type="button"
            data-testid="detail-play-all-button"
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
        </div>
      </div>
    </div>
  </header>
</template>
