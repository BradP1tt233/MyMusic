import type { ChartPreset } from '@/constants/discover'

export type ChartDetailDto = {
  chartCode?: string
  chartId?: string
  name?: string
  coverUrl?: string
  description?: string
  updateTime?: number
}

export type ChartDetailResponse = {
  code?: number
  data?: ChartDetailDto
}

export type ChartSongDto = {
  id?: number | string
  name?: string
  ar?: Array<{ name?: string }>
  al?: {
    picUrl?: string
    name?: string
    extProperties?: { picUrl?: string }
    xInfo?: { picUrl?: string }
  }
}

export type ChartListItemDto = {
  songData?: ChartSongDto
  reason?: string
}

export type ChartListResponse = {
  code?: number
  data?: {
    charts?: ChartListItemDto[]
    chartCode?: string
    chartId?: string
  }
}

export type FetchChartDetailOptions = ChartPreset

export type FetchChartListOptions = ChartPreset & {
  limit?: number
  offset?: number
}
