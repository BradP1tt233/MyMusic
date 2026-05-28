import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { mapArtistAlbumToMediaItem, mapArtistSongToMediaItem } from '@/api/artist'
import { mapTopArtistToMediaItem } from '@/api/topArtists'
import { attachSongDetailsToItems, applyCachedCoversToItems } from '@/api/songDetail'
import { attachSongUrlsToItems } from '@/api/songUrl'
import {
  SEARCH_DEFAULT_LIMIT,
  SEARCH_SUGGEST_ARTIST_LIMIT,
  SEARCH_SUGGEST_SONG_LIMIT,
  SEARCH_TYPE,
  type SearchTypeValue,
} from '@/constants/search'
import type { MediaCardItem } from '@/types/media'
import type {
  FetchSearchResultsOptions,
  SearchCloudResponse,
  SearchDefaultResponse,
  SearchHotResponse,
  SearchMultimatchResponse,
  SearchPageData,
  SearchPlaylistDto,
  SearchSuggestResponse,
  SearchSuggestSongDto,
} from '@/types/search'

function buildSearchUrl(path: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue
    }

    searchParams.set(key, String(value))
  }

  return withTimestamp(resolveRequestUrl(`${path}?${searchParams.toString()}`))
}

function mapSearchSuggestSongToMediaItem(song: SearchSuggestSongDto): MediaCardItem | null {
  const id = song.id != null ? String(song.id) : ''
  const title = song.name ?? ''
  const image = song.album?.picUrl ?? song.al?.picUrl ?? ''

  if (!id || !title) {
    return null
  }

  const subtitle =
    song.artists?.map((artist) => artist.name).filter(Boolean).join(' / ') ??
    song.ar?.map((artist) => artist.name).filter(Boolean).join(' / ')

  return {
    id,
    title,
    subtitle,
    image,
    type: 'track',
    albumName: song.album?.name ?? song.al?.name,
  }
}

export function mapSearchPlaylistToMediaItem(dto: SearchPlaylistDto): MediaCardItem | null {
  const id = dto.id != null ? String(dto.id) : ''
  const title = dto.name ?? ''
  const image = dto.coverImgUrl ?? dto.picUrl ?? ''

  if (!id || !title || !image) {
    return null
  }

  const subtitle = dto.creator?.nickname
    ? `${dto.creator.nickname} • 歌单`
    : dto.trackCount != null
      ? `歌单 • ${dto.trackCount} 首`
      : '歌单'

  return {
    id,
    title,
    subtitle,
    image,
    type: 'playlist',
  }
}

function resolveSearchTotal(result: SearchCloudResponse['result'], type: SearchTypeValue) {
  if (!result) {
    return 0
  }

  switch (type) {
    case SEARCH_TYPE.album:
      return result.albumCount ?? result.albums?.length ?? 0
    case SEARCH_TYPE.artist:
      return result.artistCount ?? result.artists?.length ?? 0
    case SEARCH_TYPE.playlist:
      return result.playlistCount ?? result.playlists?.length ?? 0
    default:
      return result.songCount ?? result.songs?.length ?? 0
  }
}

function mapSearchResults(result: SearchCloudResponse['result'], type: SearchTypeValue) {
  if (!result) {
    return []
  }

  switch (type) {
    case SEARCH_TYPE.album:
      return (result.albums ?? [])
        .map(mapArtistAlbumToMediaItem)
        .filter((item): item is MediaCardItem => item !== null)
    case SEARCH_TYPE.artist:
      return (result.artists ?? [])
        .map(mapTopArtistToMediaItem)
        .filter((item): item is MediaCardItem => item !== null)
    case SEARCH_TYPE.playlist:
      return (result.playlists ?? [])
        .map(mapSearchPlaylistToMediaItem)
        .filter((item): item is MediaCardItem => item !== null)
    default:
      return (result.songs ?? [])
        .map(mapArtistSongToMediaItem)
        .filter((item): item is MediaCardItem => item !== null)
  }
}

export async function fetchSearchDefaultKeyword() {
  try {
    const payload = await requestJson<SearchDefaultResponse>(
      buildSearchUrl('/search/default', {}),
    )

    return payload.data?.showKeyword ?? payload.data?.realkeyword ?? ''
  } catch {
    return ''
  }
}

