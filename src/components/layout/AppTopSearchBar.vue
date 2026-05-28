<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchSearchDefaultKeyword, fetchSearchSuggestPreview, enrichSearchSuggestSongCovers } from '@/api/search'
import SearchSuggestDropdown from '@/components/search/SearchSuggestDropdown.vue'
import type { MediaCardItem } from '@/types/media'

const router = useRouter()
const route = useRoute()
const query = defineModel<string>({ default: '' })

const isFocused = ref(false)
const isHovered = ref(false)
const defaultKeyword = ref('')
const suggestLoading = ref(false)
const suggestSongs = ref<MediaCardItem[]>([])
const suggestArtists = ref<MediaCardItem[]>([])

let suggestTimer: ReturnType<typeof setTimeout> | undefined
let suggestRequestId = 0

const showClear = computed(() => query.value.length > 0)
const placeholder = computed(() => defaultKeyword.value || '想播放什么？')
const showDropdown = computed(
  () => isFocused.value && (query.value.trim().length > 0 || suggestLoading.value),
)

function focusInput() {
  isFocused.value = true

  if (query.value.trim()) {
    void loadSuggest(query.value)
  }
}

function blurInput() {
  window.setTimeout(() => {
    isFocused.value = false
  }, 120)
}

function clearSearch() {
  query.value = ''
  resetSuggest()
}

function resetSuggest() {
  suggestSongs.value = []
  suggestArtists.value = []
}

function navigateToSearch(keyword: string) {
  const trimmed = keyword.trim()
  if (!trimmed) {
    router.push({ name: 'Search' })
    return
  }

  query.value = trimmed
  isFocused.value = false
  router.push({
    name: 'Search',
    query: { q: trimmed },
  })
}

function openSearch() {
  navigateToSearch(query.value)
}

async function loadSuggest(keywords: string) {
  const trimmed = keywords.trim()
  if (!trimmed) {
    resetSuggest()
    suggestLoading.value = false
    return
  }

  const requestId = ++suggestRequestId
  suggestLoading.value = true

  let preview: Awaited<ReturnType<typeof fetchSearchSuggestPreview>> = null

  try {
    preview = await fetchSearchSuggestPreview(trimmed)
    if (requestId !== suggestRequestId) {
      return
    }

    if (!preview) {
      resetSuggest()
      return
    }

    suggestSongs.value = preview.songs
    suggestArtists.value = preview.artists
  } finally {
    if (requestId === suggestRequestId) {
      suggestLoading.value = false
    }
  }

  if (!preview?.songs.length || preview.songs.every((song) => Boolean(song.image))) {
    return
  }

  void enrichSearchSuggestSongCovers(preview.songs).then((songs) => {
    if (requestId !== suggestRequestId) {
      return
    }

    suggestSongs.value = songs
  })
}

function scheduleSuggest(keywords: string) {
  if (suggestTimer !== undefined) {
    clearTimeout(suggestTimer)
  }

  suggestTimer = setTimeout(() => {
    suggestTimer = undefined
    void loadSuggest(keywords)
  }, 150)
}

watch(
  query,
  (value) => {
    if (!isFocused.value) {
      return
    }

    scheduleSuggest(value)
  },
)

watch(
  () => route.query.q,
  (value) => {
    if (route.name !== 'Search') {
      return
    }

    query.value = String(value ?? '')
  },
  { immediate: true },
)

onMounted(async () => {
  defaultKeyword.value = await fetchSearchDefaultKeyword()
})
</script>

<template>
  <form
    role="search"
    data-encore-id="formInputIcon"
    class="relative block h-12 w-full max-w-[368px] transition-[width] duration-[220ms] ease-in"
    :class="{ 'is-hovered': isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @submit.prevent="openSearch"
  >
    <div
      class="absolute top-1/2 left-0 z-[1] flex h-12 w-12 -translate-y-1/2 items-center justify-center"
    >
      <button
        type="button"
        tabindex="-1"
        data-testid="search-icon"
        data-encore-id="buttonTertiary"
        aria-label="搜索"
        class="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-3 text-[#b3b3b3] transition-[color,transform] duration-[220ms] ease-in hover:scale-[1.04] hover:text-white focus-visible:outline-none"
        @click="openSearch"
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
              d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z"
            />
          </svg>
        </span>
      </button>
    </div>

    <div class="relative h-12 w-full">
      <input
        v-model="query"
        class="h-12 w-full rounded-full border-0 py-3 pr-12 pl-12 text-base font-normal text-white outline-none transition-[box-shadow,background-color,color] duration-[220ms] ease-in placeholder:text-[#b3b3b3]"
        :class="[
          isFocused
            ? 'bg-[#2a2a2a] shadow-[inset_0_0_0_2px_#ffffff]'
            : isHovered
              ? 'bg-[#2a2a2a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
              : 'bg-[#1f1f1f] shadow-none',
        ]"
        data-encore-id="formInput"
        role="combobox"
        aria-owns="search-dropdown"
        aria-controls="search-dropdown"
        :aria-expanded="showDropdown ? 'true' : 'false'"
        data-testid="search-input"
        aria-label="想播放什么？"
        data-top-bar-search="true"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder="placeholder"
        @focus="focusInput"
        @blur="blurInput"
        @keydown.enter="openSearch"
      />
    </div>

    <SearchSuggestDropdown
      :open="showDropdown"
      :songs="suggestSongs"
      :artists="suggestArtists"
      :loading="suggestLoading"
      @select-item="navigateToSearch"
    />

    <div
      v-show="showClear"
      class="absolute top-1/2 right-0 z-[1] flex h-12 -translate-y-1/2 items-center pr-3"
    >
      <button
        type="button"
        data-testid="clear-button"
        data-encore-id="buttonTertiary"
        aria-label="清空搜索栏内容"
        class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#b3b3b3] transition-colors duration-[220ms] ease-in hover:text-white focus-visible:outline-none"
        @click="clearSearch"
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
              d="M3.293 3.293a1 1 0 0 1 1.414 0L12 10.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 12l7.293 7.293a1 1 0 0 1-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 12 3.293 4.707a1 1 0 0 1 0-1.414"
            />
          </svg>
        </span>
      </button>
    </div>
  </form>
</template>
