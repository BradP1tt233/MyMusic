<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import LibraryCreatePlaylistDialog from '@/components/library/LibraryCreatePlaylistDialog.vue'
import LibraryDeletePlaylistDialog from '@/components/library/LibraryDeletePlaylistDialog.vue'
import LibraryPlaylistCover from '@/components/library/LibraryPlaylistCover.vue'
import { useLibraryPlaylists } from '@/composables/useLibraryPlaylists'
import { useLibrarySidebar } from '@/composables/useLibrarySidebar'
import { usePlaylistPicker } from '@/composables/usePlaylistPicker'
import { usePlayer } from '@/hooks/usePlayer'
import { useAuthStore } from '@/stores/auth'
import { LIKED_PLAYLIST_ID } from '@/constants/library'
import { getPlaylistRoute } from '@/utils/mediaRoutes'

const router = useRouter()
const authStore = useAuthStore()
const { store } = usePlayer()
const { isCollapsed, sidebarWidth, toggleCollapse, expand } = useLibrarySidebar()
const { isPickerActive, pendingTrack, pickerMessage, showPickerMessage, closePicker } =
  usePlaylistPicker()
const {
  playlists,
  playlistCount,
  isLibraryFull,
  libraryPlaylistMax,
  createPlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  isTrackInPlaylist,
} = useLibraryPlaylists()

const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const pendingDelete = ref<{ id: string; title: string } | null>(null)
const creating = ref(false)
const deletingId = ref<string | null>(null)
const addingToId = ref<string | null>(null)
const actionError = ref('')

function handleCreateClick() {
  if (isLibraryFull.value) {
    return
  }

  actionError.value = ''
  showCreateDialog.value = true
}

async function handleCreateConfirm(title: string) {
  if (creating.value) {
    return
  }

  creating.value = true
  actionError.value = ''

  try {
    const created = await createPlaylist(title, {
      cookie: authStore.isLoggedIn ? authStore.cookie : undefined,
    })

    if (!created) {
      actionError.value = authStore.isLoggedIn
        ? '创建歌单失败，请稍后重试'
        : '创建歌单失败'
      return
    }

    showCreateDialog.value = false
    await router.push(getPlaylistRoute(created.id))
  } finally {
    creating.value = false
  }
}

function handleDeleteClick(id: string, title: string) {
  if (deletingId.value || id === LIKED_PLAYLIST_ID) {
    return
  }

  actionError.value = ''
  pendingDelete.value = { id, title }
  showDeleteDialog.value = true
}

function handleDeleteCancel() {
  if (deletingId.value) {
    return
  }

  showDeleteDialog.value = false
  pendingDelete.value = null
}

async function handleDeleteConfirm() {
  const target = pendingDelete.value
  if (!target || deletingId.value) {
    return
  }

  deletingId.value = target.id
  actionError.value = ''

  try {
    const success = await deletePlaylist(target.id, {
      cookie: authStore.isLoggedIn ? authStore.cookie : undefined,
    })

    if (!success) {
      actionError.value = '删除歌单失败，请稍后重试'
      return
    }

    showDeleteDialog.value = false
    pendingDelete.value = null

    if (router.currentRoute.value.params.id === target.id) {
      await router.push({ name: 'Discover' })
    }
  } finally {
    deletingId.value = null
  }
}

function handleRowNavigate(navigate: () => void) {
  if (!isPickerActive.value) {
    navigate()
  }
}

async function handleAddTrack(playlistId: string, _playlistTitle: string) {
  const track = pendingTrack.value
  if (!track || addingToId.value) {
    return
  }

  if (isTrackInPlaylist(playlistId, track.id)) {
    showPickerMessage('此歌单中已存在此歌曲')
    return
  }

  addingToId.value = playlistId

  try {
    const result = await addTrackToPlaylist(playlistId, track, {
      cookie: authStore.isLoggedIn ? authStore.cookie : undefined,
    })

    if (result === 'duplicate') {
      showPickerMessage('此歌单中已存在此歌曲')
    } else if (result === 'failed') {
      showPickerMessage('添加失败，请稍后重试')
    } else {
      if (playlistId === LIKED_PLAYLIST_ID) {
        store.liked = true
      }
      closePicker()
    }
  } finally {
    addingToId.value = null
  }
}
</script>

