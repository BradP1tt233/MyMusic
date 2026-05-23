import type { ChartPreset } from '@/constants/discover'

const CHART_ID_PREFIX = 'chart:'

export function buildChartCardId(preset: Pick<ChartPreset, 'chartCode' | 'targetId' | 'targetType'>) {
  return `${CHART_ID_PREFIX}${preset.chartCode}:${preset.targetId}:${preset.targetType}`
}

export function isChartCardId(id: string) {
  return id.startsWith(CHART_ID_PREFIX)
}

export function parseChartCardId(id: string): ChartPreset | null {
  if (!isChartCardId(id)) {
    return null
  }

  const body = id.slice(CHART_ID_PREFIX.length)
  const parts = body.split(':')

  if (parts.length < 3) {
    return null
  }

  const targetType = parts.pop()
  const targetId = parts.pop()
  const chartCode = parts.join(':')

  if (!chartCode || !targetId || !targetType) {
    return null
  }

  return {
    chartCode,
    targetId,
    targetType,
    fallbackTitle: '排行榜',
  }
}
