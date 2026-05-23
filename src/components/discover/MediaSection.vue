<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { MediaCardItem, MediaItemType } from '@/types/media'
import { getCollectionRoute } from '@/utils/mediaRoutes'
import MediaCard from '@/components/discover/MediaCard.vue'

withDefaults(
  defineProps<{
    title: string
    slug: string
    items: MediaCardItem[]
    variant?: 'square' | 'circle'
    itemType: MediaItemType
    showCollectionLink?: boolean
    showRefresh?: boolean
  }>(),
  {
    showCollectionLink: true,
    showRefresh: false,
  },
)

const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <section role="region" :aria-label="title" class="media-section">
    <header
      data-testid="rich-title-row-shelf-header"
      class="mb-2 flex items-center gap-3"
    >
      <RouterLink
        v-if="showCollectionLink"
        :to="getCollectionRoute(slug)"
        data-testid="see-all-link"
        class="inline-block text-2xl font-bold text-white no-underline transition-[text-decoration-color] duration-[220ms] ease-[cubic-bezier(0.3,0,0.7,1)] hover:underline"
      >
        {{ title }}
      </RouterLink>
      <h2
        v-else
        class="text-2xl font-bold text-white"
      >
        {{ title }}
      </h2>

      <button
        v-if="showRefresh"
        type="button"
        data-testid="daily-recommendations-refresh-button"
        aria-label="刷新每日推荐"
        class="daily-recommendations-refresh-btn inline-flex h-8 w-8 items-center justify-center rounded-full text-[#b3b3b3]"
        @click="emit('refresh')"
      >
        <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
          <path
            d="M13.65 2.35A7.96 7.96 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.67 4.22 1.78L9 7h7V0l-2.35 2.35z"
          />
        </svg>
      </button>
    </header>

    <div
      data-testid="carousel-scroller"
      class="media-carousel -mx-1 flex gap-4 overflow-x-auto px-1 pb-1"
    >
      <MediaCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :variant="variant"
        :item-type="itemType"
        :playlist-items="itemType === 'track' ? items : undefined"
      />
    </div>
  </section>
</template>

<style scoped>
.media-carousel {
  scrollbar-width: none;
}

.media-carousel::-webkit-scrollbar {
  display: none;
}

.daily-recommendations-refresh-btn {
  transition:
    color 220ms cubic-bezier(0.3, 0, 0.7, 1),
    background-color 220ms cubic-bezier(0.3, 0, 0.7, 1),
    transform 220ms cubic-bezier(0.3, 0, 0.7, 1);
}

.daily-recommendations-refresh-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.04);
}

.daily-recommendations-refresh-btn:active {
  transform: scale(0.96);
}
</style>
