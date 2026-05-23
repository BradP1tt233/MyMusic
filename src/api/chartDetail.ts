import { requestJson } from '@/api/http'
import { resolveRequestUrl, withTimestamp } from '@/api/url'
import { FEATURED_CHART_PRESETS } from '@/constants/discover'
import type { ChartPreset } from '@/constants/discover'
import { featuredChartsFallback } from '@/data/catalog'
import { buildChartCardId } from '@/utils/chart'
import type { MediaCardItem } from '@/types/media'
import type { ChartDetailResponse, FetchChartDetailOptions } from '@/types/chart'

export { buildChartCardId } from '@/utils/chart'

function buildChartDetailUrl(options: FetchChartDetailOptions) {
  const params = new URLSearchParams({
    chartCode: options.chartCode,
    targetId: options.targetId,
    targetType: options.targetType,
  })
  return withTimestamp(resolveRequestUrl(`/chart/detail?${params.toString()}`))
}

export function mapChartDetailToMediaItem(
  preset: ChartPreset,
  detail?: ChartDetailResponse['data'],
): MediaCardItem {
  return {
    id: buildChartCardId(preset),
    title: detail?.name ?? preset.fallbackTitle,
    subtitle: detail?.description ?? '城市音乐排行榜',
    image: detail?.coverUrl ?? featuredChartsFallback[0]?.image ?? '',
    type: 'playlist',
  }
}

export async function fetchChartDetail(options: FetchChartDetailOptions): Promise<MediaCardItem | null> {
  const endpoint = buildChartDetailUrl(options)

  try {
    const payload = await requestJson<ChartDetailResponse>(endpoint)
    const item = mapChartDetailToMediaItem(options, payload.data)

    if (!item.image) {
      return null
    }

    return item
  } catch {
    return null
  }
}

export async function fetchFeaturedChartCards(
  presets: ChartPreset[] = FEATURED_CHART_PRESETS,
): Promise<MediaCardItem[]> {
  const results = await Promise.all(presets.map((preset) => fetchChartDetail(preset)))
  const mapped = results.filter((item): item is MediaCardItem => item !== null)

  if (mapped.length === 0) {
    return [...featuredChartsFallback]
  }

  return mapped
}
