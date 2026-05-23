<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DetailHero from '@/components/detail/DetailHero.vue'
import { getAlbumById } from '@/data/catalog'

const route = useRoute()
const router = useRouter()

const album = computed(() => getAlbumById(route.params.id as string))

watchEffect(() => {
  if (!album.value) {
    router.replace({ name: 'Discover' })
  } else {
    document.title = `${album.value.title} · myMusicPlayer`
  }
})
</script>

<template>
  <div v-if="album" class="album-page pb-8">
    <DetailHero
      :title="album.title"
      :subtitle="album.subtitle"
      :description="album.description"
      :cover="album.cover"
      :type-label="album.typeLabel"
    />

    <section class="px-10 pt-2">
      <p class="text-sm text-[#b3b3b3]">专辑详情页 — 曲目列表将在后续接入。</p>
    </section>
  </div>
</template>
