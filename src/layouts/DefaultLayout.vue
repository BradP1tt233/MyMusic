<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppPlayerBar from '@/components/layout/AppPlayerBar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex h-full min-h-screen flex-col">
    <AppHeader />

    <div class="flex min-h-0 flex-1 gap-2 bg-black p-2">
      <AppSidebar />

      <main
        class="main-view spotify-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-lg bg-[#121212]"
      >
        <RouterView />
      </main>
    </div>

    <AppPlayerBar />
  </div>
</template>
