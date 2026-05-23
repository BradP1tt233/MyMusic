import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { audioEngine } from '@/core/audio'
import type { Song } from '@/types'

/** 顺序播放 / 随机播放 / 单曲循环，三者互斥 */
export type PlayMode = 'sequential' | 'shuffle' | 'repeat-one'

function shuffleIndices(length: number, currentIndex = -1) {
  const indices = Array.from({ length }, (_, index) => index)

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j]!, indices[i]!]
  }

  if (currentIndex >= 0) {
    const currentPos = indices.indexOf(currentIndex)
    if (currentPos > 0) {
      indices.splice(currentPos, 1)
      indices.unshift(currentIndex)
    }
  }

  return indices
}

export const usePlayerStore = defineStore('player', () => {
  const playList = ref<Song[]>([])
  const currentIndex = ref(-1)
  const playOrder = ref<number[]>([])
  const playOrderCursor = ref(0)

  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  const playMode = ref<PlayMode>('sequential')
  const liked = ref(false)
  const muted = ref(false)
  const volume = ref(0.8)

  const currentSong = computed(() => {
    if (currentIndex.value < 0) return null
    return playList.value[currentIndex.value] ?? null
  })

  const hasPlayableTrack = computed(() => {
    return playList.value.some((song) => Boolean(song.src))
  })

  const canSkip = computed(() => playList.value.length > 1)

  function rebuildPlayOrder(keepCurrent = true) {
    const activeIndex = keepCurrent ? currentIndex.value : -1

    playOrder.value =
      playMode.value === 'shuffle'
        ? shuffleIndices(playList.value.length, activeIndex)
        : playList.value.map((_, index) => index)

    playOrderCursor.value =
      currentIndex.value >= 0 ? playOrder.value.indexOf(currentIndex.value) : 0
  }

  function syncDuration(nextDuration: number) {
    duration.value = nextDuration > 0 ? nextDuration : (currentSong.value?.duration ?? 0)
  }

  function bindAudioEngine() {
    audioEngine.setVolume(volume.value)
    audioEngine.setMuted(muted.value)

    audioEngine.setHandlers({
      onTimeUpdate: (time) => {
        currentTime.value = time
      },
      onDurationChange: (nextDuration) => {
        syncDuration(nextDuration)
      },
      onPlay: () => {
        playing.value = true
      },
      onPause: () => {
        playing.value = false
      },
      onEnded: () => {
        void handleEnded()
      },
      onError: () => {
        playing.value = false
      },
    })
  }

  bindAudioEngine()

  async function loadCurrentSong() {
    const song = currentSong.value
    if (!song?.src) return false

    await audioEngine.load(song.src)
    syncDuration(audioEngine.getDuration())
    currentTime.value = 0
    return true
  }

  async function play() {
    if (playList.value.length === 0) return

    if (currentIndex.value < 0) {
      const firstPlayableIndex = playList.value.findIndex((song) => Boolean(song.src))
      if (firstPlayableIndex === -1) return
      await playAtIndex(firstPlayableIndex)
      return
    }

    if (!currentSong.value?.src) return

    if (!audioEngine.getSrc()) {
      const loaded = await loadCurrentSong()
      if (!loaded) return
    }

    await audioEngine.play()
  }

  function pause() {
    audioEngine.pause()
  }

  async function togglePlay() {
    if (playing.value) {
      pause()
      return
    }

    await play()
  }

  function seek(time: number) {
    const max = duration.value > 0 ? duration.value : time
    const nextTime = Math.min(Math.max(time, 0), max)
    audioEngine.seek(nextTime)
    currentTime.value = nextTime
  }

  function setVolume(value: number) {
    const nextVolume = Math.min(Math.max(value, 0), 1)
    volume.value = nextVolume
    audioEngine.setVolume(nextVolume)

    if (nextVolume === 0) {
      muted.value = true
      audioEngine.setMuted(true)
      return
    }

    if (muted.value) {
      muted.value = false
      audioEngine.setMuted(false)
    }
  }

  function toggleMute() {
    muted.value = !muted.value
    audioEngine.setMuted(muted.value)
  }

  function setMuted(value: boolean) {
    muted.value = value
    audioEngine.setMuted(value)
  }

  async function playAtIndex(index: number) {
    if (index < 0 || index >= playList.value.length) return

    const song = playList.value[index]
    if (!song?.src) return

    currentIndex.value = index
    playOrderCursor.value = playOrder.value.indexOf(index)

    const loaded = await loadCurrentSong()
    if (!loaded) return

    await audioEngine.play()
  }

  async function playSong(song: Song) {
    const existingIndex = playList.value.findIndex((item) => item.id === song.id)

    if (existingIndex >= 0) {
      await playAtIndex(existingIndex)
      return
    }

    playList.value.push(song)
    rebuildPlayOrder(true)
    await playAtIndex(playList.value.length - 1)
  }

  async function next() {
    if (playList.value.length === 0) return

    if (playMode.value === 'repeat-one') {
      seek(0)
      await play()
      return
    }

    if (playOrderCursor.value < playOrder.value.length - 1) {
      playOrderCursor.value += 1
      await playAtIndex(playOrder.value[playOrderCursor.value]!)
      return
    }

    if (playMode.value === 'shuffle') {
      rebuildPlayOrder(false)
      playOrderCursor.value = 0
      await playAtIndex(playOrder.value[0]!)
      return
    }

    pause()
  }

  async function prev() {
    if (playList.value.length === 0) return

    if (currentTime.value > 3) {
      seek(0)
      return
    }

    if (playOrderCursor.value > 0) {
      playOrderCursor.value -= 1
      await playAtIndex(playOrder.value[playOrderCursor.value]!)
      return
    }

    seek(0)
  }

  async function handleEnded() {
    if (playMode.value === 'repeat-one') {
      seek(0)
      await play()
      return
    }

    await next()
  }

  function setPlayList(songs: Song[], startIndex = 0) {
    playList.value = [...songs]
    rebuildPlayOrder(false)
    audioEngine.pause()

    if (songs.length === 0) {
      currentIndex.value = -1
      currentTime.value = 0
      duration.value = 0
      playing.value = false
      return
    }

    currentIndex.value = Math.min(Math.max(startIndex, 0), songs.length - 1)
    playOrderCursor.value = playOrder.value.indexOf(currentIndex.value)
    currentTime.value = 0
    duration.value = songs[currentIndex.value]?.duration ?? 0
    playing.value = false
  }

  function addToPlayList(song: Song) {
    if (playList.value.some((item) => item.id === song.id)) return
    playList.value.push(song)
    rebuildPlayOrder(true)
  }

  function removeFromPlayList(id: string | number) {
    const index = playList.value.findIndex((item) => item.id === id)
    if (index === -1) return

    playList.value.splice(index, 1)
    rebuildPlayOrder(true)

    if (playList.value.length === 0) {
      currentIndex.value = -1
      currentTime.value = 0
      duration.value = 0
      pause()
      return
    }

    if (index === currentIndex.value) {
      void playAtIndex(Math.min(index, playList.value.length - 1))
      return
    }

    if (index < currentIndex.value) {
      currentIndex.value -= 1
      playOrderCursor.value = playOrder.value.indexOf(currentIndex.value)
    }
  }

  function toggleShuffle() {
    playMode.value = playMode.value === 'shuffle' ? 'sequential' : 'shuffle'
    rebuildPlayOrder(true)
  }

  function toggleRepeatOne() {
    playMode.value = playMode.value === 'repeat-one' ? 'sequential' : 'repeat-one'
  }

  function toggleLike() {
    liked.value = !liked.value
  }

  return {
    currentSong,
    playList,
    currentIndex,
    playing,
    currentTime,
    duration,
    playMode,
    liked,
    muted,
    volume,
    hasPlayableTrack,
    canSkip,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setMuted,
    playAtIndex,
    playSong,
    next,
    prev,
    setPlayList,
    addToPlayList,
    removeFromPlayList,
    toggleShuffle,
    toggleRepeatOne,
    toggleLike,
  }
})
