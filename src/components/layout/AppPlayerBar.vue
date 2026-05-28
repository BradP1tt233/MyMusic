<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useLibraryPlaylists } from '@/composables/useLibraryPlaylists'
import { usePlaylistPicker, songToPickerTrack } from '@/composables/usePlaylistPicker'
import { usePlayer } from '@/hooks/usePlayer'
import { useAuthStore } from '@/stores/auth'

const {
  currentSong,
  playing,
  currentTime,
  duration,
  playMode,
  liked,
  muted,
  volume,
  hasPlayableTrack,
  canSkip,
  togglePlay,
  toggleShuffle,
  toggleRepeatOne,
  toggleMute,
  setMuted,
  seek,
  setVolume,
  next,
  prev,
  store,
} = usePlayer()

const { isSongInLikedPlaylist, toggleLikedSong } = useLibraryPlaylists()
const { togglePicker, isPickerActive } = usePlaylistPicker()
const authStore = useAuthStore()
const liking = ref(false)

function handleTogglePicker() {
  if (!currentSong.value) {
    return
  }

  togglePicker(songToPickerTrack(currentSong.value))
}

watch(
  currentSong,
  (song) => {
    store.liked = song ? isSongInLikedPlaylist(song.id) : false
  },
  { immediate: true },
)

async function handleToggleLike() {
  if (!currentSong.value || liking.value) {
    return
  }

  liking.value = true

  try {
    store.liked = await toggleLikedSong(currentSong.value, {
      cookie: authStore.isLoggedIn ? authStore.cookie : undefined,
    })
  } finally {
    liking.value = false
  }
}

const isShuffleActive = computed(() => playMode.value === 'shuffle')
const isRepeatOneActive = computed(() => playMode.value === 'repeat-one')

const progress = computed(() =>
  duration.value > 0 ? Math.min((currentTime.value / duration.value) * 100, 100) : 0,
)

const canSeek = computed(() => hasPlayableTrack.value && duration.value > 0)
const canControlPlayback = computed(() => hasPlayableTrack.value)