<template>
  <aside
    id="Desktop_LeftSidebar_Id"
    class="library-sidebar-shell flex h-full min-h-0 shrink-0 flex-col self-stretch rounded-lg bg-black"
    :class="{ 'is-collapsed': isCollapsed, 'is-picker-active': isPickerActive }"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <nav aria-label="主界面" class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        class="library-panel flex min-h-0 flex-1 flex-col overflow-hidden bg-[#121212]"
        data-testid="your-library"
      >
        <header class="library-header shrink-0 px-2 pt-2">
          <div class="flex items-center justify-between gap-1">
            <button
              v-if="!isCollapsed"
              type="button"
              aria-label="折叠音乐库"
              class="library-collapse-trigger flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-white"
              :disabled="isPickerActive"
              @click="toggleCollapse"
            >
              <span class="flex h-4 w-4 shrink-0 text-[#b3b3b3]">
                <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
                  <path
                    d="M10.97 5.47a.75.75 0 0 1 1.06 1.06L10.56 8l1.47 1.47a.75.75 0 0 1-1.06 1.06l-2-2a.75.75 0 0 1 0-1.06z"
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
              :disabled="isPickerActive"
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
              :class="[
                isCollapsed ? 'h-10 w-10' : 'h-8 px-3 py-1.5',
                { 'cursor-default opacity-40': isLibraryFull || creating || isPickerActive },
              ]"
              :disabled="isLibraryFull || creating || isPickerActive"
              :title="isLibraryFull ? `歌单已达上限（${libraryPlaylistMax} 个）` : '创建歌单'"
              @click="handleCreateClick"
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

        <div v-show="!isCollapsed" class="library-meta shrink-0 px-4 pb-1">
          <div class="flex items-center justify-between gap-2 py-1">
            <p v-if="isPickerActive" class="text-xs font-medium text-[#1ed760]">
              选择要添加到的歌单
            </p>
            <span v-else aria-hidden="true" class="flex-1" />
            <span
              class="shrink-0 text-xs text-[#b3b3b3]"
              :class="{ 'text-[#1ed760]': isLibraryFull }"
              aria-live="polite"
            >
              {{ playlistCount }} / {{ libraryPlaylistMax }}
            </span>
          </div>
          <p v-if="actionError" class="pb-1 text-xs text-[#f15e6c]">{{ actionError }}</p>
          <p v-if="pickerMessage" class="pb-1 text-xs text-[#f59e0b]" aria-live="polite">
            {{ pickerMessage }}
          </p>
        </div>

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
              class="library-row group/library-row"
              :style="{ '--row-index': index }"
            >
              <RouterLink
                :to="getPlaylistRoute(pl.id)"
                custom
                v-slot="{ navigate, isExactActive }"
              >
                <div
                  class="library-row-btn flex w-full items-center rounded-md text-left text-white"
                  :class="[
                    isCollapsed ? 'justify-center p-2' : 'gap-3 px-2 py-2',
                    { 'is-active-route': isExactActive },
                  ]"
                >
                  <button
                    type="button"
                    class="flex min-w-0 flex-1 items-center border-0 bg-transparent p-0 text-left text-white"
                    :class="isCollapsed ? 'justify-center' : 'gap-3'"
                    :aria-label="`${pl.title} ${pl.subtitle}`"
                    @click="handleRowNavigate(navigate)"
                  >
                    <LibraryPlaylistCover :cover="pl.cover" :title="pl.title">
                      <span
                        v-if="pl.pinned && !isCollapsed"
                        class="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] font-bold text-[#1ed760]"
                      >
                        置顶
                      </span>
                    </LibraryPlaylistCover>

                    <div v-show="!isCollapsed" class="library-row-text min-w-0 flex-1">
                      <p class="truncate text-sm font-medium">{{ pl.title }}</p>
                      <p class="truncate text-xs text-[#b3b3b3]">{{ pl.subtitle }}</p>
                    </div>
                  </button>

                  <button
                    v-if="!isCollapsed && isPickerActive"
                    type="button"
                    class="library-add-btn shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-1.5 text-[#b3b3b3] hover:text-white"
                    :class="{ 'is-adding': addingToId === pl.id }"
                    :aria-label="`添加到 ${pl.title}`"
                    :disabled="addingToId === pl.id"
                    @click.stop="handleAddTrack(pl.id, pl.title)"
                  >
                    <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
                      <path
                        d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75"
                      />
                    </svg>
                  </button>

                  <button
                    v-else-if="!isCollapsed && pl.id !== LIKED_PLAYLIST_ID && !pl.pinned"
                    type="button"
                    class="library-delete-btn shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-1.5 text-[#b3b3b3] opacity-0 transition-opacity group-hover/library-row:opacity-100 hover:text-white"
                    :aria-label="`删除 ${pl.title}`"
                    :disabled="deletingId === pl.id"
                    @click.stop="handleDeleteClick(pl.id, pl.title)"
                  >
                    <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
                      <path
                        d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66H14.5a.5.5 0 0 0 0-1zm1.958 1.846-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"
                      />
                    </svg>
                  </button>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <LibraryCreatePlaylistDialog
      :open="showCreateDialog"
      @close="showCreateDialog = false"
      @confirm="handleCreateConfirm"
    />

    <LibraryDeletePlaylistDialog
      :open="showDeleteDialog"
      :title="pendingDelete?.title ?? ''"
      :busy="Boolean(deletingId)"
      @close="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </aside>
