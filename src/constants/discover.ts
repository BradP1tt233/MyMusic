export const DAILY_RECOMMENDATIONS_SLUG = 'daily-recommendations'
export const DAILY_RECOMMENDATIONS_TITLE = '每日推荐'
export const DAILY_RECOMMENDATIONS_PREVIEW_COUNT = 6

export const POPULAR_ARTISTS_SLUG = 'popular-artists'
export const POPULAR_ARTISTS_TITLE = '当红艺人'
export const POPULAR_ARTISTS_PREVIEW_COUNT = 6
export const POPULAR_ARTISTS_DEFAULT_LIMIT = 50

export const RECOMMENDED_PLAYLISTS_SLUG = 'recommended-playlists'
export const RECOMMENDED_PLAYLISTS_TITLE = '推荐歌单'
export const RECOMMENDED_PLAYLISTS_PREVIEW_COUNT = 6
export const RECOMMENDED_PLAYLISTS_DEFAULT_LIMIT = 30

export const FEATURED_CHARTS_SLUG = 'featured-charts'
export const FEATURED_CHARTS_TITLE = '精选排行榜'
export const FEATURED_CHARTS_PREVIEW_COUNT = 6
export const FEATURED_CHARTS_LIST_LIMIT = 30

export type ChartPreset = {
  chartCode: string
  targetId: string
  targetType: string
  fallbackTitle: string
}

export const FEATURED_CHART_PRESETS: ChartPreset[] = [
  {
    chartCode: 'CITY_SONG_CHART',
    targetId: '110000',
    targetType: 'CITY',
    fallbackTitle: '北京榜',
  },
  {
    chartCode: 'CITY_SONG_CHART',
    targetId: '310000',
    targetType: 'CITY',
    fallbackTitle: '上海榜',
  },
  {
    chartCode: 'CITY_SONG_CHART',
    targetId: '440100',
    targetType: 'CITY',
    fallbackTitle: '广州榜',
  },
  {
    chartCode: 'CITY_SONG_CHART',
    targetId: '440300',
    targetType: 'CITY',
    fallbackTitle: '深圳榜',
  },
  {
    chartCode: 'CITY_SONG_CHART',
    targetId: '330100',
    targetType: 'CITY',
    fallbackTitle: '杭州榜',
  },
  {
    chartCode: 'CITY_STYLE_SONG_CHART',
    targetId: '110000_1020',
    targetType: 'CITY_STYLE',
    fallbackTitle: '北京华语流行榜',
  },
]