const isProgressHovered = ref(false)

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const progressTimeLabel = computed(
  () => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`,
)

const displayVolumeProgress = ref(volume.value * 100)
const isVolumeAnimating = ref(false)
let volumeMuteTimer: ReturnType<typeof setTimeout> | undefined

watch(volume, (value) => {
  if (!muted.value && !isVolumeAnimating.value) {
    displayVolumeProgress.value = value * 100
  }
})

function finishVolumeMute() {
  if (!isVolumeAnimating.value) return
  isVolumeAnimating.value = false
  if (volumeMuteTimer !== undefined) {
    clearTimeout(volumeMuteTimer)
    volumeMuteTimer = undefined
  }
  setMuted(true)
}

function cancelVolumeAnimation() {
  isVolumeAnimating.value = false
  if (volumeMuteTimer !== undefined) {
    clearTimeout(volumeMuteTimer)
    volumeMuteTimer = undefined
  }
}

async function handleMuteClick() {
  if (muted.value) {
    cancelVolumeAnimation()
    toggleMute()
    displayVolumeProgress.value = volume.value * 100
    return
  }

  if (displayVolumeProgress.value <= 0) {
    setMuted(true)
    return
  }

  isVolumeAnimating.value = true
  await nextTick()
  displayVolumeProgress.value = 0
  volumeMuteTimer = setTimeout(finishVolumeMute, 380)
}

function onVolumeFillTransitionEnd(event: TransitionEvent) {
  if (event.propertyName !== 'width' || !isVolumeAnimating.value) return
  finishVolumeMute()
}

function handleVolumeInput(event: Event) {
  cancelVolumeAnimation()
  const value = Number((event.target as HTMLInputElement).value)
  setVolume(value)
  displayVolumeProgress.value = value * 100
}

const repeatLabel = computed(() =>
  isRepeatOneActive.value ? '关闭单曲循环' : '开启单曲循环',
)
</script>

<template>
  <footer
    data-testid="now-playing-bar"
    aria-label="当前播放栏"
    class="player-bar shrink-0 bg-black"
    :class="{ 'is-picker-mode': isPickerActive }"
  >
    <div
      data-testid="playback-progressbar"
      class="player-progress-top w-full"
    >
      <div
        data-testid="progress-bar"
        class="player-slider player-slider--progress"
        :class="{ 'is-progress-hover': isProgressHovered && canSeek }"
        @mouseenter="isProgressHovered = true"
        @mouseleave="isProgressHovered = false"
      >
        <div class="player-slider-rail">
          <div data-testid="progress-bar-background" class="player-slider-track">
            <div
              class="player-slider-fill"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div
            data-testid="progress-bar-handle"
            class="player-slider-handle"
            :style="{ left: `${progress}%` }"
          />
          <div
            v-if="canSeek"
            data-testid="playback-time-tooltip"
            class="player-progress-tooltip"
            :style="{ left: `${progress}%` }"
            aria-hidden="true"
          >
            {{ progressTimeLabel }}
          </div>
        </div>
        <input
          type="range"
          min="0"
          :max="duration || 0"
          :value="currentTime"
          :disabled="!canSeek"
          aria-label="调整播放进度"
          class="player-slider-input"
          @input="seek(Number(($event.target as HTMLInputElement).value))"
          @mouseenter="isProgressHovered = true"
          @mouseleave="isProgressHovered = false"
        />
      </div>
    </div>

    <div class="player-bar-grid mx-auto grid h-[72px] max-w-full items-center px-2">
      <!-- Left: now playing + like -->
      <div
        data-testid="now-playing-widget"
        class="player-now-playing flex min-w-[180px] items-center gap-3 pl-2"
      >
        <div
          class="h-14 w-14 shrink-0 overflow-hidden rounded bg-[#282828] shadow-md"
          :class="{ 'opacity-70': !currentSong }"
        >
          <img
            v-if="currentSong?.cover"
            :src="currentSong.cover"
            :alt="currentSong.name"
            class="h-full w-full object-cover"
          />
        </div>

        <div v-if="currentSong" class="min-w-0 flex-1">
          <p class="truncate text-sm text-white">{{ currentSong.name }}</p>
          <p class="truncate text-xs text-[#b3b3b3]">{{ currentSong.artist }}</p>
        </div>
        <div v-else class="min-w-0 flex-1 text-sm text-[#b3b3b3]">未选择歌曲</div>

        <button
          type="button"
          data-testid="control-button-add-to-favorite"
          :aria-label="liked ? '从“已点赞的歌曲”中删除' : '添加到“已点赞的歌曲”'"
          class="player-icon-btn shrink-0"
          :class="{ 'is-active': liked }"
          :disabled="!currentSong || isPickerActive"
          @click="handleToggleLike"
        >
          <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
            <path
              d="M8 14.5c-.1 0-.2-.03-.29-.09C7.61 14.31 1 9.34 1 5.02 1 2.79 2.79 1 4.98 1c1.25 0 2.45.58 3.02 1.5.57-.92 1.77-1.5 3.02-1.5 2.19 0 3.98 1.79 3.98 4.02 0 4.32-6.61 9.29-6.71 9.39-.09.06-.19.09-.29.09z"
            />
          </svg>
        </button>

        <button
          type="button"
          data-testid="control-button-add-to-playlist"
          aria-label="添加到歌单"
          class="player-icon-btn shrink-0"
          :class="{ 'is-active': isPickerActive }"
          :disabled="!currentSong"
          @click="handleTogglePicker"
        >
          <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
            <path
              d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h7.8a.7.7 0 0 0 .7-.7V9.8H13a.7.7 0 0 0 0-1.4h-2.1V1.7a.7.7 0 0 0-.7-.7zm.7 1.4h5.6v10.6H3.4zm7.2 2.3a.7.7 0 0 1 .7.7v1.4H13a.7.7 0 0 1 0 1.4h-1.7v1.4a.7.7 0 0 1-1.4 0v-1.4H8.5a.7.7 0 0 1 0-1.4h1.4V5.4a.7.7 0 0 1 .7-.7z"
            />
          </svg>
        </button>
      </div>

      <!-- Center: playback controls -->
      <div
        data-testid="player-controls"
        class="player-controls flex min-w-[280px] items-center justify-center"
      >
        <div data-testid="general-controls" class="flex items-center gap-4">
          <button
            type="button"
            data-testid="control-button-shuffle"
            aria-label="开启随机播放"
            class="player-icon-btn"
            :class="{ 'is-active': isShuffleActive }"
            :aria-checked="isShuffleActive"
            :disabled="!canControlPlayback"
            role="switch"
            @click="toggleShuffle"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
              <path
                d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"
              />
            </svg>
          </button>

          <button
            type="button"
            data-testid="control-button-skip-back"
            aria-label="上一首"
            class="player-icon-btn"
            :disabled="!canSkip || !canControlPlayback"
            @click="prev"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
              <path
                d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7z"
              />
            </svg>
          </button>

          <button
            type="button"
            data-testid="control-button-playpause"
            :aria-label="playing ? '暂停' : '播放'"
            class="player-play-btn"
            :disabled="!canControlPlayback"
            @click="togglePlay"
          >
            <span class="player-play-btn-inner">
              <svg
                v-if="playing"
                viewBox="0 0 16 16"
                class="h-4 w-4 fill-current text-black"
                aria-hidden="true"
              >
                <path
                  d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z"
                />
              </svg>
              <svg
                v-else
                viewBox="0 0 16 16"
                class="h-4 w-4 fill-current text-black"
                aria-hidden="true"
              >
                <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288z" />
              </svg>
            </span>
          </button>

          <button
            type="button"
            data-testid="control-button-skip-forward"
            aria-label="下一首"
            class="player-icon-btn"
            :disabled="!canSkip || !canControlPlayback"
            @click="next"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
              <path
                d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7z"
              />
            </svg>
          </button>

          <button
            type="button"
            data-testid="control-button-repeat"
            :aria-label="repeatLabel"
            class="player-icon-btn relative"
            :class="{ 'is-active': isRepeatOneActive }"
            :disabled="!canControlPlayback"
            @click="toggleRepeatOne"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
              <path
                d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75z"
              />
            </svg>
            <span
              v-if="isRepeatOneActive"
              class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] font-bold leading-none"
            >
              1
            </span>
          </button>
        </div>
      </div>

      <!-- Right: volume -->
      <div
        data-testid="extra-controls"
        class="player-extra flex min-w-[180px] items-center justify-end pr-2"
      >
        <div data-testid="volume-bar" class="flex w-[125px] items-center gap-2">
          <button
            type="button"
            data-testid="volume-bar-toggle-mute-button"
            :aria-label="muted ? '取消静音' : '静音'"
            class="player-icon-btn"
            @click="handleMuteClick"
          >
            <svg viewBox="0 0 16 16" class="h-4 w-4 fill-current" aria-hidden="true">
              <path
                d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.64 3.64 0 0 1-1.33-4.967 3.64 3.64 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.14 2.14 0 0 0 0 3.7l5.8 3.35V2.8zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88"
              />
            </svg>
          </button>

          <div
            class="player-slider player-slider--volume min-w-0 flex-1"
            :class="{ 'is-volume-animating': isVolumeAnimating }"
          >
            <div class="player-slider-rail">
              <div class="player-slider-track">
                <div
                  class="player-slider-fill"
                  :style="{ width: `${displayVolumeProgress}%` }"
                  @transitionend="onVolumeFillTransitionEnd"
                />
              </div>
              <div
                class="player-slider-handle"
                :style="{ left: `${displayVolumeProgress}%` }"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="displayVolumeProgress / 100"
              aria-label="调整音量"
              class="player-slider-input"
              :disabled="isVolumeAnimating"
              @input="handleVolumeInput"
            />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player-progress-top {
  overflow: visible;
}

.player-slider {
  position: relative;
  width: 100%;
  height: 12px;
}

.player-slider-rail {
  position: relative;
  height: 100%;
}

.player-slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%);
  transform-origin: center;
  transition: transform 120ms cubic-bezier(0.3, 0, 0.7, 1);
}

.player-slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
}

.player-slider--progress .player-slider-fill {
  background: #1ed760;
}

.player-slider--volume .player-slider-fill {
  background: #fff;
}

.player-slider-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 120ms cubic-bezier(0.3, 0, 0.7, 1);
}

.player-slider--progress .player-slider-handle {
  background: #fff;
}

.player-progress-tooltip {
  position: absolute;
  top: 50%;
  z-index: 2;
  transform: translate(-50%, calc(-100% - 8px));
  border-radius: 9999px;
  background: #fff;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  color: #333;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: opacity 120ms cubic-bezier(0.3, 0, 0.7, 1);
}

.player-slider--progress.is-progress-hover .player-progress-tooltip {
  opacity: 1;
}

.player-slider--volume .player-slider-handle {
  background: #fff;
}

.player-slider--volume.is-volume-animating .player-slider-fill {
  transition: width 360ms cubic-bezier(0.55, 0, 1, 0.45);
}

.player-slider--volume.is-volume-animating .player-slider-handle {
  transition: left 360ms cubic-bezier(0.55, 0, 1, 0.45);
}

.player-slider:hover .player-slider-track {
  transform: translateY(-50%) scaleY(1.5);
}

.player-slider--progress.is-progress-hover .player-slider-handle {
  transform: translate(-50%, -50%) scale(1);
}

.player-slider--volume:hover .player-slider-handle {
  transform: translate(-50%, -50%) scale(1);
}

.player-slider-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  opacity: 0;
  appearance: none;
  -webkit-appearance: none;
}

.player-slider-input:disabled {
  cursor: not-allowed;
}

.player-bar-grid {
  grid-template-columns: minmax(180px, 30%) minmax(280px, 40%) minmax(180px, 30%);
}

.player-bar {
  position: relative;
}

.player-bar.is-picker-mode .player-now-playing {
  position: relative;
  z-index: 55;
}

.player-bar.is-picker-mode .player-controls,
.player-bar.is-picker-mode .player-extra {
  pointer-events: none;
  opacity: 0.35;
}

.player-icon-btn {
  position: relative;
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  padding: 0;
  color: #b3b3b3;
  transition:
    color 220ms cubic-bezier(0.3, 0, 0.7, 1),
    transform 220ms cubic-bezier(0.3, 0, 0.7, 1);
}

.player-icon-btn:hover:not(:disabled) {
  color: #fff;
  transform: scale(1.04);
}

.player-icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.player-icon-btn.is-active {
  color: #1ed760;
}

.player-icon-btn.is-active:hover:not(:disabled) {
  color: #1ed760;
  transform: scale(1.04);
}

.player-play-btn {
  display: inline-flex;
  height: 32px;
  width: 32px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  padding: 0;
}

.player-play-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.player-play-btn:disabled .player-play-btn-inner {
  background: #b3b3b3;
}

.player-play-btn-inner {
  display: flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #fff;
  transition: transform 220ms cubic-bezier(0.3, 0, 0.7, 1);
}

.player-play-btn:hover:not(:disabled) .player-play-btn-inner {
  transform: scale(1.04);
}

.player-play-btn:active:not(:disabled) .player-play-btn-inner {
  transform: scale(0.96);
}

@media (max-width: 1024px) {
  .player-bar-grid {
    grid-template-columns: minmax(160px, 28%) minmax(240px, 44%) minmax(120px, 28%);
  }
}
</style>
