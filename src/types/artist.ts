import type { TopArtistDto } from '@/types/topArtist'
import type { MediaCardItem } from '@/types/media'

export type ArtistSongDto = {
  id?: number | string
  name?: string
  ar?: Array<{ id?: number; name?: string; alia?: string[] }>
  al?: {
    id?: number
    name?: string
    picUrl?: string
  }
  dt?: number
  alias?: string[]
  alia?: string[]
}

export type ArtistInfoDto = {
  id?: number | string
  name?: string
  picUrl?: string
  img1v1Url?: string
  alias?: string[]
  trans?: string
  musicSize?: number
  albumSize?: number
  briefDesc?: string
}

export type ArtistsResponse = {
  code?: number
  artist?: ArtistInfoDto
  hotSongs?: ArtistSongDto[]
}

export type ArtistDetailArtistDto = {
  id?: number | string
  name?: string
  cover?: string
  avatar?: string
  alias?: string[]
  transNames?: string[]
}

export type ArtistDetailResponse = {
  code?: number
  data?: {
    artist?: ArtistDetailArtistDto
    identify?: {
      imageDesc?: string
    }
  }
}

export type ArtistDescSection = {
  ti?: string
  txt?: string
}

export type ArtistDescResponse = {
  code?: number
  briefDesc?: string
  introduction?: ArtistDescSection[]
}

export type ArtistAlbumDto = {
  id?: number | string
  name?: string
  picUrl?: string
  publishTime?: number
  size?: number
  artist?: ArtistInfoDto
}

export type ArtistAlbumResponse = {
  code?: number
  hotAlbums?: ArtistAlbumDto[]
  artist?: ArtistInfoDto
}

export type SimiArtistResponse = {
  code?: number
  artists?: TopArtistDto[]
}

export type FetchArtistAlbumsOptions = {
  limit?: number
  offset?: number
}

export type ArtistPageData = {
  id: string
  name: string
  cover: string
  avatar: string
  subtitle: string
  identifyLabel?: string
  description: string
  musicSize: number
  albumSize: number
  hotTracks: MediaCardItem[]
  albums: MediaCardItem[]
  similarArtists: MediaCardItem[]
}
