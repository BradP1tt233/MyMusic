import type { ArtistAlbumDto, ArtistSongDto } from '@/types/artist'
import type { TopArtistDto } from '@/types/topArtist'
import type { SearchTypeValue } from '@/constants/search'

export type SearchDefaultDto = {
  realkeyword?: string
  showKeyword?: string
  type?: number
}

export type SearchDefaultResponse = {
  code?: number
  data?: SearchDefaultDto
}

export type SearchHotItemDto = {
  first?: string
  second?: string
  iconType?: number
}

export type SearchHotResponse = {
  code?: number
  result?: {
    hots?: SearchHotItemDto[]
  }
}

export type SearchSuggestSongDto = {
  id?: number | string
  name?: string
  artists?: Array<{ name?: string }>
  ar?: Array<{ name?: string }>
  album?: {
    name?: string
    picUrl?: string
  }
  al?: {
    name?: string
    picUrl?: string
  }
}

export type SearchSuggestPlaylistDto = {
  id?: number | string
  name?: string
  coverImgUrl?: string
  picUrl?: string
  trackCount?: number
  creator?: {
    nickname?: string
  }
}

export type SearchSuggestResult = {
  allMatch?: {
    keyword?: string
    type?: number
  }
  songs?: SearchSuggestSongDto[]
  artists?: TopArtistDto[]
  albums?: ArtistAlbumDto[]
  playlists?: SearchSuggestPlaylistDto[]
}

export type SearchSuggestResponse = {
  code?: number
  result?: SearchSuggestResult
}

export type SearchMultimatchResponse = {
  code?: number
  result?: SearchSuggestResult
}

export type SearchPlaylistDto = {
  id?: number | string
  name?: string
  coverImgUrl?: string
  picUrl?: string
  trackCount?: number
  playCount?: number
  creator?: {
    nickname?: string
  }
}

export type SearchCloudResult = {
  songs?: ArtistSongDto[]
  songCount?: number
  albums?: ArtistAlbumDto[]
  albumCount?: number
  artists?: TopArtistDto[]
  artistCount?: number
  playlists?: SearchPlaylistDto[]
  playlistCount?: number
  hasMore?: boolean
}

export type SearchCloudResponse = {
  code?: number
  result?: SearchCloudResult
}

export type FetchSearchResultsOptions = {
  keywords: string
  type?: SearchTypeValue
  limit?: number
  offset?: number
}

export type SearchPageData = {
  keywords: string
  type: SearchTypeValue
  items: import('@/types/media').MediaCardItem[]
  total: number
  hasMore: boolean
  offset: number
}
