<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const query = defineModel<string>({ default: '' })

const isFocused = ref(false)
const isHovered = ref(false)

const showClear = computed(() => query.value.length > 0)

function focusInput() {
  isFocused.value = true
}

function blurInput() {
  isFocused.value = false
}

function clearSearch() {
  query.value = ''
}

function openSearch() {
  router.push({ path: '/search', query: query.value ? { q: query.value } : {} })
}
</script>

<template>
  <!-- Spotify: form[role="search"][data-encore-id="formInputIcon"] -->
  <form
    role="search"
    data-encore-id="formInputIcon"
    class="relative block h-12 w-full max-w-[368px] transition-[width] duration-[220ms] ease-in"
    :class="{ 'is-hovered': isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @submit.prevent="openSearch"
  >
    <!-- leading icon: div.e-10451-form-input-icon__icon--leading -->
    <div
      class="absolute top-1/2 left-0 z-[1] flex h-12 w-12 -translate-y-1/2 items-center justify-center"
    >
      <!-- button[data-testid="search-icon"][aria-label="搜索"] -->
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

    <!-- input wrapper: div.DW2tFcaSSAWw9twn -->
    <div class="relative h-12 w-full">
      <input
        v-model="query"
        class="h-12 w-full rounded-full border-0 py-3 pr-[4.5rem] pl-12 text-base font-normal text-white outline-none transition-[box-shadow,background-color,color] duration-[220ms] ease-in placeholder:text-[#b3b3b3]"
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
        :aria-expanded="isFocused ? 'true' : 'false'"
        data-testid="search-input"
        aria-label="想播放什么？"
        data-top-bar-search="true"
        type="search"
        spellcheck="false"
        placeholder="想播放什么？"
        @focus="focusInput"
        @blur="blurInput"
        @keydown.enter="openSearch"
      />
    </div>

    <!-- trailing icons: div.e-10451-form-input-icon__icon--trailing -->
    <div
      class="absolute top-1/2 right-0 z-[1] flex h-12 -translate-y-1/2 items-center gap-1 pr-3"
    >
      <button
        v-show="showClear"
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

      <div class="flex items-center">
        <button
          type="button"
          data-testid="browse-button"
          data-encore-id="buttonTertiary"
          aria-label="浏览"
          class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#b3b3b3] transition-[color,transform] duration-150 ease-[cubic-bezier(0.3,0,0,1)] hover:scale-[1.04] hover:text-white focus-visible:outline-none"
          @click="router.push('/discover')"
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
                d="M15 15.5c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2"
              />
              <path
                fill="currentColor"
                d="M1.513 9.37A1 1 0 0 1 2.291 9h19.418a1 1 0 0 1 .979 1.208l-2.339 11a1 1 0 0 1-.978.792H4.63a1 1 0 0 1-.978-.792l-2.339-11a1 1 0 0 1 .201-.837zM3.525 11l1.913 9h13.123l1.913-9zM4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4h-2V3H6v3H4z"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </form>
</template>
