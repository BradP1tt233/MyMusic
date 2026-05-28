<script setup lang="ts">
import type { MediaCardItem } from '@/types/media'

defineProps<{
  open: boolean
  songs: MediaCardItem[]
  artists: MediaCardItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'select-item': [keyword: string]
}>()

function handleItemSelect(keyword: string) {
  emit('select-item', keyword)
}
</script>

<template>
  <div
    v-if="open"
    id="search-dropdown"
    role="listbox"
    aria-label="搜索建议"
    class="search-suggest-dropdown absolute top-[calc(100%+8px)] left-0 z-20 max-h-[420px] w-full overflow-y-auto rounded-xl bg-[#282828] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
  >
    <p v-if="loading" class="px-3 py-2 text-sm text-[#b3b3b3]">正在搜索…</p>

    <template v-else>
      <section v-if="songs.length > 0" class="py-1">
        <p class="px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#b3b3b3]">单曲</p>
        <button
          v-for="item in songs.slice(0, 4)"
          :key="`song-${item.id}`"
          type="button"
          class="search-suggest-row flex w-full items-center gap-3 rounded-md border-0 bg-transparent px-3 py-2 text-left transition-colors duration-[220ms] ease-in hover:bg-[rgba(255,255,255,0.1)]"
          @mousedown.prevent
          @click="handleItemSelect(item.title)"
        >
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.title"
            class="h-10 w-10 shrink-0 rounded-[2px] object-cover"
            loading="lazy"
          />
          <div v-else class="h-10 w-10 shrink-0 rounded-[2px] bg-[#404040]" />
          <div class="min-w-0">
            <p class="truncate text-sm text-white">{{ item.title }}</p>
            <p class="truncate text-xs text-[#b3b3b3]">{{ item.subtitle }}</p>
          </div>
        </button>
      </section>

      <section v-if="artists.length > 0" class="py-1">
        <p class="px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#b3b3b3]">歌手</p>
        <button
          v-for="item in artists.slice(0, 3)"
          :key="`artist-${item.id}`"
          type="button"
          class="search-suggest-row flex w-full items-center gap-3 rounded-md border-0 bg-transparent px-3 py-2 text-left transition-colors duration-[220ms] ease-in hover:bg-[rgba(255,255,255,0.1)]"
          @mousedown.prevent
          @click="handleItemSelect(item.title)"
        >
          <img
            :src="item.image"
            :alt="item.title"
            class="h-10 w-10 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
          <div class="min-w-0">
            <p class="truncate text-sm text-white">{{ item.title }}</p>
            <p class="truncate text-xs text-[#b3b3b3]">{{ item.subtitle }}</p>
          </div>
        </button>
      </section>

      <p v-if="!songs.length && !artists.length" class="px-3 py-2 text-sm text-[#b3b3b3]">
        暂无相关建议
      </p>
    </template>
  </div>
</template>
