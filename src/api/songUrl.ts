import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import type { MediaCardItem } from '@/types/media'
import type { SongUrlResponse } from '@/types/dailyRecommendation'

export type SongUrlLevel =
  | 'standard'
  | 'higher'
  | 'exhigh'
  | 'lossless'
  | 'hires'
  | 'jyeffect'
  | 'sky'
  | 'dolby'
  | 'jymaster'

export type SongUrlV1Response = {
  code?: number
  data?: Array<{
    id?: number | string
    url?: string
  }>
}

const SONG_URL_BATCH_SIZE = 50
const DEFAULT_SONG_URL_LEVEL: SongUrlLevel = 'exhigh'

export async function fetchSongUrlMap(ids: string[]) {
  const urlMap = new Map<string, string>()

  if (ids.length === 0) {
    return urlMap
  }

  const endpoint = withTimestamp(resolveRequestUrl(`/song/url?id=${ids.join(',')}`))

  try {
    const payload = await requestJson<SongUrlResponse>(endpoint)

    for (const item of payload.data ?? []) {
      if (item.id && item.url) {
        urlMap.set(String(item.id), item.url)
      }
    }
  } catch {
    // ignore url failures
  }

  return urlMap
}

export async function fetchSongUrlV1Map(ids: string[], level: SongUrlLevel = DEFAULT_SONG_URL_LEVEL) {
  const urlMap = new Map<string, string>()

  if (ids.length === 0) {
    return urlMap
  }

  for (let index = 0; index < ids.length; index += SONG_URL_BATCH_SIZE) {
    const batch = ids.slice(index, index + SONG_URL_BATCH_SIZE)
    const endpoint = withTimestamp(
      resolveRequestUrl(`/song/url/v1?id=${batch.join(',')}&level=${level}`),
    )

    try {
      const payload = await requestJson<SongUrlV1Response>(endpoint)

      for (const item of payload.data ?? []) {
        if (item.id && item.url) {
          urlMap.set(String(item.id), item.url)
        }
      }
    } catch {
      // ignore url failures for this batch
    }
  }

  return urlMap
}

export function attachSongUrls(items: MediaCardItem[], urlMap: Map<string, string>) {
  return items.map((item) => ({
    ...item,
    src: urlMap.get(item.id) ?? item.src ?? '',
  }))
}

export async function attachSongUrlsToItems(items: MediaCardItem[]) {
  const urlMap = await fetchSongUrlMap(items.map((item) => item.id))
  return attachSongUrls(items, urlMap)
}

export async function attachSongUrlsV1ToItems(
  items: MediaCardItem[],
  level: SongUrlLevel = DEFAULT_SONG_URL_LEVEL,
) {
  const urlMap = await fetchSongUrlV1Map(
    items.map((item) => item.id),
    level,
  )
  return attachSongUrls(items, urlMap)
}
