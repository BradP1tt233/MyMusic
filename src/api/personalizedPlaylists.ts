import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { recommendedPlaylistsFallback } from '@/data/catalog'
import { RECOMMENDED_PLAYLISTS_DEFAULT_LIMIT } from '@/constants/discover'
import type { MediaCardItem } from '@/types/media'
import type {
  FetchPersonalizedPlaylistsOptions,
  PersonalizedPlaylistDto,
  PersonalizedPlaylistsResponse,
} from '@/types/personalizedPlaylist'

function buildPersonalizedUrl(options: FetchPersonalizedPlaylistsOptions = {}) {
  const limit = options.limit ?? RECOMMENDED_PLAYLISTS_DEFAULT_LIMIT
  const path = `/personalized?limit=${limit}`
  return withTimestamp(resolveRequestUrl(path))
}

function resolvePlaylistSubtitle(dto: PersonalizedPlaylistDto) {
  if (dto.copywriter) {
    return dto.copywriter
  }

  if (dto.trackCount != null) {
    return `歌单 • ${dto.trackCount} 首`
  }

  return '歌单'
}

export function mapPersonalizedPlaylistToMediaItem(
  dto: PersonalizedPlaylistDto,
): MediaCardItem | null {
  const id = dto.id != null ? String(dto.id) : ''
  const title = dto.name ?? ''
  const image = dto.picUrl ?? ''

  if (!id || !title || !image) {
    return null
  }

  return {
    id,
    title,
    subtitle: resolvePlaylistSubtitle(dto),
    image,
    type: 'playlist',
  }
}

export async function fetchPersonalizedPlaylists(
  options: FetchPersonalizedPlaylistsOptions = {},
): Promise<MediaCardItem[]> {
  const endpoint = buildPersonalizedUrl(options)

  try {
    const payload = await requestJson<PersonalizedPlaylistsResponse>(endpoint)
    const mapped = (payload.result ?? [])
      .map(mapPersonalizedPlaylistToMediaItem)
      .filter((item): item is MediaCardItem => item !== null)

    if (mapped.length === 0) {
      return [...recommendedPlaylistsFallback]
    }

    return mapped
  } catch {
    return [...recommendedPlaylistsFallback]
  }
}
