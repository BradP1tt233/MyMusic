export type TopArtistDto = {
  id?: number | string
  name?: string
  picUrl?: string
  img1v1Url?: string
  alias?: string[]
  transNames?: string[] | null
  briefDesc?: string
}

export type TopArtistsResponse = {
  code?: number
  more?: boolean
  artists?: TopArtistDto[]
}

export type FetchTopArtistsOptions = {
  limit?: number
  offset?: number
}