export async function fetchSearchHotKeywords() {
  try {
    const payload = await requestJson<SearchHotResponse>(buildSearchUrl('/search/hot', {}))
    return (payload.result?.hots ?? [])
      .map((item) => item.first?.trim())
      .filter((keyword): keyword is string => Boolean(keyword))
  } catch {
    return []
  }
}

export async function fetchSearchSuggest(keywords: string) {
  const trimmed = keywords.trim()
  if (!trimmed) {
    return null
  }

  try {
    const payload = await requestJson<SearchSuggestResponse>(
      buildSearchUrl('/search/suggest', { keywords: trimmed }),
    )

    return payload.result ?? null
  } catch {
    return null
  }
}

export async function fetchSearchSuggestPreview(keywords: string) {
  const result = await fetchSearchSuggest(keywords)
  if (!result) {
    return null
  }

  const mapped = mapSearchSuggestResponse(result)

  return {
    songs: applyCachedCoversToItems(mapped.songs.slice(0, SEARCH_SUGGEST_SONG_LIMIT)),
    artists: mapped.artists.slice(0, SEARCH_SUGGEST_ARTIST_LIMIT),
  }
}

export async function enrichSearchSuggestSongCovers(songs: MediaCardItem[]) {
  if (songs.length === 0 || songs.every((song) => Boolean(song.image))) {
    return songs
  }

  return attachSongDetailsToItems(songs)
}

export async function fetchSearchSuggestDropdownItems(keywords: string) {
  const preview = await fetchSearchSuggestPreview(keywords)
  if (!preview) {
    return null
  }

  const songs = await enrichSearchSuggestSongCovers(preview.songs)

  return {
    songs,
    artists: preview.artists,
  }
}

export async function fetchSearchMultimatch(keywords: string, type: SearchTypeValue = SEARCH_TYPE.song) {
  const trimmed = keywords.trim()
  if (!trimmed) {
    return null
  }

  try {
    const payload = await requestJson<SearchMultimatchResponse>(
      buildSearchUrl('/search/multimatch', { keywords: trimmed, type }),
    )

    return payload.result ?? null
  } catch {
    return null
  }
}

export async function fetchSearchResults(
  options: FetchSearchResultsOptions,
): Promise<SearchPageData | null> {
  const keywords = options.keywords.trim()
  if (!keywords) {
    return null
  }

  const type = options.type ?? SEARCH_TYPE.song
  const limit = options.limit ?? SEARCH_DEFAULT_LIMIT
  const offset = options.offset ?? 0

  try {
    const payload = await requestJson<SearchCloudResponse>(
      buildSearchUrl('/cloudsearch', {
        keywords,
        type,
        limit,
        offset,
      }),
    )

    const result = payload.result
    let items = mapSearchResults(result, type)

    if (type === SEARCH_TYPE.song && items.length > 0) {
      items = await attachSongUrlsToItems(items)
    }

    return {
      keywords,
      type,
      items,
      total: resolveSearchTotal(result, type),
      hasMore: Boolean(result?.hasMore),
      offset,
    }
  } catch {
    return null
  }
}

export function mapSearchSuggestToMediaItems(result: SearchCloudResponse['result'] | null) {
  if (!result) {
    return {
      songs: [] as MediaCardItem[],
      artists: [] as MediaCardItem[],
      albums: [] as MediaCardItem[],
      playlists: [] as MediaCardItem[],
    }
  }

  return {
    songs: (result.songs ?? [])
      .map(mapArtistSongToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
    artists: (result.artists ?? [])
      .map(mapTopArtistToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
    albums: (result.albums ?? [])
      .map(mapArtistAlbumToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
    playlists: (result.playlists ?? [])
      .map(mapSearchPlaylistToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
  }
}

export function mapSearchSuggestResponse(result: NonNullable<SearchSuggestResponse['result']>) {
  return {
    keyword: result.allMatch?.keyword ?? '',
    songs: (result.songs ?? [])
      .map(mapSearchSuggestSongToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
    artists: (result.artists ?? [])
      .map(mapTopArtistToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
    albums: (result.albums ?? [])
      .map(mapArtistAlbumToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
    playlists: (result.playlists ?? [])
      .map(mapSearchPlaylistToMediaItem)
      .filter((item): item is MediaCardItem => item !== null),
  }
}
