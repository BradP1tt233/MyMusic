<script setup lang="ts">
import AppHeaderBackButton from '@/components/layout/AppHeaderBackButton.vue'
import AppHeaderHomeButton from '@/components/layout/AppHeaderHomeButton.vue'
import AppTopSearchBar from '@/components/layout/AppTopSearchBar.vue'
import AppHeaderAuth from '@/components/auth/AppHeaderAuth.vue'
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center gap-4 border-b border-neutral-800 bg-[#000000] px-4"
  >
    <div class="flex min-w-0 flex-1" aria-hidden="true" />

    <div class="flex shrink-0 items-center gap-4">
      <AppHeaderBackButton />
      <AppTopSearchBar />
      <AppHeaderHomeButton />
    </div>

    <div class="flex min-w-0 flex-1 items-center justify-end">
      <AppHeaderAuth />
    </div>
  </header>
</template>
