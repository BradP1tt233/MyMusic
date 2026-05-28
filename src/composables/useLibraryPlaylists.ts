import { computed, ref, watch } from 'vue'
import {
  createRemotePlaylist,
  deleteRemotePlaylist,
  likeSong,
  manipulatePlaylistTracks,
  subscribeRemotePlaylist,
} from '@/api/playlistMutations'
import { fetchUserPlaylists, findLikedPlaylistId } from '@/api/userPlaylist'
import {
  LIBRARY_PLAYLIST_MAX,
  LIKED_PLAYLIST_ID,
} from '@/constants/library'
import {
  normalizeLibraryPlaylist,
  refreshLibraryPlaylistMeta,
  resolveRemotePlaylistId,
  songToMediaCardItem,
  sortLibraryPlaylists,
} from '@/utils/libraryPlaylist'
import {
  readLibraryPlaylistSnapshot,
  writeLibraryPlaylistSnapshot,
  type LibraryPlaylistSnapshot,
} from '@/utils/libraryPlaylistStorage'
import type { Song } from '@/types'
import type { LibraryPlaylist, MediaCardItem } from '@/types/media'
import type { PlaylistPageData, UserPlaylistDto } from '@/types/playlist'

export type AddTrackResult = 'added' | 'duplicate' | 'failed'

const initialSnapshot = readLibraryPlaylistSnapshot()
const playlists = ref<LibraryPlaylist[]>(
  sortLibraryPlaylists(initialSnapshot.playlists.map(normalizeLibraryPlaylist)),
)
let playlistSeq = initialSnapshot.nextSeq

const sortedPlaylists = computed(() => sortLibraryPlaylists(playlists.value))

function persistSnapshot() {
  const snapshot: LibraryPlaylistSnapshot = {
    playlists: playlists.value,
    nextSeq: playlistSeq,
  }
  writeLibraryPlaylistSnapshot(snapshot)
}

watch(playlists, persistSnapshot, { deep: true })

function findPlaylistIndex(id: string) {
  return playlists.value.findIndex((playlist) => playlist.id === id)
}

function getLikedPlaylist() {
  return playlists.value.find((playlist) => playlist.id === LIKED_PLAYLIST_ID) ?? null
}

function isPlaylistInLibrary(id: string) {
  return playlists.value.some(
    (playlist) =>
      playlist.id === id ||
      playlist.sourcePlaylistId === id ||
      playlist.remotePlaylistId === id,
  )
}

function updatePlaylistAt(index: number, updater: (playlist: LibraryPlaylist) => void) {
  const current = playlists.value[index]
  if (!current) {
    return
  }

  const next = { ...current, tracks: [...(current.tracks ?? [])] }
  updater(next)
  refreshLibraryPlaylistMeta(next)
  playlists.value.splice(index, 1, next)
}

function mapRemoteUserPlaylist(dto: UserPlaylistDto, userId: number): LibraryPlaylist | null {
  const remoteId = dto.id != null ? String(dto.id) : ''
  const title = dto.name?.trim()
  if (!remoteId || !title) {
    return null
  }

  if (dto.specialType === 5) {
    return null
  }

  const isCollected = dto.subscribed === true || dto.creator?.userId !== userId
  const kind = isCollected ? 'collected' : 'created'

  return normalizeLibraryPlaylist({
    id: remoteId,
    remotePlaylistId: remoteId,
    kind,
    title,
    subtitle: '',
    cover: dto.coverImgUrl ?? '',
    description: title,
    tracks: [],
    sourcePlaylistId: isCollected ? remoteId : undefined,
    createdAt: Date.now(),
  })
}

