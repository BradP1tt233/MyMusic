<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useLibrarySidebar } from '@/composables/useLibrarySidebar'
import { useLibraryPlaylists } from '@/composables/useLibraryPlaylists'
import { getPlaylistRoute } from '@/utils/mediaRoutes'

const { isCollapsed, sidebarWidth, toggleCollapse, expand } = useLibrarySidebar()
const { playlists, createPlaylist } = useLibraryPlaylists()
</script>

<template>
  <aside
    id="Desktop_LeftSidebar_Id"
    class="library-sidebar-shell flex h-full min-h-0 shrink-0 flex-col self-stretch rounded-lg bg-black"
    :class="{ 'is-collapsed': isCollapsed }"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <nav aria-label="主界面" class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        class="library-panel flex min-h-0 flex-1 flex-col overflow-hidden bg-[#121212]"
        data-testid="your-library"
      >
        <!-- header -->
        <header class="library-header shrink-0 px-2 pt-2">
          <div class="flex items-center justify-between gap-1">
            <button
              v-if="!isCollapsed"
              type="button"
              aria-label="折叠音乐库"
              class="library-collapse-trigger flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-white"
              @click="toggleCollapse"
            >
              <span class="flex h-4 w-4 shrink-0 text-[#b3b3b3]">
                <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
                  <path
                    d="M10.97 5.47a.75.75 0 1 1 1.06 1.06L10.56 8l1.47 1.47a.75.75 0 1 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06z"
                  />
                  <path
                    d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm.5 1.5H5v13H1.5zm13 13h-8v-13h8z"
                  />
                </svg>
              </span>
              <h1 class="library-title truncate text-base font-bold">音乐库</h1>
            </button>

            <button
              v-else
              type="button"
              aria-label="打开音乐库"
              class="library-expand-trigger flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-md text-[#b3b3b3]"
              @click="expand"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current" aria-hidden="true">
                <path
                  d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866M16 4.732V20h4V7.041zM3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1m6 0a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1"
                />
              </svg>
              <svg viewBox="0 0 24 24" class="h-3 w-3 fill-current opacity-70" aria-hidden="true">
                <path
                  d="M14.457 15.207a1 1 0 0 1-1.414-1.414L14.836 12l-1.793-1.793a1 1 0 0 1 1.414-1.414l2.5 2.5a1 1 0 0 1 0 1.414z"
                />
                <path
                  d="M20 22a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zM4 20V4h4v16zm16 0H10V4h10z"
                />
              </svg>
            </button>

            <button
              type="button"
              aria-label="创建"
              class="library-create-btn flex shrink-0 items-center justify-center gap-1 rounded-full text-[#b3b3b3]"
              :class="isCollapsed ? 'h-10 w-10' : 'h-8 px-3 py-1.5'"
              @click="createPlaylist"
            >
              <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
                <path
                  d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75"
                />
              </svg>
              <span v-show="!isCollapsed" class="library-create-label text-sm font-bold text-white">
                创建
              </span>
            </button>
          </div>
        </header>

        <!-- expanded-only: 最近播放 label -->
        <div v-show="!isCollapsed" class="library-meta shrink-0 px-4 pb-1">
          <button
            type="button"
            role="combobox"
            aria-label="最近播放，默认列表视图"
            class="library-sort flex cursor-default items-center gap-1 py-1 text-sm font-medium text-[#b3b3b3]"
            tabindex="-1"
          >
            <span>最近播放</span>
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current opacity-80" aria-hidden="true">
              <path d="M4.5 8 8 11.5 11.5 8H4.5z" />
            </svg>
          </button>
        </div>

        <!-- playlist grid -->
        <div
          class="library-list spotify-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-2"
          role="grid"
          aria-label="音乐库"
        >
          <div role="rowgroup" class="flex flex-col gap-0.5">
            <div
              v-for="(pl, index) in playlists"
              :key="pl.id"
              role="row"
              class="library-row"
              :style="{ '--row-index': index }"
            >
              <RouterLink
                :to="getPlaylistRoute(pl.id)"
                custom
                v-slot="{ navigate, isExactActive }"
              >
                <button
                  type="button"
                  class="library-row-btn flex w-full items-center rounded-md text-left text-white"
                  :class="[
                    isCollapsed ? 'justify-center p-2' : 'gap-3 px-2 py-2',
                    { 'is-active-route': isExactActive },
                  ]"
                  :aria-label="`${pl.title} ${pl.subtitle}`"
                  @click="navigate"
                >
                  <div
                    class="library-cover relative h-12 w-12 shrink-0 overflow-hidden rounded shadow-md"
                    :style="{ background: pl.cover }"
                  >
                    <span
                      v-if="pl.pinned && !isCollapsed"
                      class="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] font-bold text-[#1ed760]"
                    >
                      置顶
                    </span>
                  </div>
                  <div v-show="!isCollapsed" class="library-row-text min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ pl.title }}</p>
                    <p class="truncate text-xs text-[#b3b3b3]">{{ pl.subtitle }}</p>
                  </div>
                </button>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* Spotify-like easing */
