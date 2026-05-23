import type { MediaCardItem } from '@/types/media'

export type PlaylistSongDto = {
  id?: number | string
  name?: string
  ar?: Array<{ id?: number; name?: string }>
  al?: {
    id?: number
    name?: string
    picUrl?: string
  }
  dt?: number
}

export type PlaylistDetailDto = {
  id?: number | string
  name?: string
  coverImgUrl?: string
  description?: string
  trackCount?: number
  creator?: {
    nickname?: string
  }
}

export type PlaylistDetailResponse = {
  code?: number
  playlist?: PlaylistDetailDto
}

export type PlaylistTracksResponse = {
  code?: number
  songs?: PlaylistSongDto[]
}

export type FetchPlaylistTracksOptions = {
  limit?: number
  offset?: number
}

export type PlaylistPageData = {
  id: string
  name: string
  cover: string
  description: string
  creatorName: string
  trackCount: number
  subtitle: string
  tracks: MediaCardItem[]
}
