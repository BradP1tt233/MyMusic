import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import type { MediaCardItem } from '@/types/media'
import type { SongDetailDto, SongDetailResponse } from '@/types/songDetail'

const SONG_DETAIL_BATCH_SIZE = 200
const SONG_COVER_CACHE_MAX = 512

const songCoverCache = new Map<string, string>()

function buildSongDetailUrl(ids: string[]) {
  return withTimestamp(resolveRequestUrl(`/song/detail?ids=${ids.join(',')}`))
}

function resolveArtistName(song: SongDetailDto) {
  if (!song.ar?.length) {
    return undefined
  }

  return song.ar.map((artist) => artist.name).filter(Boolean).join(' / ')
}

export function getCachedSongCover(id: string) {
  return songCoverCache.get(id) ?? ''
}

export function rememberSongCover(id: string, url: string) {
  if (!id || !url) {
    return
  }

  if (songCoverCache.has(id)) {
    songCoverCache.delete(id)
  }

  songCoverCache.set(id, url)

  if (songCoverCache.size > SONG_COVER_CACHE_MAX) {
    const oldest = songCoverCache.keys().next().value
    if (oldest) {
      songCoverCache.delete(oldest)
    }
  }
}

export function applyCachedCoversToItems(items: MediaCardItem[]) {
  return items.map((item) => {
    if (item.image) {
      rememberSongCover(item.id, item.image)
      return item
    }

    const cached = getCachedSongCover(item.id)
    if (!cached) {
      return item
    }

    return { ...item, image: cached }
  })
}

export function mapSongDetailToMediaItem(detail: SongDetailDto): MediaCardItem | null {
  const id = detail.id != null ? String(detail.id) : ''
  const title = detail.name?.trim()

  if (!id || !title) {
    return null
  }

  const image = detail.al?.picUrl ?? ''

  if (image) {
    rememberSongCover(id, image)
  }

  return {
    id,
    title,
    subtitle: resolveArtistName(detail),
    image,
    type: 'track',
    duration: detail.dt,
    albumName: detail.al?.name,
  }
}

export async function fetchSongDetailMap(ids: string[]) {
  const detailMap = new Map<string, SongDetailDto>()
  const uniqueIds = [...new Set(ids.filter((id) => /^\d+$/.test(id)))]

  if (uniqueIds.length === 0) {
    return detailMap
  }

  for (let index = 0; index < uniqueIds.length; index += SONG_DETAIL_BATCH_SIZE) {
    const batch = uniqueIds.slice(index, index + SONG_DETAIL_BATCH_SIZE)

    try {
      const payload = await requestJson<SongDetailResponse>(buildSongDetailUrl(batch))

      for (const song of payload.songs ?? []) {
        if (song.id != null) {
          detailMap.set(String(song.id), song)
        }
      }
    } catch {
      // ignore detail failures for this batch
    }
  }

  return detailMap
}

export function mergeSongDetailIntoMediaItem(item: MediaCardItem, detail: SongDetailDto): MediaCardItem {
  const mapped = mapSongDetailToMediaItem(detail)

  if (!mapped) {
    return item
  }

  return {
    ...item,
    title: mapped.title,
    subtitle: mapped.subtitle || item.subtitle,
    image: mapped.image || item.image,
    duration: mapped.duration ?? item.duration,
    albumName: mapped.albumName ?? item.albumName,
  }
}

export async function attachSongDetailsToItems(items: MediaCardItem[]) {
  if (items.length === 0) {
    return items
  }

  const withCache = applyCachedCoversToItems(items)
  const missingIds = withCache.filter((item) => !item.image).map((item) => item.id)

  if (missingIds.length === 0) {
    return withCache
  }

  const detailMap = await fetchSongDetailMap(missingIds)

  return withCache.map((item) => {
    if (item.image) {
      return item
    }

    const detail = detailMap.get(item.id)
    if (!detail) {
      return item
    }

    return mergeSongDetailIntoMediaItem(item, detail)
  })
}
