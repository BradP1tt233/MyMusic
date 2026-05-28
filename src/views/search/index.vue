<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchSearchDefaultKeyword,
  fetchSearchHotKeywords,
  fetchSearchResults,
} from '@/api/search'
import DetailHero from '@/components/detail/DetailHero.vue'
import ArtistTrackList from '@/components/detail/ArtistTrackList.vue'
import MediaCard from '@/components/discover/MediaCard.vue'
import SearchTabs from '@/components/search/SearchTabs.vue'
import {
  SEARCH_DEFAULT_LIMIT,
  SEARCH_TYPE,
  getSearchTypeLabel,
  parseSearchType,
  type SearchTypeValue,
} from '@/constants/search'
import { mediaItemsToSongs } from '@/data/catalog'
import { usePlayer } from '@/hooks/usePlayer'
import type { MediaCardItem } from '@/types/media'

const route = useRoute()
const router = useRouter()
const { setPlayList, playAtIndex, store } = usePlayer()

const loading = ref(true)
const loadingMore = ref(false)
const defaultKeyword = ref('')
const hotKeywords = ref<string[]>([])
const items = ref<MediaCardItem[]>([])
const total = ref(0)
const hasMore = ref(false)
const offset = ref(0)

const keywords = computed(() => String(route.query.q ?? '').trim())
const activeType = computed(() => parseSearchType(route.query.type))
const hasQuery = computed(() => keywords.value.length > 0)

const canPlayAll = computed(
  () => activeType.value === SEARCH_TYPE.song && items.value.some((track) => Boolean(track.src)),
)

const heroTitle = computed(() => (hasQuery.value ? keywords.value : '搜索'))
const heroSubtitle = computed(() => {
  if (!hasQuery.value) {
    return '查找歌曲、专辑、艺人与歌单'
  }

  return `${total.value} 个${getSearchTypeLabel(activeType.value)}结果`
})
const heroTypeLabel = computed(() => (hasQuery.value ? '搜索结果' : '探索'))
const heroCover = computed(() =>
  hasQuery.value
    ? 'linear-gradient(135deg, #404040 0%, #121212 100%)'
    : 'linear-gradient(135deg, #5038a0 0%, #1ed760 100%)',
)

const showTrackList = computed(() => hasQuery.value && activeType.value === SEARCH_TYPE.song)
const showMediaGrid = computed(
  () =>
    hasQuery.value &&
    activeType.value !== SEARCH_TYPE.song &&
    items.value.length > 0,
)

const mediaItemType = computed(() => {
  switch (activeType.value) {
    case SEARCH_TYPE.album:
      return 'album' as const
    case SEARCH_TYPE.artist:
      return 'artist' as const
    case SEARCH_TYPE.playlist:
      return 'playlist' as const
    default:
      return 'track' as const
  }
})

const mediaVariant = computed(() =>
  activeType.value === SEARCH_TYPE.artist ? 'circle' : 'square',
)

async function loadEmptyState() {
  const [keyword, hot] = await Promise.all([
    fetchSearchDefaultKeyword(),
    fetchSearchHotKeywords(),
  ])

  defaultKeyword.value = keyword
  hotKeywords.value = hot
}

