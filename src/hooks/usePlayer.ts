import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/stores/player'

/** 播放器 store 组合式封装，便于组件复用 */
export function usePlayer() {
  const store = usePlayerStore()
  const {
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
  } = storeToRefs(store)

  return {
    store,
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
    play: store.play,
    pause: store.pause,
    togglePlay: store.togglePlay,
    seek: store.seek,
    setVolume: store.setVolume,
    toggleMute: store.toggleMute,
    setMuted: store.setMuted,
    playAtIndex: store.playAtIndex,
    playSong: store.playSong,
    next: store.next,
    prev: store.prev,
    setPlayList: store.setPlayList,
    addToPlayList: store.addToPlayList,
    removeFromPlayList: store.removeFromPlayList,
    toggleShuffle: store.toggleShuffle,
    toggleRepeatOne: store.toggleRepeatOne,
    toggleLike: store.toggleLike,
  }
}
