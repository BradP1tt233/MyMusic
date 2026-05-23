import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { popularArtistsFallback } from '@/data/catalog'
import { POPULAR_ARTISTS_DEFAULT_LIMIT } from '@/constants/discover'
import type { MediaCardItem } from '@/types/media'
import type { FetchTopArtistsOptions, TopArtistDto, TopArtistsResponse } from '@/types/topArtist'

function buildTopArtistsUrl(options: FetchTopArtistsOptions = {}) {
  const limit = options.limit ?? POPULAR_ARTISTS_DEFAULT_LIMIT
  const offset = options.offset ?? 0
  const path = `/top/artists?offset=${offset}&limit=${limit}`
  return withTimestamp(resolveRequestUrl(path))
}

function resolveArtistSubtitle(dto: TopArtistDto) {
  if (Array.isArray(dto.transNames) && dto.transNames.length > 0) {
    return dto.transNames.join(' / ')
  }

  if (Array.isArray(dto.alias) && dto.alias.length > 0) {
    return dto.alias.join(' / ')
  }

  return '艺人'
}

function resolveArtistImage(dto: TopArtistDto) {
  return dto.picUrl ?? dto.img1v1Url ?? ''
}

export function mapTopArtistToMediaItem(dto: TopArtistDto): MediaCardItem | null {
  const id = dto.id != null ? String(dto.id) : ''
  const title = dto.name ?? ''
  const image = resolveArtistImage(dto)

  if (!id || !title || !image) {
    return null
  }

  return {
    id,
    title,
    subtitle: resolveArtistSubtitle(dto),
    image,
    type: 'artist',
  }
}

export async function fetchTopArtists(options: FetchTopArtistsOptions = {}): Promise<MediaCardItem[]> {
  const endpoint = buildTopArtistsUrl(options)

  try {
    const payload = await requestJson<TopArtistsResponse>(endpoint)
    const mapped = (payload.artists ?? [])
      .map(mapTopArtistToMediaItem)
      .filter((item): item is MediaCardItem => item !== null)

    if (mapped.length === 0) {
      return [...popularArtistsFallback]
    }

    return mapped
  } catch {
    return [...popularArtistsFallback]
  }
}