</template>

<style scoped>
.library-sidebar-shell {
  --lib-ease: cubic-bezier(0.3, 0, 0.7, 1);
  --lib-ease-out: cubic-bezier(0.05, 0.7, 0.1, 1);
  --lib-duration: 280ms;
  transition:
    width var(--lib-duration) var(--lib-ease-out),
    min-width var(--lib-duration) var(--lib-ease-out),
    transform 360ms var(--lib-ease-out),
    filter 360ms var(--lib-ease-out);
  will-change: width, transform, filter;
}

.library-panel {
  border-radius: 8px;
  transition:
    box-shadow 360ms var(--lib-ease-out),
    background-color 360ms var(--lib-ease-out);
}

.library-sidebar-shell.is-picker-active {
  position: relative;
  z-index: 50;
  transform: translateY(-10px) scale(1.012);
  filter:
    drop-shadow(0 6px 16px rgba(0, 0, 0, 0.45))
    drop-shadow(0 20px 48px rgba(0, 0, 0, 0.55))
    drop-shadow(0 0 40px rgba(30, 215, 96, 0.16));
}

.library-sidebar-shell.is-picker-active .library-panel {
  background-color: #181818;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 24px 48px rgba(0, 0, 0, 0.55),
    0 12px 24px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3);
}

.library-add-btn {
  transition:
    color 120ms var(--lib-ease),
    transform 150ms var(--lib-ease);
}

.library-add-btn:hover:not(:disabled) {
  color: #1ed760;
  transform: scale(1.08);
}

.library-add-btn.is-adding {
  color: #1ed760;
  opacity: 0.6;
}

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

.library-collapse-trigger:disabled,
.library-expand-trigger:disabled {
  cursor: default;
  opacity: 0.35;
}

.library-collapse-trigger:disabled:hover,
.library-expand-trigger:disabled:hover {
  background-color: transparent;
  color: inherit;
}

.library-create-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: scale(1.04);
}

.library-create-btn:active {
  transform: scale(1);
}

.library-create-btn:disabled {
  transform: none;
}

.library-create-btn:disabled:hover {
  background-color: transparent;
  color: #b3b3b3;
}

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

.library-playlist-cover {
  transition: transform 200ms var(--lib-ease);
}

.library-row-btn:hover .library-playlist-cover {
  transform: scale(1.02);
}

.library-row {
  transition: opacity 200ms var(--lib-ease);
}

.library-sidebar-shell.is-collapsed .library-row {
  transition-delay: 0ms;
}

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
  .library-playlist-cover,
  .library-row-btn,
  .library-panel {
    transition: none !important;
  }

  .library-sidebar-shell.is-picker-active {
    transform: translateY(-4px);
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.55));
  }
}
</style>
