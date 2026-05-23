/** 每日推荐 API 原始字段（兼容网易云及通用命名） */
export type DailyRecommendationDto = {
  id?: string | number
  name?: string
  title?: string
  songName?: string
  artist?: string
  artistName?: string
  artists?: Array<{ name?: string } | string>
  ar?: Array<{ name?: string }>
  al?: {
    picUrl?: string
    name?: string
  }
  cover?: string
  picUrl?: string
  image?: string
  albumPicUrl?: string
  src?: string
  url?: string
  songUrl?: string
  audioUrl?: string
  color?: string
}

export type DailyRecommendationResponse =
  | DailyRecommendationDto[]
  | {
      code?: number
      data?:
        | DailyRecommendationDto[]
        | {
            dailySongs?: DailyRecommendationDto[]
          }
      songs?: DailyRecommendationDto[]
      result?: DailyRecommendationDto[]
      list?: DailyRecommendationDto[]
    }

export type FetchDailyRecommendationsOptions = {
  cookie?: string
  afresh?: boolean
}

export type SongUrlResponse = {
  code?: number
  data?: Array<{
    id?: number | string
    url?: string
  }>
}
