import { LIBRARY_PLAYLIST_STORAGE_KEY } from '@/constants/library'
import { defaultLibraryPlaylists } from '@/data/catalog'
import { normalizeLibraryPlaylist } from '@/utils/libraryPlaylist'
import type { LibraryPlaylist } from '@/types/media'

export type LibraryPlaylistSnapshot = {
  playlists: LibraryPlaylist[]
  nextSeq: number
}

function isLibraryPlaylist(value: unknown): value is LibraryPlaylist {
  if (!value || typeof value !== 'object') {
    return false
  }

  const entry = value as LibraryPlaylist
  return (
    typeof entry.id === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.subtitle === 'string' &&
    typeof entry.cover === 'string'
  )
}

function normalizeSnapshot(raw: unknown): LibraryPlaylistSnapshot | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const data = raw as Partial<LibraryPlaylistSnapshot>
  if (!Array.isArray(data.playlists)) {
    return null
  }

  const playlists = data.playlists.filter(isLibraryPlaylist).map(normalizeLibraryPlaylist)
  if (playlists.length === 0) {
    return null
  }

  const nextSeq = typeof data.nextSeq === 'number' && data.nextSeq > 0 ? data.nextSeq : 1

  return { playlists, nextSeq }
}

export function createDefaultLibrarySnapshot(): LibraryPlaylistSnapshot {
  return {
    playlists: defaultLibraryPlaylists.map(normalizeLibraryPlaylist),
    nextSeq: 1,
  }
}

export function readLibraryPlaylistSnapshot(): LibraryPlaylistSnapshot {
  try {
    const raw = localStorage.getItem(LIBRARY_PLAYLIST_STORAGE_KEY)
    if (!raw) {
      return createDefaultLibrarySnapshot()
    }

    const parsed = normalizeSnapshot(JSON.parse(raw))
    return parsed ?? createDefaultLibrarySnapshot()
  } catch {
    return createDefaultLibrarySnapshot()
  }
}

export function writeLibraryPlaylistSnapshot(snapshot: LibraryPlaylistSnapshot) {
  try {
    localStorage.setItem(LIBRARY_PLAYLIST_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // 存储失败时忽略，避免阻断播放流程
  }
}
