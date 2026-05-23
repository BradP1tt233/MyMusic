import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { attachSongUrlsToItems } from '@/api/songUrl'
import { FEATURED_CHART_PRESETS, FEATURED_CHARTS_LIST_LIMIT } from '@/constants/discover'
import type { ChartPreset } from '@/constants/discover'
import type { MediaCardItem } from '@/types/media'
import type {
  ChartListItemDto,
  ChartListResponse,
  ChartSongDto,
  FetchChartListOptions,
} from '@/types/chart'

function buildChartListUrl(options: FetchChartListOptions) {
  const limit = options.limit ?? FEATURED_CHARTS_LIST_LIMIT
  const offset = options.offset ?? 0
  const params = new URLSearchParams({
    chartCode: options.chartCode,
    targetId: options.targetId,
    targetType: options.targetType,
    limit: String(limit),
    offset: String(offset),
  })
  return withTimestamp(resolveRequestUrl(`/chart/list?${params.toString()}`))
}

function resolveArtistName(song?: ChartSongDto) {
  if (!song?.ar?.length) return undefined
  return song.ar.map((artist) => artist.name).filter(Boolean).join(' / ')
}

function resolveSongCover(song?: ChartSongDto) {
  return (
    song?.al?.picUrl ??
    (song?.al as { extProperties?: { picUrl?: string }; xInfo?: { picUrl?: string } } | undefined)
      ?.extProperties?.picUrl ??
    (song?.al as { xInfo?: { picUrl?: string } } | undefined)?.xInfo?.picUrl ??
    ''
  )
}

export function mapChartSongToMediaItem(entry: ChartListItemDto): MediaCardItem | null {
  const song = entry.songData
  const id = song?.id != null ? String(song.id) : ''
  const title = song?.name ?? ''
  const image = resolveSongCover(song)

  if (!id || !title || !image) {
    return null
  }

  return {
    id,
    title,
    subtitle: resolveArtistName(song) ?? entry.reason,
    image,
    type: 'track',
  }
}

export async function fetchChartListTracks(
  options: FetchChartListOptions,
): Promise<MediaCardItem[]> {
  const endpoint = buildChartListUrl(options)

  try {
    const payload = await requestJson<ChartListResponse>(endpoint)
    const mapped = (payload.data?.charts ?? [])
      .map(mapChartSongToMediaItem)
      .filter((item): item is MediaCardItem => item !== null)

    if (mapped.length === 0) {
      return []
    }

    return attachSongUrlsToItems(mapped)
  } catch {
    return []
  }
}

export async function fetchFeaturedChartTracks(
  presets: ChartPreset[] = FEATURED_CHART_PRESETS,
  limit = FEATURED_CHARTS_LIST_LIMIT,
): Promise<MediaCardItem[]> {
  const perPresetLimit = Math.max(5, Math.ceil(limit / presets.length))
  const batches = await Promise.all(
    presets.map((preset) =>
      fetchChartListTracks({ ...preset, limit: perPresetLimit, offset: 0 }),
    ),
  )

  const merged: MediaCardItem[] = []
  const seen = new Set<string>()

  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      merged.push(item)

      if (merged.length >= limit) {
        return merged
      }
    }
  }

  if (merged.length === 0) {
    return []
  }

  return merged
}
