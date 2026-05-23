export type PersonalizedPlaylistDto = {
  id?: number | string
  name?: string
  picUrl?: string
  copywriter?: string
  trackCount?: number
  playCount?: number
}

export type PersonalizedPlaylistsResponse = {
  code?: number
  result?: PersonalizedPlaylistDto[]
}

export type FetchPersonalizedPlaylistsOptions = {
  limit?: number
}