.library-sidebar-shell {
  --lib-ease: cubic-bezier(0.3, 0, 0, 1);
  --lib-ease-out: cubic-bezier(0.05, 0.7, 0.1, 1);
  --lib-duration: 280ms;
  transition:
    width var(--lib-duration) var(--lib-ease-out),
    min-width var(--lib-duration) var(--lib-ease-out);
  will-change: width;
}

.library-panel {
  border-radius: 8px;
}

/* Header controls */
.library-collapse-trigger,
.library-expand-trigger,
.library-create-btn {
  transition:
    background-color 120ms var(--lib-ease),
    color 120ms var(--lib-ease),
    transform 150ms var(--lib-ease);
}

.library-collapse-trigger:hover,
.library-expand-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.library-create-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.04);
}

.library-create-btn:active {
  transform: scale(1);
}

/* Title + labels fade/slide with width */
.library-title,
.library-create-label,
.library-meta,
.library-row-text {
  transition:
    opacity 200ms var(--lib-ease),
    transform 240ms var(--lib-ease-out);
}

.library-sidebar-shell.is-collapsed .library-title,
.library-sidebar-shell.is-collapsed .library-create-label,
.library-sidebar-shell.is-collapsed .library-meta,
.library-sidebar-shell.is-collapsed .library-row-text {
  opacity: 0;
  transform: translateX(-10px);
  pointer-events: none;
}

.library-sidebar-shell:not(.is-collapsed) .library-title,
.library-sidebar-shell:not(.is-collapsed) .library-create-label {
  transition-delay: 80ms;
}

.library-sidebar-shell:not(.is-collapsed) .library-meta {
  transition-delay: 100ms;
}

.library-sidebar-shell:not(.is-collapsed) .library-row-text {
  transition-delay: calc(60ms + var(--row-index, 0) * 25ms);
}

/* Sort row */
.library-sort {
  transition: color 120ms var(--lib-ease);
}

.library-sort:hover {
  color: #fff;
}

/* Playlist rows */
.library-row-btn {
  transition: background-color 120ms var(--lib-ease);
}

.library-row-btn:hover {
  background-color: #2a2a2a;
}

.library-row-btn.is-active-route {
  background-color: #282828;
}

.library-row-btn.is-active-route .library-row-text p:first-child {
  color: #1ed760;
}

.library-cover {
  transition: transform 200ms var(--lib-ease);
}

.library-row-btn:hover .library-cover {
  transform: scale(1.02);
}

.library-row {
  transition: opacity 200ms var(--lib-ease);
}

.library-sidebar-shell.is-collapsed .library-row {
  transition-delay: 0ms;
}

/* Hide scrollbar when sidebar is collapsed */
.library-sidebar-shell.is-collapsed .library-list {
  scrollbar-width: none;
}

.library-sidebar-shell.is-collapsed .library-list::-webkit-scrollbar {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .library-sidebar-shell,
  .library-title,
  .library-create-label,
  .library-meta,
  .library-row-text,
  .library-cover,
  .library-row-btn {
    transition: none !important;
  }
}
</style>
