import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { dailyRecommendationFallback } from '@/data/catalog'
import type { MediaCardItem } from '@/types/media'
import type {
  DailyRecommendationDto,
  DailyRecommendationResponse,
  FetchDailyRecommendationsOptions,
  SongUrlResponse,
} from '@/types/dailyRecommendation'

const DAILY_RECOMMENDATIONS_PATH =
  import.meta.env.VITE_DAILY_RECOMMENDATIONS_API ?? '/recommend/songs'

const SONG_URL_BATCH_SIZE = 50

function appendQuery(url: string, key: string, value: string) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${key}=${encodeURIComponent(value)}`
}

function buildAuthenticatedUrl(path: string, options: FetchDailyRecommendationsOptions = {}) {
  let url = withTimestamp(resolveRequestUrl(path))

  if (options.cookie) {
    url = appendQuery(url, 'cookie', options.cookie)
  }

  if (options.afresh) {
    url = appendQuery(url, 'afresh', 'true')
  }

  return url
}

function extractDailyRecommendationList(payload: DailyRecommendationResponse): DailyRecommendationDto[] {
  if (Array.isArray(payload)) {
    return payload
  }

  const data = payload.data

  if (Array.isArray(data)) {
    return data
  }

  if (data && typeof data === 'object' && Array.isArray(data.dailySongs)) {
    return data.dailySongs
  }

  return payload.songs ?? payload.result ?? payload.list ?? []
}

function resolveArtistName(dto: DailyRecommendationDto) {
  if (dto.artist) return dto.artist
  if (dto.artistName) return dto.artistName

  if (Array.isArray(dto.ar) && dto.ar.length > 0) {
    return dto.ar.map((artist) => artist.name).filter(Boolean).join(' / ')
  }

  if (Array.isArray(dto.artists) && dto.artists.length > 0) {
    const firstArtist = dto.artists[0]
    if (typeof firstArtist === 'string') return firstArtist
    return firstArtist?.name
  }

  return undefined
}

function resolveCover(dto: DailyRecommendationDto) {
  return dto.al?.picUrl ?? dto.cover ?? dto.picUrl ?? dto.image ?? dto.albumPicUrl ?? ''
}

function resolveSrc(dto: DailyRecommendationDto) {
  return dto.src ?? dto.url ?? dto.songUrl ?? dto.audioUrl ?? ''
}

function resolveTitle(dto: DailyRecommendationDto) {
  return dto.name ?? dto.title ?? dto.songName ?? '未知歌曲'
}

/** 将 API DTO 转为页面卡片模型 */
export function mapDailyRecommendationToMediaItem(dto: DailyRecommendationDto): MediaCardItem | null {
  const id = String(dto.id ?? resolveTitle(dto))
  const title = resolveTitle(dto)
  const image = resolveCover(dto)

  if (!id || !title || !image) {
    return null
  }

  return {
    id,
    title,
    subtitle: resolveArtistName(dto),
    image,
    color: dto.color,
    type: 'track',
    src: resolveSrc(dto),
  }
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

async function fetchSongUrlMap(ids: string[], cookie?: string) {
  const urlMap = new Map<string, string>()

  if (ids.length === 0) {
    return urlMap
  }

  const batches = chunkItems(ids, SONG_URL_BATCH_SIZE)

  await Promise.all(
    batches.map(async (batch) => {
      let endpoint = buildAuthenticatedUrl(`/song/url?id=${batch.join(',')}`, { cookie })
      const payload = await requestJson<SongUrlResponse>(endpoint)

      for (const item of payload.data ?? []) {
        if (item.id && item.url) {
          urlMap.set(String(item.id), item.url)
        }
      }
    }),
  )

  return urlMap
}

function attachSongUrls(items: MediaCardItem[], urlMap: Map<string, string>) {
  return items.map((item) => ({
    ...item,
    src: urlMap.get(item.id) ?? item.src ?? '',
  }))
}

export async function fetchDailyRecommendations(
  options: FetchDailyRecommendationsOptions = {},
): Promise<MediaCardItem[]> {
  if (!options.cookie) {
    throw new Error('请先登录后查看每日推荐')
  }

  const endpoint = buildAuthenticatedUrl(DAILY_RECOMMENDATIONS_PATH, options)
  const payload = await requestJson<DailyRecommendationResponse>(endpoint)
  const mapped = extractDailyRecommendationList(payload)
    .map(mapDailyRecommendationToMediaItem)
    .filter((item): item is MediaCardItem => item !== null)

  if (mapped.length === 0) {
    return [...dailyRecommendationFallback]
  }

  const urlMap = await fetchSongUrlMap(
    mapped.map((item) => item.id),
    options.cookie,
  )

  return attachSongUrls(mapped, urlMap)
}
