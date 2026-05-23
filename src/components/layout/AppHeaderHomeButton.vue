<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/discover')
}
</script>

<template>
  <button
    type="button"
    data-testid="home-button"
    data-encore-id="buttonTertiary"
    aria-label="主页"
    class="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#1f1f1f] p-3 text-white transition-[color,transform,background-color] duration-[220ms] ease-in hover:scale-[1.04] hover:bg-[#2a2a2a] focus-visible:outline-none"
    @click="goHome"
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
          d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732z"
        />
      </svg>
    </span>
  </button>
</template>
