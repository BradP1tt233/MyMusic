import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { mapTopArtistToMediaItem } from '@/api/topArtists'
import { attachSongUrlsToItems } from '@/api/songUrl'
import type { MediaCardItem } from '@/types/media'
import {
  ARTIST_SONGS_DEFAULT_LIMIT,
  type ArtistAlbumDto,
  type ArtistAlbumResponse,
  type ArtistDescResponse,
  type ArtistDetailResponse,
  type ArtistInfoDto,
  type ArtistPageData,
  type ArtistSongDto,
  type ArtistSongsResponse,
  type ArtistsResponse,
  type FetchArtistSongsOptions,
  type SimiArtistResponse,
} from '@/types/artist'

const DEFAULT_ALBUM_LIMIT = 20

function extractArtistSongs(payload: ArtistSongsResponse) {
  return payload.songs ?? []
}

function buildArtistUrl(path: string, id: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ id, ...extra })
  return withTimestamp(resolveRequestUrl(`${path}?${params.toString()}`))
}

function resolveArtistName(song?: ArtistSongDto) {
  if (!song?.ar?.length) {
    return undefined
  }

  return song.ar.map((artist) => artist.name).filter(Boolean).join(' / ')
}

function resolveSongCover(song?: ArtistSongDto) {
  return song?.al?.picUrl ?? ''
}

function resolveArtistImage(artist?: ArtistInfoDto) {
  return artist?.picUrl ?? artist?.img1v1Url ?? ''
}

export function mapArtistSongToMediaItem(song: ArtistSongDto): MediaCardItem | null {
  const id = song.id != null ? String(song.id) : ''
  const title = song.name ?? ''
  const image = resolveSongCover(song)

  if (!id || !title || !image) {
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

export function mapArtistAlbumToMediaItem(album: ArtistAlbumDto): MediaCardItem | null {
  const id = album?.id != null ? String(album.id) : ''
  const title = album?.name ?? ''
  const image = album?.picUrl ?? ''

  if (!id || !title || !image) {
    return null
  }

  const trackCount = album.size ? `${album.size} 首` : '专辑'

  return {
    id,
    title,
    subtitle: trackCount,
    image,
    type: 'album',
  }
}

function formatArtistDescription(desc?: ArtistDescResponse, fallback?: string) {
  if (desc?.introduction?.length) {
    return desc.introduction
      .map((section) => {
        const title = section.ti?.trim()
        const text = section.txt?.trim()
        if (title && text) {
          return `${title}\n${text}`
        }
        return text ?? title ?? ''
      })
      .filter(Boolean)
      .join('\n\n')
  }

  return desc?.briefDesc ?? fallback ?? ''
}

function buildArtistPageData(
  id: string,
  artistsRes: ArtistsResponse,
  detailRes: ArtistDetailResponse,
  descRes: ArtistDescResponse,
  albumRes: ArtistAlbumResponse,
  simiRes: SimiArtistResponse,
  hotTracks: MediaCardItem[],
): ArtistPageData | null {
  const baseArtist = artistsRes.artist
  const detailArtist = detailRes.data?.artist
  const name = detailArtist?.name ?? baseArtist?.name ?? ''

  if (!name) {
    return null
  }

  const cover =
    detailArtist?.cover ??
    resolveArtistImage(baseArtist) ??
    detailArtist?.avatar ??
    ''

  const avatar = detailArtist?.avatar ?? baseArtist?.img1v1Url ?? cover
  const musicSize = baseArtist?.musicSize ?? 0
  const albumSize = baseArtist?.albumSize ?? albumRes.hotAlbums?.length ?? 0
  const subtitle = `${musicSize.toLocaleString()} 首歌曲`

  const albums = (albumRes.hotAlbums ?? [])
    .map(mapArtistAlbumToMediaItem)
    .filter((item): item is MediaCardItem => item !== null)

  const similarArtists = (simiRes.artists ?? [])
    .map(mapTopArtistToMediaItem)
    .filter((item): item is MediaCardItem => item !== null)

  return {
    id,
    name,
    cover,
    avatar,
    subtitle,
    identifyLabel: detailRes.data?.identify?.imageDesc,
    description: formatArtistDescription(descRes, baseArtist?.briefDesc),
    musicSize,
    albumSize,
    hotTracks,
    albums,
    similarArtists,
  }
}

export async function fetchArtistSongs(
  id: string,
  options: FetchArtistSongsOptions = {},
): Promise<MediaCardItem[]> {
  const limit = options.limit ?? ARTIST_SONGS_DEFAULT_LIMIT
  const offset = options.offset ?? 0
  const order = options.order ?? 'hot'

  try {
    const payload = await requestJson<ArtistSongsResponse>(
      buildArtistUrl('/artist/songs', id, {
        order,
        limit: String(limit),
        offset: String(offset),
      }),
    )

    const mapped = extractArtistSongs(payload)
      .map(mapArtistSongToMediaItem)
      .filter((item): item is MediaCardItem => item !== null)

    if (mapped.length === 0) {
      return []
    }

    return attachSongUrlsToItems(mapped)
  } catch {
    return []
  }
}

export async function fetchArtistHotTracks(id: string): Promise<MediaCardItem[]> {
  return fetchArtistSongs(id, { order: 'hot', limit: ARTIST_SONGS_DEFAULT_LIMIT, offset: 0 })
}

export async function fetchArtistPageData(id: string): Promise<ArtistPageData | null> {
  try {
    const [artistsRes, detailRes, descRes, albumRes, simiRes] = await Promise.all([
      requestJson<ArtistsResponse>(buildArtistUrl('/artists', id)),
      requestJson<ArtistDetailResponse>(buildArtistUrl('/artist/detail', id)),
      requestJson<ArtistDescResponse>(buildArtistUrl('/artist/desc', id)),
      requestJson<ArtistAlbumResponse>(
        buildArtistUrl('/artist/album', id, {
          limit: String(DEFAULT_ALBUM_LIMIT),
          offset: '0',
        }),
      ),
      requestJson<SimiArtistResponse>(buildArtistUrl('/simi/artist', id)),
    ])

    const hotTracks = await fetchArtistSongs(id, {
      order: 'hot',
      limit: ARTIST_SONGS_DEFAULT_LIMIT,
      offset: 0,
    })

    return buildArtistPageData(id, artistsRes, detailRes, descRes, albumRes, simiRes, hotTracks)
  } catch {
    return null
  }
}