async function loadResults(reset = true) {
  if (!hasQuery.value) {
    items.value = []
    total.value = 0
    hasMore.value = false
    offset.value = 0
    return
  }

  if (reset) {
    loading.value = true
    offset.value = 0
  } else {
    loadingMore.value = true
  }

  try {
    const data = await fetchSearchResults({
      keywords: keywords.value,
      type: activeType.value,
      limit: SEARCH_DEFAULT_LIMIT,
      offset: reset ? 0 : offset.value,
    })

    if (!data) {
      if (reset) {
        items.value = []
        total.value = 0
        hasMore.value = false
      }
      return
    }

    items.value = reset ? data.items : [...items.value, ...data.items]
    total.value = data.total
    hasMore.value = data.hasMore
    offset.value = reset ? data.items.length : offset.value + data.items.length
    document.title = `${keywords.value} · 搜索 · myMusicPlayer`
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function refreshPage() {
  if (!hasQuery.value) {
    loading.value = true
    try {
      await loadEmptyState()
      document.title = '搜索 · myMusicPlayer'
    } finally {
      loading.value = false
    }
    return
  }

  await loadResults(true)
}

function handleTabChange(type: SearchTypeValue) {
  if (type === activeType.value) {
    return
  }

  router.replace({
    name: 'Search',
    query: {
      q: keywords.value,
      type: String(type),
    },
  })
}

function handleHotKeywordClick(keyword: string) {
  router.push({
    name: 'Search',
    query: { q: keyword, type: String(SEARCH_TYPE.song) },
  })
}

function handleDefaultKeywordClick() {
  if (!defaultKeyword.value) {
    return
  }

  router.push({
    name: 'Search',
    query: { q: defaultKeyword.value, type: String(SEARCH_TYPE.song) },
  })
}

async function playAllTracks() {
  if (!canPlayAll.value) {
    return
  }

  const songs = mediaItemsToSongs(items.value)
  if (songs.length === 0) {
    return
  }

  if (store.playMode === 'shuffle') {
    store.toggleShuffle()
  }

  setPlayList(songs, 0)
  await playAtIndex(0)
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value || loading.value) {
    return
  }

  await loadResults(false)
}

onMounted(() => {
  void refreshPage()
})

watch(
  () => [route.query.q, route.query.type] as const,
  () => {
    void refreshPage()
  },
)
</script>

<template>
  <div v-if="!loading" class="search-page pb-8">
    <DetailHero
      :title="heroTitle"
      :subtitle="heroSubtitle"
      :cover="heroCover"
      :type-label="heroTypeLabel"
      cover-is-gradient
      :show-play-all="showTrackList"
      :play-all-disabled="!canPlayAll"
      @play-all="playAllTracks"
    />

    <section v-if="!hasQuery" class="px-10 pt-2">
      <div v-if="defaultKeyword" class="mb-6">
        <h2 class="mb-3 text-2xl font-bold text-white">推荐搜索</h2>
        <button
          type="button"
          class="rounded-full border border-[rgba(255,255,255,0.1)] bg-[#242424] px-4 py-2 text-sm font-medium text-white transition-colors duration-[220ms] ease-in hover:bg-[#2a2a2a]"
          @click="handleDefaultKeywordClick"
        >
          {{ defaultKeyword }}
        </button>
      </div>

      <div v-if="hotKeywords.length > 0">
        <h2 class="mb-3 text-2xl font-bold text-white">热门搜索</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="keyword in hotKeywords"
            :key="keyword"
            type="button"
            class="rounded-full border border-[rgba(255,255,255,0.1)] bg-[#242424] px-4 py-2 text-sm font-medium text-white transition-colors duration-[220ms] ease-in hover:bg-[#2a2a2a]"
            @click="handleHotKeywordClick(keyword)"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
    </section>

    <template v-else>
      <SearchTabs
        class="mt-2"
        :model-value="activeType"
        @update:model-value="handleTabChange"
      />

      <ArtistTrackList
        v-if="showTrackList && items.length > 0"
        :tracks="items"
        title="单曲"
        class="mt-8"
      />

      <section v-else-if="showMediaGrid" class="mt-8 px-10">
        <h2 class="mb-4 text-2xl font-bold text-white">
          {{ getSearchTypeLabel(activeType) }}
        </h2>
        <div class="flex flex-wrap gap-4">
          <MediaCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :item-type="mediaItemType"
            :variant="mediaVariant"
            lazy-image
          />
        </div>
      </section>

      <section v-else class="px-10 pt-10">
        <p class="text-sm text-[#b3b3b3]">未找到与「{{ keywords }}」相关的{{ getSearchTypeLabel(activeType) }}。</p>
      </section>

      <div v-if="hasMore" class="mt-8 flex justify-center px-10">
        <button
          type="button"
          class="rounded-full border border-[rgba(255,255,255,0.2)] bg-transparent px-6 py-2 text-sm font-bold text-white transition-colors duration-[220ms] ease-in hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-50"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </template>
  </div>
</template>
