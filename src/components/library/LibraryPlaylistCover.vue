<script setup lang="ts">
import { computed } from 'vue'
import { isImageCover } from '@/utils/libraryPlaylist'

const props = defineProps<{
  cover: string
  title: string
  sizeClass?: string
}>()

const useImage = computed(() => isImageCover(props.cover))
</script>

<template>
  <div
    class="library-playlist-cover relative overflow-hidden rounded shadow-md"
    :class="sizeClass ?? 'h-12 w-12'"
  >
    <img
      v-if="useImage"
      :src="cover"
      :alt="title"
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <div
      v-else
      class="h-full w-full"
      :style="{ background: cover }"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>
