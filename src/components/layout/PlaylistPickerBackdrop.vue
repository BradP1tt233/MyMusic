<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { usePlaylistPicker } from '@/composables/usePlaylistPicker'

const { isPickerActive, closePicker } = usePlaylistPicker()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePicker()
  }
}

watch(
  isPickerActive,
  (active) => {
    if (active) {
      window.addEventListener('keydown', onKeydown)
      return
    }

    window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true },
)

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isPickerActive"
      class="playlist-picker-backdrop"
      aria-hidden="true"
      @click="closePicker"
    />
  </Teleport>
</template>

<style scoped>
.playlist-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  animation: playlist-picker-backdrop-in 320ms cubic-bezier(0.05, 0.7, 0.1, 1);
  cursor: default;
}

@keyframes playlist-picker-backdrop-in {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .playlist-picker-backdrop {
    animation: none;
  }
}
</style>
