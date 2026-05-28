import {
  DEFAULT_EMPTY_PLAYLIST_COVER,
  LIBRARY_PLAYLIST_KIND_LABEL,
  LIKED_PLAYLIST_COVER,
  LIKED_PLAYLIST_ID,
} from '@/constants/library'
import type { Song } from '@/types'
import type { LibraryPlaylist, LibraryPlaylistKind, MediaCardItem } from '@/types/media'

export function isImageCover(cover: string) {
  return cover.startsWith('http://') || cover.startsWith('https://') || cover.startsWith('/')
}

export function formatLibraryPlaylistSubtitle(kind: LibraryPlaylistKind, trackCount: number) {
  const label = LIBRARY_PLAYLIST_KIND_LABEL[kind]
  return `${label} • ${trackCount} 首歌曲`
}

export function resolvePlaylistCover(
  tracks: MediaCardItem[] | undefined,
  kind: LibraryPlaylistKind,
) {
  const firstImage = tracks?.[0]?.image
  if (firstImage) {
    return firstImage
  }

  if (kind === 'liked') {
    return LIKED_PLAYLIST_COVER
  }

  return DEFAULT_EMPTY_PLAYLIST_COVER
}

export function songToMediaCardItem(song: Song): MediaCardItem {
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

export function refreshLibraryPlaylistMeta(playlist: LibraryPlaylist) {
  const tracks = playlist.tracks ?? []
  playlist.subtitle = formatLibraryPlaylistSubtitle(playlist.kind, tracks.length)
  playlist.cover = resolvePlaylistCover(tracks, playlist.kind)
}

export function inferLibraryPlaylistKind(
  playlist: Partial<LibraryPlaylist> & Pick<LibraryPlaylist, 'id'>,
): LibraryPlaylistKind {
  if (playlist.kind) {
    return playlist.kind
  }

  if (playlist.id === LIKED_PLAYLIST_ID) {
    return 'liked'
  }

  if (playlist.id.startsWith('pl-collected-') || playlist.sourcePlaylistId) {
    return 'collected'
  }

  return 'created'
}

export function normalizeLibraryPlaylist(raw: LibraryPlaylist): LibraryPlaylist {
  const kind = inferLibraryPlaylistKind(raw)
  const playlist: LibraryPlaylist = {
    ...raw,
    kind,
    tracks: Array.isArray(raw.tracks) ? raw.tracks : [],
    createdAt: raw.createdAt ?? Date.now(),
  }

  refreshLibraryPlaylistMeta(playlist)
  return playlist
}

export function resolveRemotePlaylistId(playlist: LibraryPlaylist) {
  if (playlist.remotePlaylistId) {
    return playlist.remotePlaylistId
  }

  if (/^\d+$/.test(playlist.id)) {
    return playlist.id
  }

  return playlist.sourcePlaylistId
}

export function isRemotePlaylistId(id: string) {
  return /^\d+$/.test(id)
}

export function sortLibraryPlaylists(playlists: LibraryPlaylist[]) {
  return [...playlists].sort((left, right) => {
    if (left.pinned && !right.pinned) {
      return -1
    }

    if (!left.pinned && right.pinned) {
      return 1
    }

    return (right.createdAt ?? 0) - (left.createdAt ?? 0)
  })
}