export function useLibraryPlaylists() {
  const playlistCount = computed(() => playlists.value.length)

  const isLibraryFull = computed(() => playlistCount.value >= LIBRARY_PLAYLIST_MAX)

  const remainingSlots = computed(() =>
    Math.max(LIBRARY_PLAYLIST_MAX - playlistCount.value, 0),
  )

  function getPlaylistById(id: string) {
    return playlists.value.find((playlist) => playlist.id === id)
  }

  function getPlaylistTracks(id: string): MediaCardItem[] {
    return getPlaylistById(id)?.tracks ?? []
  }

  function isSongInLikedPlaylist(songId: string | number) {
    const liked = getLikedPlaylist()
    if (!liked?.tracks?.length) {
      return false
    }

    const normalizedId = String(songId)
    return liked.tracks.some((track) => track.id === normalizedId)
  }

  function isTrackInPlaylist(playlistId: string, trackId: string | number) {
    const playlist = getPlaylistById(playlistId)
    if (!playlist?.tracks?.length) {
      return false
    }

    const normalizedId = String(trackId)
    return playlist.tracks.some((track) => track.id === normalizedId)
  }

  async function createPlaylist(
    title: string,
    options: { cookie?: string; privacy?: 0 | 10; type?: 'NORMAL' | 'VIDEO' | 'SHARED' } = {},
  ) {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || isLibraryFull.value) {
      return null
    }

    if (options.cookie) {
      const remote = await createRemotePlaylist(trimmedTitle, {
        cookie: options.cookie,
        privacy: options.privacy,
        type: options.type,
      })

      if (remote) {
        const playlist = normalizeLibraryPlaylist({
          id: remote.id,
          remotePlaylistId: remote.id,
          kind: 'created',
          title: trimmedTitle,
          subtitle: '',
          cover: '',
          description: `${trimmedTitle} · 自建歌单`,
          tracks: [],
          createdAt: Date.now(),
        })

        playlists.value.unshift(playlist)
        return playlist
      }
    }

    playlistSeq += 1
    const playlist = normalizeLibraryPlaylist({
      id: `pl-created-${playlistSeq}`,
      kind: 'created',
      title: trimmedTitle,
      subtitle: '',
      cover: '',
      description: `${trimmedTitle} · 自建歌单`,
      tracks: [],
      createdAt: Date.now(),
    })

    playlists.value.unshift(playlist)
    return playlist
  }

  async function collectPlaylist(
    item: MediaCardItem,
    options: { cookie?: string; sourcePlaylistId?: string } = {},
  ) {
    const sourceId = options.sourcePlaylistId ?? (/^\d+$/.test(item.id) ? item.id : undefined)
    if (!sourceId || isPlaylistInLibrary(sourceId) || isLibraryFull.value) {
      return null
    }

    if (options.cookie) {
      const subscribed = await subscribeRemotePlaylist(1, sourceId, { cookie: options.cookie })
      if (!subscribed) {
        return null
      }
    }

    const playlist = normalizeLibraryPlaylist({
      id: sourceId,
      remotePlaylistId: sourceId,
      kind: 'collected',
      title: item.title,
      subtitle: '',
      cover: item.image ?? '',
      description: item.subtitle ?? '收藏的歌单',
      tracks: [],
      sourcePlaylistId: sourceId,
      createdAt: Date.now(),
    })

    playlists.value.unshift(playlist)
    return playlist
  }

  async function deletePlaylist(
    playlistId: string,
    options: { cookie?: string } = {},
  ): Promise<boolean> {
    const index = findPlaylistIndex(playlistId)
    if (index === -1) {
      return false
    }

    const playlist = playlists.value[index]
    if (!playlist || playlist.kind === 'liked' || playlist.pinned) {
      return false
    }

    const remoteId = resolveRemotePlaylistId(playlist)

    if (options.cookie && remoteId) {
      const success =
        playlist.kind === 'collected'
          ? await subscribeRemotePlaylist(2, remoteId, { cookie: options.cookie })
          : await deleteRemotePlaylist(remoteId, { cookie: options.cookie })

      if (!success) {
        return false
      }
    }

    playlists.value.splice(index, 1)
    return true
  }

  async function addTrackToPlaylist(
    playlistId: string,
    track: MediaCardItem,
    options: { cookie?: string } = {},
  ): Promise<AddTrackResult> {
    const index = findPlaylistIndex(playlistId)
    if (index === -1) {
      return 'failed'
    }

    const playlist = playlists.value[index]
    if (!playlist) {
      return 'failed'
    }

    const tracks = playlist.tracks ?? []
    if (tracks.some((entry) => entry.id === track.id)) {
      return 'duplicate'
    }

    const remoteId = resolveRemotePlaylistId(playlist)

    if (options.cookie) {
      if (playlist.kind === 'liked') {
        const success = await likeSong(track.id, true, { cookie: options.cookie })
        if (!success) {
          return 'failed'
        }
      } else if (playlist.kind === 'created' && remoteId) {
        const success = await manipulatePlaylistTracks('add', remoteId, track.id, {
          cookie: options.cookie,
        })
        if (!success) {
          return 'failed'
        }
      }
    }

    updatePlaylistAt(index, (entry) => {
      entry.tracks = [...(entry.tracks ?? []), track]
    })

    return 'added'
  }

  async function removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    options: { cookie?: string } = {},
  ) {
    const index = findPlaylistIndex(playlistId)
    if (index === -1) {
      return false
    }

    const playlist = playlists.value[index]
    if (!playlist) {
      return false
    }

    const remoteId = resolveRemotePlaylistId(playlist)
    if (options.cookie && remoteId && playlist.kind === 'created') {
      const success = await manipulatePlaylistTracks('del', remoteId, trackId, {
        cookie: options.cookie,
      })
      if (!success) {
        return false
      }
    }

    updatePlaylistAt(index, (entry) => {
      entry.tracks = (entry.tracks ?? []).filter((track) => track.id !== trackId)
    })

    return true
  }

  async function toggleLikedSong(
    song: Song | null,
    options: { cookie?: string } = {},
  ): Promise<boolean> {
    if (!song?.src) {
      return false
    }

    const liked = getLikedPlaylist()
    if (!liked) {
      return false
    }

    const track = songToMediaCardItem(song)
    const isLiked = isSongInLikedPlaylist(song.id)
    const nextLiked = !isLiked

    if (options.cookie) {
      const success = await likeSong(song.id, nextLiked, { cookie: options.cookie })
      if (!success) {
        return isLiked
      }
    }

    if (nextLiked) {
      await addTrackToPlaylist(liked.id, track)
    } else {
      await removeTrackFromPlaylist(liked.id, track.id)
    }

    return nextLiked
  }

  async function syncFromRemoteUserPlaylists(cookie: string, userId: number) {
    const remotePlaylists = await fetchUserPlaylists({ cookie, uid: userId })
    const likedRemoteId = findLikedPlaylistId(remotePlaylists)

    const likedIndex = findPlaylistIndex(LIKED_PLAYLIST_ID)
    if (likedIndex !== -1 && likedRemoteId) {
      updatePlaylistAt(likedIndex, (playlist) => {
        playlist.remotePlaylistId = likedRemoteId
      })
    }

    for (const dto of remotePlaylists) {
      if (playlistCount.value >= LIBRARY_PLAYLIST_MAX) {
        break
      }

      const remoteId = dto.id != null ? String(dto.id) : ''
      if (!remoteId || dto.specialType === 5 || isPlaylistInLibrary(remoteId)) {
        continue
      }

      const mapped = mapRemoteUserPlaylist(dto, userId)
      if (mapped) {
        playlists.value.unshift(mapped)
      }
    }
  }

  function buildLibraryPlaylistPage(id: string): PlaylistPageData | null {
    const libraryItem = getPlaylistById(id)
    if (!libraryItem) {
      return null
    }

    const tracks = libraryItem.tracks ?? []

    return {
      id: libraryItem.id,
      name: libraryItem.title,
      cover: libraryItem.cover,
      description: libraryItem.description ?? libraryItem.subtitle,
      creatorName: libraryItem.kind === 'collected' ? '收藏' : '你',
      trackCount: tracks.length,
      subtitle: libraryItem.subtitle,
      tracks,
    }
  }

  return {
    playlists: sortedPlaylists,
    playlistCount,
    isLibraryFull,
    remainingSlots,
    libraryPlaylistMax: LIBRARY_PLAYLIST_MAX,
    createPlaylist,
    collectPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistTracks,
    isPlaylistInLibrary,
    isSongInLikedPlaylist,
    isTrackInPlaylist,
    toggleLikedSong,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    syncFromRemoteUserPlaylists,
    buildLibraryPlaylistPage,
  }
}
