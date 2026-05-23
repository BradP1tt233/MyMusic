<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  description?: string
  cover: string
  typeLabel: string
  coverVariant?: 'square' | 'circle'
  coverIsGradient?: boolean
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
      </div>
    </div>
  </header>
</template>
