import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { attachSongUrlsV1ToItems } from '@/api/songUrl'
import type { MediaCardItem } from '@/types/media'
import type {
  FetchPlaylistTracksOptions,
  PlaylistDetailResponse,
  PlaylistPageData,
  PlaylistSongDto,
  PlaylistTracksResponse,
} from '@/types/playlist'

const TRACK_PAGE_SIZE = 100

function buildPlaylistUrl(path: string, id: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ id, ...extra })
  return withTimestamp(resolveRequestUrl(`${path}?${params.toString()}`))
}

function resolveArtistName(song?: PlaylistSongDto) {
  if (!song?.ar?.length) {
    return undefined
  }

  return song.ar.map((artist) => artist.name).filter(Boolean).join(' / ')
}

function resolveSongCover(song?: PlaylistSongDto) {
  return song?.al?.picUrl ?? ''
}

export function mapPlaylistSongToMediaItem(song: PlaylistSongDto): MediaCardItem | null {
  const id = song.id != null ? String(song.id) : ''
  const title = song.name ?? ''
  const image = resolveSongCover(song)

  if (!id || !title) {
    return null
  }

  return {
    id,
    title,
    subtitle: resolveArtistName(song),
    image,
    type: 'track',
    duration: song.dt,
    albumName: song.al?.name,
  }
}

export async function fetchPlaylistDetail(id: string) {
  try {
    const payload = await requestJson<PlaylistDetailResponse>(
      buildPlaylistUrl('/playlist/detail', id),
    )
    return payload.playlist ?? null
  } catch {
    return null
  }
}

export async function fetchPlaylistTracks(
  id: string,
  options: FetchPlaylistTracksOptions = {},
): Promise<MediaCardItem[]> {
  const limit = options.limit ?? TRACK_PAGE_SIZE
  const offset = options.offset ?? 0
  const params: Record<string, string> = {
    limit: String(limit),
    offset: String(offset),
  }

  try {
    const payload = await requestJson<PlaylistTracksResponse>(
      buildPlaylistUrl('/playlist/track/all', id, params),
    )

    return (payload.songs ?? [])
      .map(mapPlaylistSongToMediaItem)
      .filter((item): item is MediaCardItem => item !== null)
  } catch {
    return []
  }
}

async function fetchAllPlaylistTracks(id: string, trackCount: number) {
  const merged: MediaCardItem[] = []
  let offset = 0

  while (offset < trackCount) {
    const limit = Math.min(TRACK_PAGE_SIZE, trackCount - offset)
    const batch = await fetchPlaylistTracks(id, { limit, offset })

    if (batch.length === 0) {
      break
    }

    merged.push(...batch)
    offset += batch.length

    if (batch.length < limit) {
      break
    }
  }

  return merged
}

function buildPlaylistPageData(
  id: string,
  detail: NonNullable<Awaited<ReturnType<typeof fetchPlaylistDetail>>>,
  tracks: MediaCardItem[],
): PlaylistPageData {
  const name = detail.name ?? '歌单'
  const trackCount = detail.trackCount ?? tracks.length
  const creatorName = detail.creator?.nickname ?? 'myMusicPlayer'

  return {
    id,
    name,
    cover: detail.coverImgUrl ?? tracks[0]?.image ?? '',
    description: detail.description ?? '',
    creatorName,
    trackCount,
    subtitle: `${creatorName} • ${trackCount} 首歌曲`,
    tracks,
  }
}

export async function fetchPlaylistPageData(id: string): Promise<PlaylistPageData | null> {
  try {
    const detail = await fetchPlaylistDetail(id)
    if (!detail?.name) {
      return null
    }

    const trackCount = detail.trackCount ?? TRACK_PAGE_SIZE
    const tracks = await fetchAllPlaylistTracks(id, trackCount)
    const tracksWithUrls = await attachSongUrlsV1ToItems(tracks)

    return buildPlaylistPageData(id, detail, tracksWithUrls)
  } catch {
    return null
  }
}

export async function fetchPlaylistTracksForPlay(id: string): Promise<MediaCardItem[]> {
  const detail = await fetchPlaylistDetail(id)
  if (!detail) {
    return []
  }

  const trackCount = detail.trackCount ?? TRACK_PAGE_SIZE
  const tracks = await fetchAllPlaylistTracks(id, trackCount)

  if (tracks.length === 0) {
    return []
  }

  return attachSongUrlsV1ToItems(tracks)
}
