export type SongDetailArtistDto = {
  id?: number
  name?: string
  alias?: string[]
}

export type SongDetailAlbumDto = {
  id?: number
  name?: string
  picUrl?: string
}

export type SongDetailDto = {
  id?: number | string
  name?: string
  dt?: number
  ar?: SongDetailArtistDto[]
  al?: SongDetailAlbumDto
  alia?: string[]
}

export type SongDetailResponse = {
  code?: number
  songs?: SongDetailDto[]
}
