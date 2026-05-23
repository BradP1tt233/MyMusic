import { ref } from 'vue'
import type { LibraryPlaylist } from '@/types/media'
import { defaultLibraryPlaylists } from '@/data/catalog'

const playlists = ref<LibraryPlaylist[]>([...defaultLibraryPlaylists])
let playlistSeq = 1

export function useLibraryPlaylists() {
  function createPlaylist() {
    playlistSeq += 1
    playlists.value.unshift({
      id: `pl-new-${playlistSeq}`,
      title: `新歌单 ${playlistSeq}`,
      subtitle: '歌单 • bradpitt',
      cover: 'linear-gradient(135deg, #2a2a2a 0%, #525252 100%)',
      description: 'bradpitt 创建的歌单。',
    })
  }

  function getPlaylistById(id: string) {
    return playlists.value.find((playlist) => playlist.id === id)
  }

  return {
    playlists,
    createPlaylist,
    getPlaylistById,
  }
}
