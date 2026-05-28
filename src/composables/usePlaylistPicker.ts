import { ref } from 'vue'
import { useLibrarySidebar } from '@/composables/useLibrarySidebar'
import type { Song } from '@/types'
import type { MediaCardItem } from '@/types/media'

const isPickerActive = ref(false)
const pendingTrack = ref<MediaCardItem | null>(null)
const pickerMessage = ref('')
let messageTimer: ReturnType<typeof setTimeout> | undefined

function clearPickerMessageTimer() {
  if (messageTimer !== undefined) {
    clearTimeout(messageTimer)
    messageTimer = undefined
  }
}

function showPickerMessage(message: string) {
  clearPickerMessageTimer()
  pickerMessage.value = message
  messageTimer = setTimeout(() => {
    pickerMessage.value = ''
    messageTimer = undefined
  }, 2800)
}

export function usePlaylistPicker() {
  const { expand } = useLibrarySidebar()

  function openPicker(track?: MediaCardItem | null) {
    isPickerActive.value = true
    pendingTrack.value = track ?? null
    pickerMessage.value = ''
    expand()
  }

  function closePicker() {
    isPickerActive.value = false
    pendingTrack.value = null
    pickerMessage.value = ''
    clearPickerMessageTimer()
  }

  function togglePicker(track?: MediaCardItem | null) {
    if (isPickerActive.value) {
      closePicker()
      return
    }

    openPicker(track)
  }

  return {
    isPickerActive,
    pendingTrack,
    pickerMessage,
    openPicker,
    closePicker,
    togglePicker,
    showPickerMessage,
  }
}

export function songToPickerTrack(song: Song): MediaCardItem {
  return {
    id: String(song.id),
    title: song.name,
    subtitle: song.artist,
    image: song.cover ?? '',
    type: 'track',
    src: song.src,
    duration: song.duration,
  }
}
