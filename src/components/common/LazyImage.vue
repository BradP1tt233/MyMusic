<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    imgClass?: string
    rootMargin?: string
  }>(),
  {
    imgClass: '',
    rootMargin: '240px 0px',
  },
)

const rootRef = ref<HTMLElement | null>(null)
const shouldLoad = ref(false)
const isLoaded = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  const element = rootRef.value
  if (!element) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        shouldLoad.value = true
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: props.rootMargin },
  )

  observer.observe(element)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div ref="rootRef" class="lazy-image relative h-full w-full overflow-hidden">
    <div
      v-if="!isLoaded"
      class="lazy-image-placeholder absolute inset-0 bg-[#282828]"
      :class="imgClass"
      aria-hidden="true"
    />

    <img
      v-if="shouldLoad"
      :src="src"
      :alt="alt"
      decoding="async"
      class="h-full w-full object-cover transition-opacity duration-300"
      :class="[imgClass, isLoaded ? 'opacity-100' : 'opacity-0']"
      @load="isLoaded = true"
    />
  </div>
</template>
