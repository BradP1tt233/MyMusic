export type MediaItemType = 'artist' | 'album' | 'playlist' | 'track'

export type MediaCardItem = {
  id: string
  title: string
  subtitle?: string
  image: string
  color?: string
  type?: MediaItemType
  /** 单曲音频地址，itemType 为 track 时使用 */
  src?: string
  /** 歌曲时长（毫秒） */
  duration?: number
  /** 所属专辑名称，曲目列表展示用 */
  albumName?: string
}

export type DiscoverSection = {
  slug: string
  title: string
  items: MediaCardItem[]
  variant?: 'square' | 'circle'
  itemType: MediaItemType
  /** 是否显示「查看全部」合集链接，默认 true */
  showCollectionLink?: boolean
}

export type LibraryPlaylistKind = 'liked' | 'created' | 'collected'

export type LibraryPlaylist = {
  id: string
  title: string
  subtitle: string
  cover: string
  kind: LibraryPlaylistKind
  pinned?: boolean
  description?: string
  /** 歌单内歌曲，封面默认取第一首 */
  tracks?: MediaCardItem[]
  /** 收藏歌单对应的远端歌单 ID（可选） */
  sourcePlaylistId?: string
  /** 网易云歌单 ID，用于 create/delete/tracks 等接口 */
  remotePlaylistId?: string
  createdAt?: number
}

export type DetailEntity = {
  id: string
  title: string
  subtitle?: string
  description?: string
  cover: string
  coverVariant?: 'square' | 'circle'
  typeLabel: string
}
