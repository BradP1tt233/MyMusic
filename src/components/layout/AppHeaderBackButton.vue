<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isDisabled = computed(() => route.name === 'Discover')

function goBack() {
  if (isDisabled.value) {
    return
  }

  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: 'Discover' })
}
</script>

<template>
  <button
    type="button"
    data-testid="back-button"
    data-encore-id="buttonTertiary"
    aria-label="返回上一页"
    :disabled="isDisabled"
    class="flex h-12 w-12 shrink-0 cursor-default items-center justify-center rounded-full border-0 bg-[#1f1f1f] p-3 text-white transition-[color,transform,background-color,opacity] duration-[220ms] ease-in focus-visible:outline-none disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-[#1f1f1f] enabled:cursor-pointer enabled:hover:scale-[1.04] enabled:hover:bg-[#2a2a2a]"
    @click="goBack"
  >
    <span aria-hidden="true" class="flex h-6 w-6 items-center justify-center">
      <svg
        data-encore-id="icon"
        role="img"
        aria-hidden="true"
        class="h-6 w-6"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M15.643 4.703a1 1 0 0 0-1.414 0L9.22 9.712a1 1 0 0 0 0 1.414l5.008 5.008a1 1 0 0 0 1.414-1.414L11.093 10.5l4.336-4.337a1 1 0 0 0 0-1.414z"
        />
      </svg>
    </span>
  </button>
</template>
